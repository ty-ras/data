import type * as common from "./common";

export const transitiveDataValidation =
  <TInput, TOutput, TIntermediate, TError, TError2>(
    first: common.DataValidator<TInput, TIntermediate, TError>,
    second: common.DataValidator<TIntermediate, TOutput, TError2>,
  ): common.DataValidator<TInput, TOutput, TError | TError2> =>
  (input) => {
    const intermediate = first(input);
    return isSuccess(intermediate) ? second(intermediate.data) : intermediate;
  };

export const omit = <T extends object, TKey extends keyof T>(
  obj: T,
  ...keys: ReadonlyArray<TKey>
) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => keys.indexOf(key as TKey) < 0),
  ) as Omit<T, TKey>;
};

// Adding monadic support for common.DataValidationResultError
export const combineErrorObjects = (
  errors: ReadonlyArray<common.DataValidatorResultError>,
): common.DataValidatorResultError => ({
  error: "error",
  errorInfo: errors,
  getHumanReadableMessage: () =>
    errors.map((e) => e.getHumanReadableMessage()).join("\n"),
});

export const exceptionAsValidationError = (
  exception: unknown,
): common.DataValidatorResultError => ({
  error: "error",
  errorInfo: exception,
  getHumanReadableMessage: () => `${exception}`,
});

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
): response is common.DataValidatorResultSuccess<T> =>
  !!response &&
  typeof response === "object" &&
  "error" in response &&
  (response as common.DataValidatorResultSuccess<T>).error === "none";
