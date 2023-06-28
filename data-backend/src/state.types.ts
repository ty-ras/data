/**
 * @file This types-only file contains types related to validating the state given to callback which implement single HTTP endpoint functionality.
 */

import type * as common from "@ty-ras/data";
import type * as errors from "./errors";

/* eslint-disable @typescript-eslint/ban-types */

/**
 * This signature defines how to validate the state objects given to callback which implement single HTTP endpoint functionality.
 * @see data.DataValidator
 */
export type StateValidator<TState> = common.DataValidator<
  unknown,
  TState,
  common.DataValidatorResultError | errors.HTTPProtocolError
>;

export interface StateHKTBase {
  readonly _argStateValidationMetadata?: unknown;
  readonly _getState?: unknown;
  readonly _getStateInfo?: unknown;
  readonly _getStateSpecBase?: unknown;
}

export type MaterializeRuntimeState<
  TStateHKT extends StateHKTBase,
  TStateSpec,
> = TStateHKT extends {
  readonly _getState: unknown;
}
  ? (TStateHKT & {
      readonly _argStateValidationMetadata: TStateSpec;
    })["_getState"]
  : never;

export type MaterializeStateInfo<
  TStateHKT extends StateHKTBase,
  TStateSpec,
> = TStateHKT extends {
  readonly _getStateInfo: unknown;
}
  ? (TStateHKT & {
      readonly _argStateValidationMetadata: TStateSpec;
    })["_getStateInfo"]
  : never;

export type MaterializeStateSpecBase<TStateHKT extends StateHKTBase> =
  TStateHKT extends {
    readonly _getStateSpecBase: unknown;
  }
    ? (TStateHKT & {})["_getStateSpecBase"]
    : never;
