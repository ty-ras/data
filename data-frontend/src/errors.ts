/**
 * @file This file contains utility method to convert {@link apiCall.APICallResultError} to {@link Error}.
 */

import type * as apiCall from "./api-call.types";

/**
 * Converts given {@link Error} or {@link apiCall.APICallResultError} to {@link Error}.
 * @param error The error - either {@link Error} or {@link apiCall.APICallResultError}.
 * @returns An {@link Error} which is either given `error` if it is already of that type, or `Error` with message containing details about {@link apiCall.APICallResultError}.
 */
export const toErrorFE = (error: Error | apiCall.APICallResultError): Error =>
  error instanceof Error
    ? error
    : new Error(
        `Error with API call ${error.error === "error" ? "output" : "input"}: ${
          error.error === "error"
            ? error.getHumanReadableMessage()
            : Object.entries(error.errorInfo)
                .map(([kind, error]) =>
                  error.error === "missing-validator"
                    ? `No validator for "${kind}".`
                    : `Validator for "${kind}" returned: ${error.errorInfo.getHumanReadableMessage()}`,
                )
                .join("\n")
        }`,
      );
