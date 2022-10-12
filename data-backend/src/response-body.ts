import * as data from "@ty-ras/data";
import type * as stream from "stream";

export const responseBody = <
  TOutput,
  TSerialized,
  TContentType extends string,
  TValidator,
>(
  validation: TValidator,
  validator: data.DataValidator<TOutput, TSerialized>,
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
      return data.exceptionAsValidationError(e);
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
  DataValidatorResponseOutputSuccess
>;

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
