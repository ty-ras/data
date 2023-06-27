/**
 * @file This file contains types and constants related to HTTP protocol methods.
 */

/**
 * String constant type for HTTP methods.
 */
export type HttpMethod =
  | typeof METHOD_GET
  | typeof METHOD_HEAD
  | typeof METHOD_POST
  | typeof METHOD_PUT
  | typeof METHOD_PATCH
  | typeof METHOD_DELETE
  | typeof METHOD_OPTIONS
  | typeof METHOD_TRACE;

/**
 * String constant for HTTP method GET: `"GET"`.
 */
export const METHOD_GET = "GET";

/**
 * String constant for HTTP method HEAD: `"HEAD"`.
 */
export const METHOD_HEAD = "HEAD";

/**
 * String constant for HTTP method POST: `"POST"`.
 */
export const METHOD_POST = "POST";

/**
 * String constant for HTTP method PUT: `"PUT"`.
 */
export const METHOD_PUT = "PUT";

/**
 * String constant for HTTP method PATCH: `"PATCH"`.
 */
export const METHOD_PATCH = "PATCH";

/**
 * String constant for HTTP method DELETE: `"DELETE"`.
 */
export const METHOD_DELETE = "DELETE";

/**
 * String constant for HTTP method OPTIONS: `"OPTIONS"`.
 */
export const METHOD_OPTIONS = "OPTIONS";

/**
 * String constant for HTTP method TRACE: `"TRACE"`.
 */
export const METHOD_TRACE = "TRACE";
