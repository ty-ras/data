/**
 * @file This file contains types and constants related to validating data as input.
 */

/**
 * This is callback type which is the bases of many TyRAS operations.
 * It takes input, and produces either {@link DataValidatorResultSuccess} or an error.
 * The error is by default {@link DataValidatorResultError}, but can be customized as last generic parameter to this type.
 */
export type DataValidator<
  TInput,
  TData,
  ErrorTResponse = DataValidatorResultError,
> = (
  this: void,
  data: TInput,
) => DataValidatorResultSuccess<TData> | ErrorTResponse;

/**
 * This is asynchronous version of {@link DataValidator} callback.
 * It is otherwise identical to {@link DataValidator}, but the return type is {@link Promise} of data or error.
 */
export type DataValidatorAsync<
  TInput,
  TData,
  ErrorTResponse = DataValidatorResultError,
> = (
  this: void,
  data: TInput,
) => Promise<DataValidatorResultSuccess<TData> | ErrorTResponse>;

/**
 * This data type describes the result of callback validating data.
 * The result is either success via {@link DataValidatorResultSuccess} type, or failure via {@link DataValidatorResultError} type.
 */
export type DataValidatorResult<TData> =
  | DataValidatorResultSuccess<TData>
  | DataValidatorResultError;

/**
 * This data type encapsulates the successful result of data validation callback.
 */
export interface DataValidatorResultSuccess<TData> {
  /**
   * This property must be set to `none` in order to signal successful result.
   */
  error: DataValidatorResultSuccessKind;
  /**
   * Contains the validated data object.
   */
  data: TData;
}

/**
 * This data type encapsulates the failure of data validation callback.
 */
export interface DataValidatorResultError {
  /**
   * This property must be set to `"error"` in order to signal unsuccessful result.
   */
  error: DataValidatorResultErrorKind;
  /**
   * Contains the data validation framework -specific error information (e.g. path of the property that didn't pass validation, etc).
   */
  errorInfo: unknown;
  /**
   * Callback to extract human readable message from this error.
   * @returns The human readable error message.
   */
  getHumanReadableMessage: () => string;
}

/**
 * Helper type to extract the data output generic type from given {@link DataValidator}.
 */
export type DataValidatorOutput<T> = T extends DataValidator<
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  infer _,
  infer TData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  infer _1
>
  ? TData
  : never;

/**
 * Helper type to describe either one singular item, or an array of any amount of items.
 */
export type OneOrMany<T> = T | Array<T>;

/**
 * Use this constant as value for `error` property of {@link DataValidatorResultSuccess} to signal successful data validation result.
 */
export const DATA_VALIDATION_RESULT_KIND_SUCCESS = "none";
/**
 * Use this constant as value for `error` property of {@link DataValidatorResultError} to signal unsuccessful data validation result.
 */
export const DATA_VALIDATION_RESULT_KIND_ERROR = "error";

/**
 * The string literal type of {@link DATA_VALIDATION_RESULT_KIND_ERROR}
 */
export type DataValidatorResultErrorKind =
  typeof DATA_VALIDATION_RESULT_KIND_ERROR;

/**
 * The string literal type of {@link DATA_VALIDATION_RESULT_KIND_SUCCESS}
 */
export type DataValidatorResultSuccessKind =
  typeof DATA_VALIDATION_RESULT_KIND_SUCCESS;
