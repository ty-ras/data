export interface ProtocolSpecCore<TMethod extends string, TOutput> {
  method: TMethod;
  responseBody: TOutput;
}

export interface ProtocolSpecHeaders<THeaders extends Record<string, string>> {
  // Key: header name
  // Value: functionality ID (header will not be visible in endpoint handler args)
  headers: THeaders;
}

export interface ProtocolSpecURL<TURLData extends Record<string, unknown>> {
  url: TURLData;
}

export interface ProtocolSpecQuery<TQueryData extends Record<string, unknown>> {
  query: TQueryData;
}

export interface ProtocolSpecHeaderData<
  THeaderData extends Record<string, unknown>,
> {
  // Key: header name
  // Value: data type of the header (header will be visible in endpoint handler args)
  headerData: THeaderData;
}

export interface ProtocolSpecRequestBody<TInput> {
  requestBody: TInput;
}

export interface ProtocolSpecResponseHeaders<
  THeaderData extends Record<string, unknown>,
> {
  responseHeaders: THeaderData;
}
