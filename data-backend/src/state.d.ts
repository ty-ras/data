import type * as common from "@ty-ras/data";
import type * as errors from "./errors";

export type StateValidator<TState> = common.DataValidator<
  unknown,
  TState,
  common.DataValidatorResultError | errors.HTTPProtocolError
>;

export type StateValidatorResult<TState> = ReturnType<StateValidator<TState>>;
