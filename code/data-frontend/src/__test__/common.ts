/**
 * @file This file contains common utility methods used by unit tests.
 */
import * as data from "@ty-ras/data";
import * as util from "node:util";

/**
 * Creates a new {@link data.DataValidator} which will return validated data only if it exactly matches (`===`) the given value.
 * For errors, it will return {@link data.DataValidatorResultError} with `getHumanReadableMessage` function set to {@link getHumanReadableMessage}.
 * @param value The value to check against.
 * @returns A {@link data.DataValidator} for the `value`.
 */
export const validatorForValue =
  <T>(value: T): data.DataValidator<unknown, T> =>
  (data) =>
    util.isDeepStrictEqual(data, value)
      ? // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        { error: "none", data: data as any }
      : { error: "error", errorInfo: data, getHumanReadableMessage };

/**
 * Creates a new {@link data.DataValidator} which will return validated data only if it exactly matches (`===`) the given value, or is `undefined`.
 * For errors, it will return {@link data.DataValidatorResultError} with `getHumanReadableMessage` function set to {@link getHumanReadableMessage}.
 * @param value The value to check against.
 * @returns A {@link data.DataValidator} for the `value`.
 */
export const validatorForValueOptional =
  <T>(value: T): data.DataValidator<unknown, T> =>
  (data) =>
    data === undefined || util.isDeepStrictEqual(data, value)
      ? // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        { error: "none", data: data as any }
      : { error: "error", errorInfo: data, getHumanReadableMessage };

/**
 * Dummy function used only for equality comparison in tests.
 * @returns Empty string.
 */
export const getHumanReadableMessage = () => "";

/**
 * This is validator to be used only for tests.
 */
export interface ValidatorHKT extends data.ValidatorHKTBase {
  /**
   * This provides implementation for {@link data.ValidatorHKTBase._getEncoder}.
   * For the test setup, it is simply a string.
   */
  readonly _getEncoder: this["_argEncodedType"];

  /**
   * This provides implementation for {@link data.ValidatorHKTBase._getDecoder}.
   * For the test setup, it is simply a string.
   */
  readonly _getDecoder: this["_argDecodedType"];

  /**
   * This provides implementation for {@link data.ValidatorHKTBase._getDecodedType}.
   * For the test setup, it is simply a string.
   */
  readonly _getDecodedType: string;
}

/**
 * Creates callback to be used in generic variants of this library.
 * @param optional If `true`, {@link validatorForValueOptional} will be used, otherwise {@link validatorForValue}.
 * @returns The {@link data.DataValidator} for value which matches only given `encoder`.
 */
export const encoderToValidator =
  (
    optional = false,
  ): (<TRuntime, TEncoded>(
    decoder: data.MaterializeEncoder<ValidatorHKT, TRuntime, TEncoded>,
  ) => data.DataValidator<TRuntime, TEncoded>) =>
  (encoder) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    (optional
      ? validatorForValueOptional(encoder)
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validatorForValue(encoder)) as any;
