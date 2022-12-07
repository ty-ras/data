/**
 * Class which is suitable to signal HTTP protocol error by `throw`ing information about it.
 */
export class HTTPError extends Error {
  public constructor(
    public readonly statusCode: number,
    public readonly body?: string,
    message?: string,
  ) {
    if (statusCode < 300 || statusCode >= 600) {
      throw new Error(
        "HTTPError status code must be 300 or greater, but still under 600.",
      );
    }
    super(
      `HTTP error: ${
        message ??
        `status code ${statusCode}, ${
          body === undefined ? "no body" : `body "${body}"`
        }`
      }.`,
    );
  }
}

/**
 * Interface which is suitable to signal HTTP protocol error by `return`ing it.
 */
export interface HTTPProtocolError {
  error: "protocol-error";
  statusCode: number;
  body: string | undefined;
}
