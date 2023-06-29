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

/**
 * This is base type for all TyRAS endpoint state description [higher-kinded types (HKT)](https://www.matechs.com/blog/encoding-hkts-in-typescript-once-again).
 * The point of HKT is that it can be used as generic argument without having generic arguments itself, e.g. something like using `function myFunc(list: List)` instead of `function <T>myFunc(list: List<T>)`.
 */
export interface StateHKTBase {
  /**
   * This property will be used as argument for both {@link MaterializeRuntimeState} and {@link MaterializeStateInfo} types.
   * It should never be overwritten by sub-types.
   */
  readonly _argStateSpec?: unknown;

  /**
   * This property should contain the type expression for {@link MaterializeRuntimeState} type.
   * It must always be overwritten by sub-types.
   */
  readonly _getState?: unknown;

  /**
   * This property should contain the type expression for {@link MaterializeStateInfo} type.
   * It must always be overwritten by sub-types.
   */
  readonly _getStateInfo?: unknown;

  /**
   * This property should contain the type expression for {@link MaterializeStateSpecBase} type.
   * It must always be overwritten by sub-types.
   */
  readonly _getStateSpecBase?: unknown;
}

/**
 * This type is responsible for materializing the actual type of the state information when the endpoint is invoked.
 * @see StateHKTBase
 */
export type MaterializeRuntimeState<
  TStateHKT extends StateHKTBase,
  TStateSpec,
> = TStateHKT extends {
  readonly _getState: unknown;
}
  ? (TStateHKT & {
      readonly _argStateSpec: TStateSpec;
    })["_getState"]
  : never;

/**
 * This type is responsible for materializing the actual type for public information about the state specification.
 * @see StateHKTBase
 */
export type MaterializeStateInfo<
  TStateHKT extends StateHKTBase,
  TStateSpec,
> = TStateHKT extends {
  readonly _getStateInfo: unknown;
}
  ? (TStateHKT & {
      readonly _argStateSpec: TStateSpec;
    })["_getStateInfo"]
  : never;

/**
 * This type is responsible for materializing the actual type which can be used as base type constraint for e.g. generic type arguments.
 * @see StateHKTBase
 */
export type MaterializeStateSpecBase<TStateHKT extends StateHKTBase> =
  TStateHKT extends {
    readonly _getStateSpecBase: unknown;
  }
    ? (TStateHKT & {})["_getStateSpecBase"]
    : never;
