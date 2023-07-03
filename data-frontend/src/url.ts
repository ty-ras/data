/**
 * @file This file contains code related to specifying URL parameter validators using [string template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).
 */

import type * as protocol from "@ty-ras/protocol";
import * as data from "@ty-ras/data";

/**
 * This function creates {@link data.DataValidator} for encoding (serializing) URL path parameters into URL path string.
 * It is meant to be used by other TyRAS libraries, not by client code directly.
 * @param fragments The string fragments passed to string template literal function.
 * @param args The arguments passed to string template literal function.
 * @param parametersToValidator Callback to create one encoder from collection of named encoders.
 * @param encoderToValidator Callback to convert native encoder to {@link data.DataValidator}.
 * @returns The URL path as string if there are no URL path parameters, or a callback to convert given parameters to URL path string.
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
  }) => data.MaterializeEncoder<
    TValidatorHKT,
    { [P in keyof URLParameterReducer<TArgs>]: URLParameterReducer<TArgs>[P] },
    { [P in keyof URLParameterReducer<TArgs>]: string }
  >,
  encoderToValidator: <TRuntime, TEncoded>(
    encoder: data.MaterializeEncoder<TValidatorHKT, TRuntime, TEncoded>,
  ) => data.DataValidator<TRuntime, TEncoded>,
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
  const validator = data.transitiveDataValidation(
    encoderToValidator(
      parametersToValidator(
        Object.fromEntries(
          args.map(({ name, encoder }) => [name, encoder]),
        ) as {
          [P in keyof URLParameterReducer<TArgs>]: data.MaterializeEncoder<
            TValidatorHKT,
            URLParameterReducer<TArgs>[P],
            string
          >;
        },
      ),
    ),
    (validatedUrl): data.DataValidatorResultSuccess<string> => ({
      error: "none",
      data: "",
    }),
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
  return args.length > 0 ? (validator as any) : fragments[0];
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
