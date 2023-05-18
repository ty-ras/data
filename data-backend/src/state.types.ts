/**
 * @file This types-only file contains types related to validating the state given to callback which implement single HTTP endpoint functionality.
 */
import type * as common from "@ty-ras/data";
import type * as errors from "./errors";

/**
 * This signature defines how to validate the state objects given to callback which implement single HTTP endpoint functionality.
 * @see data.DataValidator
 */
export type StateValidator<TState> = common.DataValidator<
  unknown,
  TState,
  common.DataValidatorResultError | errors.HTTPProtocolError
>;
