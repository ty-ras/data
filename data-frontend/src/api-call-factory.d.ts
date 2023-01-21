/* eslint-disable @typescript-eslint/ban-types */
import type * as protocol from "@ty-ras/protocol";
import type * as data from "@ty-ras/data";
import type * as apiCall from "./api-call";

export interface APICallFactory<
  THKTEncoded extends protocol.HKTEncodedBase,
  THeaders extends string,
> {
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

export interface MakeAPICallArgs<TMethod, TResponse> {
  method: TMethod;
  response: data.DataValidator<unknown, protocol.RuntimeOf<TResponse>>;
}

// For passing things like authentication via headers
export interface MakeAPICallArgsHeadersFunctionality<
  THeaders extends Record<string, string>,
> {
  headersFunctionality: THeaders;
}

// For passing data via headers
export interface MakeAPICallArgsHeadersData<
  THeaders extends Record<string, unknown>,
> {
  headers: data.DataValidator<
    protocol.RuntimeOf<THeaders>,
    {
      [P in keyof THeaders]: data.OneOrMany<
        string | number | boolean | undefined
      >;
    }
  >;
}

export interface MakeAPICallArgsResponseHeaders<
  THeaders extends Record<string, unknown>,
> {
  responseHeaders: data.DataValidator<
    {
      [P in keyof THeaders]: data.OneOrMany<
        string | number | boolean | undefined
      >;
    },
    protocol.RuntimeOf<THeaders>
  >;
}

export interface MakeAPICallArgsURL {
  url: string;
}

export interface MakeAPICallArgsURLData<TURLData> {
  url: data.DataValidator<protocol.RuntimeOf<TURLData>, string>;
}

export interface MakeAPICallArgsQuery<
  THKTEncoded extends protocol.HKTEncodedBase,
  TQueryData,
> {
  query: data.DataValidator<
    protocol.RuntimeOf<TQueryData>,
    protocol.EncodedOf<THKTEncoded, TQueryData>
  >;
}

export interface MakeAPICallArgsBody<
  THKTEncoded extends protocol.HKTEncodedBase,
  TBodyData,
> {
  body: data.DataValidator<
    protocol.RuntimeOf<TBodyData>,
    protocol.EncodedOf<THKTEncoded, TBodyData>
  >;
}
