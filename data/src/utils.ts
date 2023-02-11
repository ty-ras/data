import * as validation from "./validation";

/**
 * Combines two data validators into one.
 * The resulting data validator will first invoke the first given validator, and only if the result is sucessful, then invokes the second given validator.
 * @param first The first data validator callback to use.
 * @param second The second data validator callback to use.
 * @returns A {@link validation.DataValidator} which first invokes `first` validator, and only if that is sucessful, then invokes `second` validator.
 */
export const transitiveDataValidation =
  <TInput, TOutput, TIntermediate, TError, TError2>(
    first: validation.DataValidator<TInput, TIntermediate, TError>,
    second: validation.DataValidator<TIntermediate, TOutput, TError2>,
  ): validation.DataValidator<TInput, TOutput, TError | TError2> =>
  (input) => {
    const intermediate = first(input);
    return isSuccess(intermediate) ? second(intermediate.data) : intermediate;
  };

/**
 * Helper method to construct new object without certain properties of given object.
 * @param obj The object from which to filter properties.
 * @param keys The property names to omit from resulting object.
 * @returns The object which does *not* have any property listed in `keys`.
 */
export const omit = <T extends object, TKey extends keyof T>(
  obj: T,
  ...keys: ReadonlyArray<TKey>
) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => keys.indexOf(key as TKey) < 0),
  ) as Omit<T, TKey>;
};

/**
 * Helper method to combine multiple {@link validation.DataValidatorResultError} objects into one {@link validation.DataValidatorResultError} object.
 * @param errors The multiple {@link validation.DataValidatorResultError} objects.
 * @returns One {@link validation.DataValidatorResultError} object which holds given `errors` array in its `errorInfo` property.
 */
export const combineErrorObjects = (
  errors: ReadonlyArray<validation.DataValidatorResultError>,
): validation.DataValidatorResultError => ({
  error: validation.DATA_VALIDATION_RESULT_KIND_ERROR,
  errorInfo: errors,
  getHumanReadableMessage: () =>
    errors.map((e) => e.getHumanReadableMessage()).join("\n"),
});

/**
 * Helper method to wrap (catched) exception object into {@link validation.DataValidatorResultError}.
 * @param exception The (catched) exception object.
 * @returns A new {@link validation.DataValidatorResultError} object which holds given `exception` in its `errorInfo` property.
 */
export const exceptionAsValidationError = (
  exception: unknown,
): validation.DataValidatorResultError => ({
  error: validation.DATA_VALIDATION_RESULT_KIND_ERROR,
  errorInfo: exception,
  getHumanReadableMessage: () => `${exception}`,
});

/**
 * Helper method to invoke `Object.fromEntries(Object.entries(record).map(([key, value]) => [key, transform(value, key)]))`.
 * The benefit of using this method compared to the raw approach is, besides brevity, the ability to retain the key type of given record into the result type returned by this function.
 *
 * @param record The record to read entries from.
 * @param transform The callback to transform single entry from `record`. The first parameter will be the value, and the second parameter will be the key.
 * @returns A new object which has all the same properties as given `record`, but values are transformed using given `transform` callback.
 */
export const transformEntries = <T extends object, TResult>(
  record: T,
  transform: (item: T[keyof T], paramName: keyof T) => TResult,
): { [P in keyof T]: ReturnType<typeof transform> } => {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      key,
      transform(value as Parameters<typeof transform>[0], key as keyof T),
    ]),
  ) as { [P in keyof T]: ReturnType<typeof transform> };
};

const isSuccess = <T>(
  response: unknown,
): response is validation.DataValidatorResultSuccess<T> =>
  !!response &&
  typeof response === "object" &&
  "error" in response &&
  response.error === validation.DATA_VALIDATION_RESULT_KIND_SUCCESS;
