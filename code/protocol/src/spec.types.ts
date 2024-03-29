/**
 * @file This file contains types that may be used when specifying HTTP endpoint types.
 * Most of these interfaces need not to be extended/used directly, but they are used by TyRAS libraries in auxiliary types, which deduce HTTP endpoint callback input (URL parameters, query parameters, return type, etc).
 */

import type * as methods from "./methods";

/**
 * This interface specifies the mandatory properties of HTTP endpoint type.
 * @see ProtocolSpecHeaderFunctionality
 * @see ProtocolSpecURL
 * @see ProtocolSpecQuery
 * @see ProtocolSpecHeaderData
 * @see ProtocolSpecRequestBody
 * @see ProtocolSpecResponseHeaders
 */
export interface ProtocolSpecCore<TMethod extends methods.HttpMethod, TOutput> {
  /**
   * The HTTP method accepted by the endpoint.
   */
  method: TMethod;
  /**
   * The type of the response returned by the method.
   */
  responseBody: TOutput;
}

/**
 * This interface specifies the optional property of HTTP endpoint type, when it accepts some header functionality.
 * Notice that header functionality in this context means some action based on HTTP request headers.
 * It does not mean that the associated header data will be passed to the endpoint.
 *
 * Typical usecase for this is authentication: `headers: { Authorization: "auth"; }` will mean that HTTP header `Authorization` will be passed to some functionality identified by `"auth"` string.
 * That functionality is intentionally not specified in other way here - instead the TyRAS code will pass the correct header value to the functionality in question, and make sure the functionality will not fail.
 */
export interface ProtocolSpecHeaderFunctionality<
  THeaders extends Record<string, string>,
> {
  /**
   * The header functionality specification.
   * Key: header name.
   * Value: functionality ID.
   * Header value will not be visible in actual HTTP endpoint callback.
   */
  headerFunctionality: THeaders;
}

/**
 * This interface specifies the optional property of HTTP endpoint type, when it extracts some data from URL path.
 * This data will be passed to the endpoint.
 */
export interface ProtocolSpecURL<TURLData extends TURLDataBase> {
  /**
   * The URL data specification.
   * Key: URL parameter name.
   * Value: data type.
   */
  url: TURLData;
}

/**
 * This interface specifies the optional property of HTTP endpoint type, when it extracts some data from URL query.
 * This data will be passed to the endpoint.
 */
export interface ProtocolSpecQuery<TQueryData extends TQueryDataBase> {
  /**
   * The query data specification.
   * Key: Query parameter name.
   * Value: data type.
   */
  query: TQueryData;
}

/**
 * This interface specifices the optional property of the HTTP endpoint type, when it extracts some data from HTTP request headers.
 * This data will be passed to the endpoint.
 */
export interface ProtocolSpecHeaderData<
  THeaderData extends TRequestHeadersDataBase,
> {
  /**
   * The HTTP request header data specification.
   * Key: header name.
   * Value: data type.
   */
  headerData: THeaderData;
}

/**
 * This interface specifies the optional property of the HTTP endpoint type, when it deserializes the HTTP request body.
 * This data will be passed to the endpoint.
 */
export interface ProtocolSpecRequestBody<TInput> {
  /**
   * The request body type.
   */
  requestBody: TInput;
}

/**
 * This interface specifies the optional property of the HTTP endpoint type, when it returns some data as HTTP response headers.
 * This data will be written to HTTP response headers.
 */
export interface ProtocolSpecResponseHeaders<
  THeaderData extends TResponseHeadersDataBase,
> {
  /**
   * The HTTP response header data specification.
   * Key: header name.
   * Value: data type.
   */
  responseHeaders: THeaderData;
}

/**
 * This is not "URL database", this is "base for the URL data".
 * It specifices the constraint for generic argument of {@link ProtocolSpecURL}.
 */
export type TURLDataBase = TTextualDataBase;

/**
 * This is not "query database", this is "base for the query data".
 * It specifices the constraint for generic argument of {@link ProtocolSpecQuery}.
 */
export type TQueryDataBase = TTextualDataBase;

/**
 * This is not "request headers database", this is "base for the request headers data".
 * It specifices the constraint for generic argument of {@link ProtocolSpecHeaderData}.
 */
export type TRequestHeadersDataBase = TTextualDataBase;

/**
 * This is not "response headers database", this is "base for the response headers data".
 * It specifices the constraint for generic argument of {@link ProtocolSpecResponseHeaders}.
 */
export type TResponseHeadersDataBase = TTextualDataBase;

/**
 * This is not "textual database", this is "base for the textual data".
 * It specifices the constraint for URL, query, request headers, or response headers data.
 */
export type TTextualDataBase = Record<string, unknown>;
