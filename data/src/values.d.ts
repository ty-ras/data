export type HeaderValue = StringValue;

export type QueryValue = StringValue;

export type StringValue = string | Array<string> | undefined;

export type ReadonlyHeaderValue = ReadonlyStringValue;

export type ReadonlyQueryValue = ReadonlyStringValue;

export type ReadonlyStringValue = string | ReadonlyArray<string> | undefined;
