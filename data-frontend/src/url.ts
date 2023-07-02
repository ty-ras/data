/**
 * @file This file contains code related to specifying URL parameter validators using [string template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).
 */

import type * as protocol from "@ty-ras/protocol";
import * as data from "@ty-ras/data";

/**
 *
 * @param fragments
 * @param args
 * @param parametersToValidator
 * @returns
 */
export function urlGeneric<
  TValidatorHKT extends data.ValidatorHKTBase,
  TArgs extends Array<URLParameterInfo<string, any, TValidatorHKT>>,
>(
  fragments: TemplateStringsArray,
  args: TArgs,
  parametersToValidator: (decoders: {
    [P in keyof URLParameterReducer<TArgs>]: data.MaterializeEncoder<
      TValidatorHKT,
      URLParameterReducer<TArgs>[P],
      string
    >;
  }) => data.MaterializeEncoder<TValidatorHKT, {}, {}>,
):
  | string
  | data.DataValidator<protocol.RuntimeOf<URLParameterReducer<TArgs>>, string> {
  if (fragments.length !== args.length + 1) {
    throw new Error(
      "Please call this function as string template literal: <function-name><template string expression with back-ticks>, not using the traditional parenthesis call-style.",
    );
  }

  const argsToIndex = Object.fromEntries(
    args.map(({ name }, index) => [name, index]),
  );
  data.transitiveDataValidation(
    parametersToValidator(
      Object.fromEntries(args.map(({ name, encoder }) => [name, encoder])) as {
        [P in keyof URLParameterReducer<TArgs>]: data.MaterializeEncoder<
          TValidatorHKT,
          URLParameterReducer<TArgs>[P],
          string
        >;
      },
    ),
    (validatedUrl): data.DataValidationResultSuccess<string> => ({}),
  );
  return args.length > 0 ? Object.fromEntries() : fragments[0];
}

/**
 * Helper type to extract final type of URL parameters, given an array of {@link URLParameterInfo} objects.
 * Modified from [StackOverflow](https://stackoverflow.com/questions/69085499/typescript-convert-tuple-type-to-object).
 */
export type URLParameterReducer<
  Arr extends Array<unknown>,
  // eslint-disable-next-line @typescript-eslint/ban-types
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
  encoder: data.MaterializeEncoder<TValidatorHKT, TRuntime, string>;

  /**
   * The {@link RegExp} for URL path parameter.
   */
  regExp: RegExp;
}
