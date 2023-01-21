import type * as apiCall from "./api-call";

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
