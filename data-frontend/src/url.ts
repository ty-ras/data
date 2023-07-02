/**
 * @file This file contains code related to specifying URL parameter validators using [string template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).
 */

import type * as protocol from "@ty-ras/protocol";
import type * as data from "@ty-ras/data";

/**
 *
 * @param fragments
 * @param args
 * @returns
 */
export function urlGeneric<
  TValidatorHKT extends data.ValidatorHKTBase,
  TArgs extends Array<URLParameterInfo<string, any, TValidatorHKT>>,
>(
  fragments: TemplateStringsArray,
  ...args: TArgs
):
  | string
  | data.DataValidator<protocol.RuntimeOf<URLParameterReducer<TArgs>>, string> {
  return args.length > 0 ? Object.fromEntries() : fragments[0];
}

/**
 * Helper type to extract final type of URL parameters, given an array of {@link URLParameterInfo} objects.
 * Modified from [StackOverflow](https://stackoverflow.com/questions/69085499/typescript-convert-tuple-type-to-object).
 */
export type URLParameterReducer<
  Arr extends Array<unknown>,
  Result extends Record<string, unknown> = {},
> = Arr extends []
  ? Result
  : Arr extends [infer Head, ...infer Tail]
  ? URLParameterReducer<
      [...Tail],
      Result &
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (Head extends URLParameterInfo<infer TName, infer TRuntime, infer _>
          ? { [P in TName]: TRuntime }
          : // eslint-disable-next-line @typescript-eslint/ban-types
            {})
    >
  : Readonly<Result>;

/**
 * This interface contains necessary information about one parameter embedded in URL path string.
 */
export interface URLParameterInfo<
  TName extends string,
  TRuntime,
  TValidatorHKT extends data.ValidatorHKTBase,
> {
  /**
   * The name of the parameter.
   */
  name: TName;
  /**
   * The 'native' decoder of paramter (io-ts/zod/runtypes/etc).
   */
  decoder: data.MaterializeEncoder<TValidatorHKT, string, TRuntime>;
  /**
   * The TyRAS {@link data.DataValidator} callback invoking the `decoder`.
   */
  validator: data.DataValidator<string, TRuntime>;
}
