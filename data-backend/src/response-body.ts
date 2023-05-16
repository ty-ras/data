/**
 * @file This file contains types and functions related to validating runtime object before serializing it into HTTP response body.
 */

import * as data from "@ty-ras/data";
import * as errors from "./errors";
import type * as stream from "stream";

/**
 * This is generic function to create a {@link DataValidatorResponseOutputSpec}.
 * It is used by other TyRAS plugins and usually not directly by client code.
 * @param validation The 'native' validator object responsible for validating the object to be serialized.
 * @param validator The same `validation` object wrapped into {@link data.DataValidator}.
 * @param supportedContentType The supported MIME content type. Almost always it is `application/json` or some variant of that.
 * @returns The {@link DataValidatorResponseOutputSpec} to be used in validating the object obe serialized as HTTP response body.
 */
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

/**
 * This interface defines shape of the response body validation: the functionality and metadata about it.
 */
export interface DataValidatorResponseOutputSpec<
  TOutput,
  TContents extends TOutputContentsBase,
> {
  /**
   * The callback to perform data validation on object to be serialized as HTTP response body.
   */
  validator: DataValidatorResponseOutput<TOutput>;
  /**
   * The metadata about `validator`.
   */
  validatorSpec: DataValidatorResponseOutputValidatorSpec<TContents>;
}

/**
 * This signature describes how the request body is validated.
 * @see data.DataValidatorAsync
 * @see errors.HTTPProtocolError
 */
export type DataValidatorResponseOutput<TOutput> = data.DataValidator<
  TOutput,
  DataValidatorResponseOutputSuccess,
  DataValidatorResponseOutputError
>;

/**
 * This type contains all the errors that can be returned by {@link DataValidatorResponseOutput}.
 */
export type DataValidatorResponseOutputError =
  | data.DataValidatorResultError
  | errors.HTTPProtocolError;

/**
 * This type contains the shape of the successful data validation of the object to be serialized to HTTP response body.
 * @see DataValidatorResponseOutput
 */
export type DataValidatorResponseOutputSuccess = {
  /**
   * The content type of the `output` as MIME type.
   */
  contentType: string;
  /**
   * The serialized output.
   */
  output: string | Buffer | stream.Readable | undefined;
  /**
   * The response headers, if any.
   */
  headers?: Record<string, data.HeaderValue>;
};

/**
 * The metadata about {@link DataValidatorResponseOutput}.
 */
export interface DataValidatorResponseOutputValidatorSpec<
  TContents extends TOutputContentsBase,
> {
  /**
   * The object, key of which is MIME type, and value is data validator _object_.
   * This object is 'native' validator, NOT wrapped in {@link data.DataValidator}
   */
  contents: TContents;
}

/**
 * This is base type for generic parameter of {@link DataValidatorResponseOutputValidatorSpec}.
 */
export type TOutputContentsBase = Record<string, unknown>;
