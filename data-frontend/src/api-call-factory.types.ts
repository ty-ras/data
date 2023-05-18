/**
 * @file This types-only file contains types related to creating {@link apiCall.APICall} objects.
 */
/* eslint-disable @typescript-eslint/ban-types */
import type * as protocol from "@ty-ras/protocol";
import type * as data from "@ty-ras/data";
import type * as apiCall from "./api-call.types";

/**
 * This is base type for types creating {@link apiCall.APICall}s.
 * It is meant to be used by other TyRAS libraries (to lock down first generic argument) and not directly by client code.
 */
export interface APICallFactoryBase<
  THKTEncoded extends protocol.HKTEncodedBase,
  THeaders extends string,
> {
  /**
   * Creates new API call callback for protocol endpoint type.
   * Please use explicit generic argument when calling this method: `.makeAPICall<myProtocol.GetSomeData>(...)`.
   * @param args The arguments as specified by {@link protocol.ProtocolSpecCore} generic argument.
   */
  makeAPICall<TProtocolSpec extends protocol.ProtocolSpecCore<string, unknown>>(
    args: MakeAPICallArgs<
      TProtocolSpec["method"],
      TProtocolSpec["responseBody"]
    > &
      (TProtocolSpec extends protocol.ProtocolSpecURL<infer TURLData>
        ? MakeAPICallArgsURLData<TURLData>
        : MakeAPICallArgsURL) &
      (TProtocolSpec extends protocol.ProtocolSpecHeaderData<infer THeaderData>
        ? MakeAPICallArgsHeadersData<THeaderData>
        : {}) &
      (TProtocolSpec extends protocol.ProtocolSpecQuery<infer TQueryData>
        ? MakeAPICallArgsQuery<THKTEncoded, TQueryData>
        : {}) &
      (TProtocolSpec extends protocol.ProtocolSpecRequestBody<infer TBodyData>
        ? MakeAPICallArgsBody<THKTEncoded, TBodyData>
        : {}) &
      (TProtocolSpec extends protocol.ProtocolSpecHeaders<
        Record<string, THeaders>
      >
        ? MakeAPICallArgsHeadersFunctionality<TProtocolSpec["headers"]>
        : {}) &
      (TProtocolSpec extends protocol.ProtocolSpecResponseHeaders<
        infer TResponseHeaders
      >
        ? MakeAPICallArgsResponseHeaders<TResponseHeaders>
        : {}),
  ): apiCall.GetAPICall<TProtocolSpec>;
}

/**
 * This is helper type to create type with given method and response body validator.
 */
export interface MakeAPICallArgs<TMethod, TResponse> {
  /**
   * The HTTP method to validate against.
   */
  method: TMethod;
  /**
   * The {@link data.DataValidator} for HTTP response body.
   */
  response: data.DataValidator<unknown, protocol.RuntimeOf<TResponse>>;
}

/**
 * This is helper type to create type with given request header _functionality_ (e.g. authentication based on `Authorization` request header value).
 * This is different thing than request header _data_ validation, for that see {@link MakeAPICallArgsHeadersData}.
 */
export interface MakeAPICallArgsHeadersFunctionality<
  THeaders extends Record<string, string>,
> {
  /**
   * The dictionary, where key is the request header name, and value is the name of the functionality to use, if the header is present in the HTTP request.
   * For example, a key could be `Authorization` and value `auth`.
   */
  headersFunctionality: THeaders;
}

/**
 * This is helper type to create type with given request header _data_ validation.
 * This is different thing than request header _functionality_.
 */
export interface MakeAPICallArgsHeadersData<
  THeaders extends Record<string, unknown>,
> {
  /**
   * The {@link data.DataValidator} for the HTTP request headers.
   */
  headers: data.DataValidator<
    protocol.RuntimeOf<THeaders>,
    {
      [P in keyof THeaders]: data.OneOrMany<
        string | number | boolean | undefined
      >;
    }
  >;
}

/**
 * This is helper type to create type with given response header data validation.
 */
export interface MakeAPICallArgsResponseHeaders<
  THeaders extends Record<string, unknown>,
> {
  /**
   * The {@link data.DataValidator} for the HTTP response headers.
   */
  responseHeaders: data.DataValidator<
    {
      [P in keyof THeaders]: data.OneOrMany<
        string | number | boolean | undefined
      >;
    },
    protocol.RuntimeOf<THeaders>
  >;
}

/**
 * Helper type to make type with specific static URL path string.
 */
export interface MakeAPICallArgsURL {
  /**
   * The static URL path string.
   */
  url: string;
}

/**
 * Helper type to make type with parameters embedded in URL path string.
 * The parameters should be named objects as input.
 */
export interface MakeAPICallArgsURLData<TURLData> {
  /**
   * The {@link data.DataValidator} which accepts the URL path parameters as named object, and produces a URL path string as output if validation passes successfully.
   */
  url: data.DataValidator<protocol.RuntimeOf<TURLData>, string>;
}

/**
 * Helper type to make type with query parameters.
 */
export interface MakeAPICallArgsQuery<
  THKTEncoded extends protocol.HKTEncodedBase,
  TQueryData,
> {
  /**
   * The {@link data.DataValidator} for the query parameters.
   */
  query: data.DataValidator<
    protocol.RuntimeOf<TQueryData>,
    protocol.EncodedOf<THKTEncoded, TQueryData>
  >;
}

/**
 * Helper type to make type with HTTP request body.
 */
export interface MakeAPICallArgsBody<
  THKTEncoded extends protocol.HKTEncodedBase,
  TBodyData,
> {
  /**
   * The {@link data.DataValidator} for the HTTP request body.
   */
  body: data.DataValidator<
    protocol.RuntimeOf<TBodyData>,
    protocol.EncodedOf<THKTEncoded, TBodyData>
  >;
}
