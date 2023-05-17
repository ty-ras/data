/**
 * @file This file contains common utility methods used by unit tests.
 */
import type * as data from "@ty-ras/data";
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
 * Dummy function used only for equality comparison in tests.
 * @returns Empty string.
 */
export const getHumanReadableMessage = () => "";

export const CONTENT_TYPE = "text";

export const VALIDATOR_NATIVE = "ValidatorNative";
