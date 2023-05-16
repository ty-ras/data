/**
 * @file This file contains types and functions related to validating HTTP request body.
 */
import * as data from "@ty-ras/data";
import type * as stream from "stream";

/**
 * This is generic function to create a {@link DataValidatorRequestInputSpec}.
 * It is used by other TyRAS plugins and usually not directly by client code.
 * @param validatorNative The 'native' validator object responsible for validating the request body.
 * @param validator The validator wrapped as {@link data.DataValidator}.
 * @param supportedContentType The supported MIME content type. Almost always it is `application/json` or some variant of that.
 * @param strictContentType If `true`, then body not having the given `supportedContentType` in its `Content-Type` header will be rejected.
 * @param readBody The callback to read the body contents as string.
 * @returns The {@link DataValidatorRequestInputSpec} to be used in validating the request body.
 */
export const requestBodyGeneric = <T, TContentType extends string, TValidator>(
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

/**
 * This signature describes how the body is read from the HTTP request {@link stream.Readable} into `string`.
 */
export type ReadBody = (
  readable: stream.Readable,
  encoding: string,
) => Promise<string>;

/**
 * This interface defines shape of the request body validation: the functionality and metadata about it.
 */
export interface DataValidatorRequestInputSpec<
  TData,
  TValidatorSpec extends TInputContentsBase,
> {
  /**
   * The callback to perform data validation on request body.
   */
  validator: DataValidatorRequestInput<TData>;
  /**
   * The metadata about the `validator`.
   */
  validatorSpec: DataValidatorResponseInputValidatorSpec<TValidatorSpec>;
}

/**
 * This signature describes how the request body is validated.
 * @see data.DataValidatorAsync
 * @see DataValidatorRequestInputResultUnsupportedContentType
 */
export type DataValidatorRequestInput<TData> = data.DataValidatorAsync<
  {
    contentType: string;
    input: stream.Readable;
  },
  TData,
  | data.DataValidatorResultError
  | DataValidatorRequestInputResultUnsupportedContentType
>;

/**
 * This interface defines the shape of the error object returned by {@link DataValidatorRequestInput} if the HTTP request content type is deemed to be invalid.
 */
export interface DataValidatorRequestInputResultUnsupportedContentType {
  /**
   * The type-discriminating property identifying this error from other possible errors.
   */
  error: "unsupported-content-type";
  /**
   * Which content types are supported by this request body validator.
   */
  supportedContentTypes: ReadonlyArray<string>;
}

/**
 * This interface defines the shape of the metadata about some {@link DataValidatorRequestInput}.
 */
export interface DataValidatorResponseInputValidatorSpec<
  TContents extends TInputContentsBase,
> {
  /**
   * The object, key of which is MIME type, and value is data validator _object_.
   * This object is 'native' validator, NOT wrapped in {@link data.DataValidator}
   */
  contents: TContents;
}

/**
 * This type defines the base of the contents object of {@link DataValidatorResponseInputValidatorSpec}.
 */
export type TInputContentsBase = Record<string, unknown>;
