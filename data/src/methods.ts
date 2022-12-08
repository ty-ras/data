export type HttpMethod =
  | typeof METHOD_GET
  | typeof METHOD_HEAD
  | typeof METHOD_POST
  | typeof METHOD_PUT
  | typeof METHOD_PATCH
  | typeof METHOD_DELETE
  | typeof METHOD_OPTIONS
  | typeof METHOD_TRACE;

export type HttpMethodWithoutBody = keyof typeof HttpMethodsWithoutBody;
export type HttpMethodWithBody = Exclude<HttpMethod, HttpMethodWithoutBody>;

export const isMethodWithoutRequestBody = (
  method: HttpMethod,
): method is HttpMethodWithoutBody => method in HttpMethodsWithoutBody;

export const METHOD_GET = "GET";
export const METHOD_HEAD = "HEAD";
export const METHOD_POST = "POST";
export const METHOD_PUT = "PUT";
export const METHOD_PATCH = "PATCH";
export const METHOD_DELETE = "DELETE";
export const METHOD_OPTIONS = "OPTIONS";
export const METHOD_TRACE = "TRACE";

const HttpMethodsWithoutBody = {
  [METHOD_TRACE]: true,
  [METHOD_GET]: true,
  [METHOD_OPTIONS]: true,
  [METHOD_HEAD]: true,
} as const;
