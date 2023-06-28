/**
 * @file This file contains types and constants related to HTTP protocol methods.
 */
import * as protocol from "@ty-ras/protocol";
/**
 * String constant type for HTTP methods, which have request body.
 */
export type HttpMethodWithoutBody = keyof typeof HttpMethodsWithoutBody;

/**
 * String constant type for HTTP methods, which don't have request body.
 */
export type HttpMethodWithBody = Exclude<
  protocol.HttpMethod,
  HttpMethodWithoutBody
>;

/**
 * Checks whether given HTTP method is without request body.
 * @param method The HTTP method, one of type {@link HttpMethod}.
 * @returns `true` is method is `"TRACE"`, `"GET"`, `"OPTIONS"`, or `"HEAD"`.
 */
export const isMethodWithoutRequestBody = (
  method: protocol.HttpMethod,
): method is HttpMethodWithoutBody => method in HttpMethodsWithoutBody;

const HttpMethodsWithoutBody = {
  [protocol.METHOD_TRACE]: true,
  [protocol.METHOD_GET]: true,
  [protocol.METHOD_OPTIONS]: true,
  [protocol.METHOD_HEAD]: true,
} as const;
