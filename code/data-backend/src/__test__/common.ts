/**
 * @file This file contains common utility methods used by unit tests.
 */
import * as data from "@ty-ras/data";
import * as util from "util";

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

export const CONTENT_TYPE = "text";

export const VALIDATOR_NATIVE:
  | data.MaterializeDecoder<ValidatorHKT, string>
  | data.MaterializeEncoder<ValidatorHKT, string, string> = "ValidatorNative";

/**
 * This is validator to be used only for tests.
 */
export interface ValidatorHKT extends data.ValidatorHKTBase {
  /**
   * This provides implementation for {@link data.ValidatorHKTBase._getEncoder}.
   * For the test setup, it is simply a string.
   */
  readonly _getEncoder: string;

  /**
   * This provides implementation for {@link data.ValidatorHKTBase._getDecoder}.
   * For the test setup, it is simply a string.
   */
  readonly _getDecoder: string;

  /**
   * This provides implementation for {@link data.ValidatorHKTBase._getDecodedType}.
   * For the test setup, it is simply a string.
   */
  readonly _getDecodedType: string;
}

/**
 * Creates callback to be used in generic variants of this library.
 * @param optional If `true`, {@link validatorForValueOptional} will be used, otherwise {@link validatorForValue}.
 * @returns The {@link data.DataValidator} for value which matches only given `decoder`.
 */
export const decoderToValidator =
  (
    optional = false,
  ): (<TRuntime>(
    decoder: data.MaterializeDecoder<ValidatorHKT, TRuntime>,
  ) => data.DataValidator<data.ReadonlyStringValue, TRuntime>) =>
  (decoder) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    (optional
      ? validatorForValueOptional(decoder)
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validatorForValue(decoder)) as any;

/**
 * Creates callback to be used in generic variants of this library.
 * @param optional If `true`, {@link validatorForValueOptional} will be used, otherwise {@link validatorForValue}.
 * @returns The {@link data.DataValidator} for value which matches only given `encoder`.
 */
export const encoderToValidator =
  (
    optional = false,
  ): (<TRuntime>(
    decoder: data.MaterializeEncoder<ValidatorHKT, TRuntime, data.StringValue>,
  ) => data.DataValidator<TRuntime, data.StringValue>) =>
  (encoder) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    (optional
      ? validatorForValueOptional(encoder)
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validatorForValue(encoder)) as any;
