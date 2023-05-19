/**
 * @file This types-only file contains types related to calling one HTTP endpoint.
 */

/* eslint-disable @typescript-eslint/ban-types */
import type * as protocol from "@ty-ras/protocol";
import type * as data from "@ty-ras/data";

/**
 * This is signature to call one HTTP endpoint.
 */
export type APICall<TArgs, TReturnType> = (
  this: void,
  args: protocol.RuntimeOf<TArgs>,
) => Promise<APICallResult<protocol.RuntimeOf<TReturnType>>>;

/**
 * This type represents a result of calling one HTTP endpoint - either {@link APICallResultSuccess} or {@link APICallResultError}.
 */
export type APICallResult<TReturnType> =
  | APICallResultSuccess<TReturnType>
  | APICallResultError;

/**
 * This type represents result of a successful call to one HTTP endpoint, with the data returned by the endpoint deserialized.
 */
export type APICallResultSuccess<TReturnType> =
  data.DataValidatorResultSuccess<TReturnType>;

/**
 * This type represents result of an unsuccessful call to one HTTP endpoint: either the input was deemed to be invalid, or the output was deemed to be invalid.
 * @see APICallResultInputError
 * @see APICallResultBackendError
 */
export type APICallResultError =
  | APICallResultBackendError
  | APICallResultInputError;

/**
 * This type represents result of an unsuccessful call to one HTTP endpoint, when the data returned by backend did not pass validation.
 */
export type APICallResultBackendError = data.DataValidatorResultError;

/**
 * This type represents result of an unsuccessful call to one HTTP endpoint, when the data given as input for the HTTP endpoint did not pass validation.
 * The HTTP request in this case would not have been sent.
 */
export type APICallResultInputError = {
  /**
   * The disciminating type property identifying this type.
   */
  error: "error-input";
  /**
   * Information about the errors occurred in the validating data.
   */
  errorInfo: Partial<{
    [P in "method" | "url" | "query" | "body"]: data.ValidationChainError;
  }>;
};

/**
 * This is helper type to extract the {@link APICall} type with generic parameters, given the protocol endpoint type as generic parameter.
 * @see protocol.ProtocolSpecCore
 */
export type GetAPICall<
  TProtocolSpec extends protocol.ProtocolSpecCore<string, unknown>,
> = APICall<
  TProtocolSpec extends protocol.ProtocolSpecCore<string, unknown> & {
    [P in keyof (protocol.ProtocolSpecURL<Record<string, unknown>> &
      protocol.ProtocolSpecHeaderData<Record<string, unknown>> &
      protocol.ProtocolSpecQuery<Record<string, unknown>> &
      protocol.ProtocolSpecRequestBody<unknown>)]?: never;
  }
    ? void
    : {} & (TProtocolSpec extends protocol.ProtocolSpecURL<infer TURLData>
        ? { url: TURLData }
        : {}) &
        (TProtocolSpec extends protocol.ProtocolSpecHeaderData<
          infer THeaderData
        >
          ? { headers: THeaderData }
          : {}) &
        (TProtocolSpec extends protocol.ProtocolSpecQuery<infer TQueryData>
          ? { query: TQueryData }
          : {}) &
        (TProtocolSpec extends protocol.ProtocolSpecRequestBody<infer TBodyData>
          ? { body: TBodyData }
          : {}),
  GetProtocolReturnType<TProtocolSpec>
>;

/**
 * This is helper type to extract the return type of {@link APICall} of the protocol endpoint type.
 * @see protocol.ProtocolSpecCore
 */
export type GetProtocolReturnType<
  TProtocolSpec extends protocol.ProtocolSpecCore<string, unknown>,
> = TProtocolSpec extends protocol.ProtocolSpecResponseHeaders<infer THeaders>
  ? {
      body: TProtocolSpec["responseBody"];
      headers: THeaders;
    }
  : TProtocolSpec["responseBody"];

/**
 * This is helper type to transform a record of protocol endpoint types into a record of {@link APICall}s.
 * @see protocol.ProtocolSpecCore
 */
export type GetAPICalls<
  T extends Record<string, protocol.ProtocolSpecCore<string, unknown>>,
> = {
  [P in keyof T]: GetAPICall<T[P]>;
};
