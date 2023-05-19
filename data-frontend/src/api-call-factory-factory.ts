/**
 * @file This file contains method to create {@link apiCallFactory.APICallFactoryBase} instances.
 */

import type * as protocol from "@ty-ras/protocol";
import * as data from "@ty-ras/data";
import type * as apiCall from "./api-call.types";
import type * as apiCallFactory from "./api-call-factory.types";

/**
 * Function to create objects which can create {@link apiCall.APICallFactoryBase} callbacks.
 * This function is meant to be used by other TyRAS libraries, and not directly by client code.
 * @param callHttpEndpoint The callback to perform sending HTTP request and receiving HTTP response.
 * @returns An object with `withHeaders` function, which will then return the {@link apiCall.APICallFactoryBase} callbacks.
 */
export const createAPICallFactoryGeneric = <
  THKTEncoded extends protocol.HKTEncodedBase,
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
        TProtocolSpec extends protocol.ProtocolSpecCore<string, unknown>,
      >({
        method,
        response,
        url,
        ...rest
      }:
        | (apiCallFactory.MakeAPICallArgs<
            TProtocolSpec["method"],
            TProtocolSpec["responseBody"]
          > &
            (
              | apiCallFactory.MakeAPICallArgsURL
              | apiCallFactory.MakeAPICallArgsURLData<unknown>
            )) &
            // eslint-disable-next-line @typescript-eslint/ban-types
            (| {}
              | apiCallFactory.MakeAPICallArgsHeadersData<
                  Record<string, unknown>
                >
              | apiCallFactory.MakeAPICallArgsHeadersFunctionality<
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
        if ("headersFunctionality" in rest) {
          const missingHeaders = Object.values(
            rest.headersFunctionality,
          ).filter((headerFunctionality) => !(headerFunctionality in headers));
          if (missingHeaders.length > 0) {
            throw new Error(
              `The endpoint requires the following header functionality, missing from given header functionality: ${missingHeaders.join(
                ", ",
              )}.`,
            );
          }
        }
        const componentValidations = data
          .newCombiner()
          .withValidator(
            "url",
            typeof url === "string"
              ? data.transitiveDataValidation(
                  undefinedValidator,
                  returnURL(url),
                )
              : url,
          )
          .withValidator(
            "headers",
            "headers" in rest
              ? (rest.headers as data.DataValidator<
                  unknown,
                  Record<string, data.HeaderValue>,
                  DataValidatorError<typeof undefinedValidator>
                >)
              : undefined,
          )
          .withValidator(
            "query",
            "query" in rest
              ? (rest.query as data.DataValidator<
                  unknown,
                  Record<string, data.OneOrMany<string | number | boolean>>,
                  DataValidatorError<typeof undefinedValidator>
                >)
              : undefined,
          )
          .withValidator("body", "body" in rest ? rest.body : undefined);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return (async (
          args: void | protocol.RuntimeOf<
            Partial<
              Record<"method" | "url" | "query" | "body" | "headers", unknown>
            >
          >,
        ) => {
          const validatedArgs = componentValidations.getOutputs({
            ...(args ?? {}),
            url: args ? args.url : undefined,
          });
          if (validatedArgs.error === "none") {
            const httpArgs: HTTPInvocationArguments = {
              method,
              ...validatedArgs.data,
            };
            if ("headers" in rest) {
              httpArgs.headers = validatedArgs.data.headers;
            }
            if ("headersFunctionality" in rest) {
              httpArgs.headers = Object.assign(
                httpArgs.headers ?? {},
                Object.fromEntries(
                  await Promise.all(
                    Object.entries(rest.headersFunctionality).map(
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
                return body.error === "none"
                  ? {
                      error: "none",
                      data: {
                        body: body.data,
                        headers: responseHeaders.data,
                      },
                    }
                  : body;
              } else {
                return responseHeaders;
              }
            } else {
              return response(rawBody);
            }
          } else {
            return {
              error: "error-input",
              errorInfo: validatedArgs.errorInfo,
            };
          }
          // TODO fix this 'as any' at some point
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any;
      },
    }),
  };
};

/**
 * This signature is for callbacks which should provide the values for the HTTP request header, which is not data- but functionality-related (e.g. authentication).
 */
export type HeaderProvider = (
  args: Omit<HTTPInvocationArguments, "headersFunctionality"> & {
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

type DataValidatorError<T> = T extends data.DataValidator<
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  infer _,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  infer _1,
  infer TError
>
  ? TError
  : never;

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
