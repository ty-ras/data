/**
 * @file This type-only file contains types related to values of HTTP headers and query structure.
 */

/**
 * Type describing various string values in HTTP queries or headers.
 * The values are assumed to be parsed from raw HTTP request/response, and multiple header/query name values to be transformed from `string` to `Array<string>`.
 * @see HeaderValue
 * @see QueryValue
 * @see ReadonlyStringValue
 */
export type StringValue = string | Array<string> | undefined;

/**
 * Type describing various string values in HTTP headers.
 * Currently it is exactly same as {@link StringValue}.
 */
export type HeaderValue = StringValue;

/**
 * Type describing various string values in HTTP query.
 * Currently it is exactly same as {@link StringValue}.
 */
export type QueryValue = StringValue;

/**
 * Type describing various string values in HTTP queries or headers.
 * The values are assumed to be parsed from raw HTTP request/response, and multiple header/query name values to be transformed from `string` to `ReadonlyArray<string>`.
 * This value is designed to be used in readonly context.
 * @see ReadonlyHeaderValue
 * @see ReadonlyQueryValue
 * @see StringValue
 */
export type ReadonlyStringValue = string | ReadonlyArray<string> | undefined;

/**
 * Type describing various string values in HTTP headers.
 * Currently it is exactly same as {@link ReadonlyStringValue}.
 */
export type ReadonlyHeaderValue = ReadonlyStringValue;

/**
 * Type describing various string values in HTTP headers.
 * Currently it is exactly same as {@link ReadonlyStringValue}.
 */
export type ReadonlyQueryValue = ReadonlyStringValue;
