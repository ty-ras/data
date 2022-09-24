/* eslint-disable @typescript-eslint/ban-types */
import type * as protocol from "@ty-ras/protocol";
import type * as data from "@ty-ras/data";

export type APICall<TArgs, TReturnType> = (
  args: protocol.RuntimeOf<TArgs>,
) => Promise<APICallResult<TReturnType>>;

export type APICallResult<TReturnType> =
  | data.DataValidatorResult<protocol.RuntimeOf<TReturnType>>
  | {
      error: "error-input";
      errorInfo: Partial<{
        [P in "method" | "url" | "query" | "body"]: data.ValidationChainError;
      }>;
    };

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

export type GetProtocolReturnType<
  TProtocolSpec extends protocol.ProtocolSpecCore<string, unknown>,
> = TProtocolSpec extends protocol.ProtocolSpecResponseHeaders<infer THeaders>
  ? {
      body: TProtocolSpec["responseBody"];
      headers: THeaders;
    }
  : TProtocolSpec["responseBody"];

export type GetAPICalls<
  T extends Record<string, protocol.ProtocolSpecCore<string, unknown>>,
> = {
  [P in keyof T]: GetAPICall<T[P]>;
};
