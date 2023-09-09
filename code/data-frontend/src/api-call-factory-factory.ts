/**
 * @file This file contains method to create {@link apiCallFactory.APICallFactoryBase} instances.
 */

import type * as protocol from "@ty-ras/protocol";
import * as data from "@ty-ras/data";
import type * as apiCall from "./api-call.types";
import type * as apiCallFactory from "./api-call-factory.types";

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */

/**
 * Function to create objects which can create {@link apiCall.APICallFactoryBase} callbacks.
 * This function is meant to be used by other TyRAS libraries, and not directly by client code.
 * @param callHttpEndpoint The callback to perform sending HTTP request and receiving HTTP response.
 * @returns An object with `withHeaders` function, which will then return the {@link apiCall.APICallFactoryBase} callbacks.
 */
export const createAPICallFactoryGeneric = <
  THKTEncoded extends protocol.EncodedHKTBase,
>(
  callHttpEndpoint: CallHTTPEndpoint,
): {
  withHeaders: <THeaders extends Record<string, HeaderProvider>>(
    headers: THeaders,
  ) => apiCallFactory.APICallFactoryBase<THKTEncoded, keyof THeaders & string>;
} => {
  return {
    // TODO: Fix this overly complex function
    // eslint-disable-next-line sonarjs/cognitive-complexity
    withHeaders: (headers) => ({
      makeAPICall: <
        TProtocolSpec extends protocol.ProtocolSpecCore<
          protocol.HttpMethod,
          unknown
        >,
      >({
        method,
        response,
        url,
        ...rest
      }: (apiCallFactory.MakeAPICallArgs<
        TProtocolSpec["method"],
        TProtocolSpec["responseBody"]
      > &
        (
          | apiCallFactory.MakeAPICallArgsURL
          | apiCallFactory.MakeAPICallArgsURLData<unknown>
        )) &
        // eslint-disable-next-line @typescript-eslint/ban-types
        (| {}
          | apiCallFactory.MakeAPICallArgsHeadersData<Record<string, unknown>>
          | apiCallFactory.MakeAPICallArgsHeaderFunctionality<
              Record<string, string>
            >
          | apiCallFactory.MakeAPICallArgsResponseHeaders<
              Record<string, unknown>
            >
          | apiCallFactory.MakeAPICallArgsQuery<
              THKTEncoded,
              Record<string, unknown>
            >
          | apiCallFactory.MakeAPICallArgsBody<THKTEncoded, unknown>
        )): apiCall.APICall<
        Partial<
          Record<"method" | "url" | "query" | "body" | "headers", unknown>
        > | void,
        TProtocolSpec extends protocol.ProtocolSpecResponseHeaders<
          infer THeaders
        >
          ? {
              body: TProtocolSpec["responseBody"];
              headers: THeaders;
            }
          : TProtocolSpec["responseBody"]
      > => {
        if ("headerFunctionality" in rest) {
          const missingHeaders = Object.values(rest.headerFunctionality).filter(
            (functionality) => !(functionality in headers),
          );
          if (missingHeaders.length > 0) {
            throw new Error(
              `The endpoint requires the following header functionality, missing from given header functionality: ${missingHeaders.join(
                ", ",
              )}.`,
            );
          }
        }
        const componentValidations = {
          url:
            typeof url === "string"
              ? data.transitiveDataValidation(
                  undefinedValidator,
                  returnURL(url),
                )
              : url,
          ...pick<
            Partial<
              apiCallFactory.MakeAPICallArgsHeadersData<
                Record<string, unknown>
              > &
                apiCallFactory.MakeAPICallArgsQuery<
                  THKTEncoded,
                  Record<string, unknown>
                > &
                apiCallFactory.MakeAPICallArgsBody<THKTEncoded, unknown>
            >,
            "headers" | "query" | "body"
          >(rest as any, "headers", "query", "body"),
        };

        return async (args) => {
          let retVal: apiCall.APICallResult<
            protocol.RuntimeOf<apiCall.GetProtocolReturnType<TProtocolSpec>>
          >;
          const validatedArgs = data.transformEntries(
            componentValidations,
            (componentValidation, componentValidationName) =>
              componentValidation?.(args?.[componentValidationName] as any),
          );
          const validatedArgsResult = traverseValidatorResults(validatedArgs);
          if (validatedArgsResult.error === "none") {
            const httpArgs: HTTPInvocationArguments = {
              method,
              ...validatedArgsResult.data,
            };
            if ("headerFunctionality" in rest) {
              httpArgs.headers = Object.assign(
                httpArgs.headers ?? {},
                Object.fromEntries(
                  await Promise.all(
                    Object.entries(rest.headerFunctionality).map(
                      async ([headerName, headerFunctionalityID]) =>
                        [
                          headerName,
                          await headers[headerFunctionalityID]({
                            ...httpArgs,
                            headerName,
                          }),
                        ] as const,
                    ),
                  ),
                ),
              );
            }
            const { body: rawBody, headers: responseHeadersRaw } =
              await callHttpEndpoint(httpArgs);
            if ("responseHeaders" in rest) {
              const responseHeaders = rest.responseHeaders(
                responseHeadersRaw ?? {},
              );
              if (responseHeaders.error === "none") {
                const body = response(rawBody);
                retVal =
                  body.error === "none"
                    ? {
                        error: "none",
                        data: {
                          body: body.data,
                          headers: responseHeaders.data,
                        } as any,
                      }
                    : body;
              } else {
                retVal = responseHeaders;
              }
            } else {
              retVal = response(rawBody) as any;
            }
          } else {
            retVal = {
              error: "error-input",
              errorInfo: validatedArgsResult.errorInfo,
            };
          }
          return retVal;
        };
      },
    }),
  };
};

/**
 * This signature is for callbacks which should provide the values for the HTTP request header, which is not data- but functionality-related (e.g. authentication).
 */
export type HeaderProvider = (
  args: Omit<HTTPInvocationArguments, "headerFunctionality"> & {
    headerName: string;
  },
) => string | PromiseLike<string>;

/**
 * This signature is for callbacks which should send HTTP request and return HTTP response.
 */
export type CallHTTPEndpoint = (
  args: HTTPInvocationArguments,
) => Promise<HTTPInvocationResult>;

/**
 * This data type contains all information needed to send HTTP request.
 */
export interface HTTPInvocationArguments {
  /**
   * The HTTP method to use in the request.
   */
  method: string;
  /**
   * The URL path to use in the request.
   */
  url: string;
  /**
   * The query parameters to use in the request.
   */
  query?: Record<string, unknown>;
  /**
   * The body to use in the request.
   */
  body?: unknown;
  /**
   * The headers to use in the request.
   */
  headers?: Record<string, unknown>;
}

/**
 * This data type contains all information about the HTTP response before data validators start to process it.
 */
export type HTTPInvocationResult = {
  /**
   * The HTTP response body.
   */
  body: unknown;
  /**
   * The HTTP response headers.
   */
  headers?: Record<string, data.HeaderValue>;
};

const undefinedValidator: data.DataValidator<unknown, undefined> = (data) =>
  data === undefined
    ? { error: "none", data }
    : { error: "error", errorInfo: data, getHumanReadableMessage: () => "" };

const returnURL =
  (url: string): data.DataValidator<undefined, string> =>
  () => ({
    error: "none",
    data: url,
  });

const pick = <T extends object, TKey extends keyof T>(
  obj: T,
  ...keys: ReadonlyArray<TKey>
) => {
  return Object.fromEntries(
    keys.filter((key) => key in obj).map((key) => [key, obj[key]]),
  ) as Pick<T, TKey>;
};

// Kinda like fp-ts's traverse/apply but for record of data validator outputs
const traverseValidatorResults = (
  result: Partial<
    Record<
      "url" | "query" | "headers" | "body",
      data.DataValidatorResult<any> | undefined
    >
  >,
):
  | apiCall.APICallResultInputError
  | data.DataValidatorResultSuccess<
      Omit<HTTPInvocationArguments, "method">
    > => {
  const entries = Object.entries(result);
  return entries.every(([, result]) => result?.error === "none")
    ? {
        error: "none",
        data: Object.fromEntries(
          entries.map(([key, result]) => [
            key,
            (result as data.DataValidatorResultSuccess<any>).data,
          ]),
        ) as any,
      }
    : {
        error: "error-input",
        errorInfo: Object.fromEntries(
          entries.filter(([, result]) => result?.error !== "none"),
        ),
      };
};
