/**
 * @file This file contains code related to signal HTTP protocol errors to TyRAS.
 */

/**
 * Class which is suitable to signal HTTP protocol error by `throw`ing information about it.
 */
export class HTTPError extends Error {
  /**
   * Creates new instance of {@link HTTPError} with given parameters.
   * @param statusCode The status code used in returned response. Must be `300 <= statusCode < 600`.
   * @param body The body used in returned response, if any.
   * @param message The customizable error message for the parent constructor {@link Error}, if any.
   */
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
  /**
   * This discriminating type property will identity this object as being related to HTTP protocol error.
   */
  error: "protocol-error";
  /**
   * The status code to use in the HTTP response.
   */
  statusCode: number;
  /**
   * The body to use in HTTP response, if any.
   */
  body: string | undefined;
}
