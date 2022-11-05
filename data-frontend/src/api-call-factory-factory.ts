import type * as protocol from "@ty-ras/protocol";
import * as data from "@ty-ras/data";
import type * as apiCall from "./api-call";
import type * as apiCallFactory from "./api-call-factory";

export const createAPICallFactoryGeneric = <
  THKTEncoded extends protocol.HKTEncodedBase,
>(
  callHttpEndpoint: CallHTTPEndpoint,
): {
  withHeaders: <THeaders extends Record<string, HeaderProvider>>(
    headers: THeaders,
  ) => apiCallFactory.APICallFactory<THKTEncoded, keyof THeaders & string>;
} => {
  return {
    // TODO: Fix this overly complex function
    // eslint-disable-next-line sonarjs/cognitive-complexity
    withHeaders: (headers) => ({
      makeAPICall: <
        TProtocolSpec extends protocol.ProtocolSpecCore<string, unknown>,
      >(
        methodValue: TProtocolSpec["method"],
        {
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
              ),
      ): apiCall.APICall<
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
        const validatedMethod = method(methodValue);
        if (validatedMethod.error !== "none") {
          throw new Error(
            `Invalid method: ${JSON.stringify(validatedMethod.errorInfo)}.`,
          );
        }
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
          args: void | protocol.GetRuntimeObject<
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
              method: validatedMethod.data,
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

export type HeaderProvider = (
  args: Omit<HTTPInvocationArguments, "headersFunctionality"> & {
    headerName: string;
  },
) => string | PromiseLike<string>;

export type CallHTTPEndpoint = (
  args: HTTPInvocationArguments,
) => Promise<HTTPInvocationResult>;

export interface HTTPInvocationArguments {
  method: string;
  url: string;
  query?: Record<string, unknown>;
  body?: unknown;
  headers?: Record<string, unknown>;
}

export type HTTPInvocationResult = {
  body: unknown;
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
