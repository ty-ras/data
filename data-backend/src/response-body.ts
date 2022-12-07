import * as data from "@ty-ras/data";
import * as errors from "./errors";
import type * as stream from "stream";

export const responseBodyGeneric = <
  TOutput,
  TSerialized,
  TContentType extends string,
  TValidator,
>(
  validation: TValidator,
  validator: data.DataValidator<
    TOutput,
    TSerialized,
    DataValidatorResponseOutputError
  >,
  supportedContentType: TContentType,
): DataValidatorResponseOutputSpec<
  TOutput,
  Record<TContentType, TValidator>
> => ({
  validator: (output) => {
    try {
      const result = validator(output);
      if (result.error === "none") {
        const success: DataValidatorResponseOutputSuccess = {
          contentType: supportedContentType,
          output: JSON.stringify(result.data),
        };
        return {
          error: "none",
          data: success,
        };
      } else {
        return result;
      }
    } catch (e) {
      return e instanceof errors.HTTPError
        ? {
            error: "protocol-error",
            statusCode: e.statusCode,
            body: e.body,
          }
        : data.exceptionAsValidationError(e);
    }
  },
  validatorSpec: {
    contents: {
      [supportedContentType]: validation,
    } as Record<TContentType, TValidator>,
  },
});

export interface DataValidatorResponseOutputSpec<
  TOutput,
  TContents extends TOutputContentsBase,
> {
  validator: DataValidatorResponseOutput<TOutput>;
  validatorSpec: DataValidatorResponseOutputValidatorSpec<TContents>;
}

export type DataValidatorResponseOutput<TOutput> = data.DataValidator<
  TOutput,
  DataValidatorResponseOutputSuccess,
  data.DataValidatorResultError | errors.HTTPProtocolError
>;

export type DataValidatorResponseOutputError =
  | data.DataValidatorResultError
  | errors.HTTPProtocolError;

export type DataValidatorResponseOutputSuccess = {
  contentType: string;
  output: string | Buffer | stream.Readable | undefined;
  headers?: Record<string, data.HeaderValue>;
};

export interface DataValidatorResponseOutputValidatorSpec<
  TContents extends TOutputContentsBase,
> {
  contents: TContents;
}

export type TOutputContentsBase = Record<string, unknown>;
