import type * as data from "@ty-ras/data";
import type * as stream from "stream";

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
