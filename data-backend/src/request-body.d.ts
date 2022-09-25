import type * as data from "@ty-ras/data";
import type * as stream from "stream";

export interface DataValidatorRequestInputSpec<
  TData,
  TValidatorSpec extends TInputContentsBase,
> {
  validator: DataValidatorRequestInput<TData>;
  validatorSpec: DataValidatorResponseInputValidatorSpec<TValidatorSpec>;
}

export type DataValidatorRequestInput<TData> = data.DataValidatorAsync<
  {
    contentType: string;
    input: stream.Readable;
  },
  TData,
  | data.DataValidatorResultError
  | {
      error: "unsupported-content-type";
      supportedContentTypes: ReadonlyArray<string>;
    }
>;

export interface DataValidatorResponseInputValidatorSpec<
  TContents extends TInputContentsBase,
> {
  // TODO undefinedAccepted: 'maybe' | 'only' | 'never'
  contents: TContents;
}

export type TInputContentsBase = Record<string, unknown>;
