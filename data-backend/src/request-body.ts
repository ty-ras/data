import * as data from "@ty-ras/data";
import type * as stream from "stream";

export const requestBody = <T, TContentType extends string, TValidator>(
  validatorNative: TValidator,
  validator: data.DataValidator<unknown, T>,
  supportedContentType: TContentType,
  strictContentType: boolean,
  readBody: ReadBody,
): DataValidatorRequestInputSpec<T, Record<TContentType, TValidator>> => {
  const jsonValidation = data.transitiveDataValidation(
    (inputString: string) => {
      if (inputString.length > 0) {
        try {
          return {
            error: "none",
            data: JSON.parse(inputString) as unknown,
          };
        } catch (e) {
          return data.exceptionAsValidationError(e);
        }
      } else {
        // No body supplied -> appear as undefined
        return {
          error: "none",
          data: undefined,
        };
      }
    },
    validator,
  );

  return {
    validator: async ({ contentType, input }) => {
      return contentType.startsWith(supportedContentType) ||
        (!strictContentType && contentType.length === 0)
        ? // stream._decoder || (state && (state.encoding || state.decoder))
          jsonValidation(
            // TODO get encoding from headers (or perhaps content type value? e.g. application/json;encoding=utf8)
            await readBody(input, "utf8"),
          )
        : {
            error: "unsupported-content-type",
            supportedContentTypes: [supportedContentType],
          };
    },
    validatorSpec: {
      contents: {
        [supportedContentType]: validatorNative,
      } as Record<TContentType, TValidator>,
    },
  };
};

export type ReadBody = (
  readable: stream.Readable,
  encoding: string,
) => Promise<string>;

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
