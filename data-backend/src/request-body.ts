/**
 * @file This file contains types and functions related to validating HTTP request body.
 */

import * as data from "@ty-ras/data";
import * as rawbody from "raw-body";
import type * as stream from "stream";

/**
 * This is generic function to create a {@link DataValidatorRequestInputSpec}.
 * It is used by other TyRAS plugins and usually not directly by client code.
 * @param validatorNative The 'native' validator object responsible for validating the request body.
 * @param supportedContentType The supported MIME content type. Almost always it is `application/json` or some variant of that.
 * @param strictContentType If `true`, then body not having the given `supportedContentType` in its `Content-Type` header will be rejected.
 * @param readBody The {@link rawbody.Options} to pass to `raw-body` library when deserializing request. Alternatively, can be own custom callback to read the body contents.
 * @param validator The validator wrapped as {@link data.DataValidator}.
 * @param allowProtoProperty Whether `"__proto"` property should be parsed from JSON string.
 * @returns The {@link DataValidatorRequestInputSpec} to be used in validating the request body.
 */
export const requestBodyGeneric = <
  TRequestBody,
  TRequestBodyContentType extends string,
  TValidatorHKT extends data.ValidatorHKTBase,
>(
  validatorNative: data.MaterializeDecoder<TValidatorHKT, TRequestBody>,
  supportedContentType: TRequestBodyContentType,
  strictContentType: boolean,
  readBody: ReadBody,
  validator: data.DataValidator<unknown, TRequestBody>,
  allowProtoProperty: boolean,
): DataValidatorRequestInputSpec<
  TRequestBody,
  TValidatorHKT,
  TRequestBodyContentType
> => {
  const reviver = data.getJSONParseReviver(allowProtoProperty);
  const jsonValidation = data.transitiveDataValidation(
    (inputString: string) => {
      if (inputString.length > 0) {
        try {
          return {
            error: "none",
            data: JSON.parse(inputString, reviver) as unknown,
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

  const readBodyFunction = getReadBodyFunction(readBody);

  return {
    validator: async ({ contentType, input, encoding }) => {
      return contentType.startsWith(supportedContentType) ||
        (!strictContentType && contentType.length === 0)
        ? // stream._decoder || (state && (state.encoding || state.decoder))
          jsonValidation(await readBodyFunction(input, encoding ?? "utf8"))
        : {
            error: "unsupported-content-type",
            supportedContentTypes: [supportedContentType],
          };
    },
    validatorSpec: {
      contents: {
        [supportedContentType]: validatorNative,
      } as DataValidatorResponseInputValidatorSpec<
        TRequestBody,
        TValidatorHKT,
        TRequestBodyContentType
      >["contents"],
    },
  };
};

/**
 * This signature describes how the body is read from the HTTP request {@link stream.Readable} into `string`.
 */
export type ReadBody = rawbody.Options | ReadBodyFunction;

/**
 * This is type for user-defined callbacks how to extract HTTP request body as string from {@link stream.Readable}.
 */
export type ReadBodyFunction = (
  readable: stream.Readable,
  encoding: string,
) => Promise<string>;

/**
 * This interface defines shape of the request body validation: the functionality and metadata about it.
 */
export interface DataValidatorRequestInputSpec<
  TRequestBody,
  TValidatorHKT extends data.ValidatorHKTBase,
  TRequestBodyContentTypes extends string,
> {
  /**
   * The callback to perform data validation on request body.
   */
  validator: DataValidatorRequestInput<TRequestBody>;
  /**
   * The metadata about the `validator`.
   */
  validatorSpec: DataValidatorResponseInputValidatorSpec<
    TRequestBody,
    TValidatorHKT,
    TRequestBodyContentTypes
  >;
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
    encoding?: string;
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
  TRequestBody,
  TValidatorHKT extends data.ValidatorHKTBase,
  TRequestBodyContentTypes extends string,
> {
  /**
   * The object, key of which is MIME type, and value is data validator _object_.
   * This object is 'native' validator, NOT wrapped in {@link data.DataValidator}
   */
  contents: {
    [P in TRequestBodyContentTypes]: data.MaterializeDecoder<
      TValidatorHKT,
      TRequestBody
    >;
  };
}

const getReadBodyFunction = (readBody: ReadBody): ReadBodyFunction =>
  typeof readBody === "function"
    ? readBody
    : async (readable, encoding) => {
        const bufferOrString = await rawbody.default(readable, {
          encoding: readBody?.encoding ?? encoding,
          ...(readBody ?? {}),
        });
        return bufferOrString instanceof Buffer
          ? bufferOrString.toString()
          : bufferOrString;
      };
