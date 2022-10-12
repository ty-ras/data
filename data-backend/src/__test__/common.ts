import type * as data from "@ty-ras/data";
import * as util from "util";

export const validatorForValue =
  <T>(value: T): data.DataValidator<unknown, T> =>
  (data) =>
    util.isDeepStrictEqual(data, value)
      ? // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        { error: "none", data: data as any }
      : { error: "error", errorInfo: data, getHumanReadableMessage };

export const getHumanReadableMessage = () => "";

export const CONTENT_TYPE = "text";

export const VALIDATOR_NATIVE = "ValidatorNative";
