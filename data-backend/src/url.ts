/**
 * @file This types-only file contains types related to validating parameters encoded in URL path string.
 */

import type * as protocol from "@ty-ras/protocol";
import type * as data from "@ty-ras/data";
import type * as s from "./string";

/**
 * This type describes the runtime validators used to validate the parameters encoded in URL path string.
 */
export type URLParameterValidators<TURLData extends protocol.TURLDataBase> =
  s.StringDataValidators<TURLData, URLParameterValue, true>;

/**
 * This is the metadata information about validation related to the parameters encoded in URL path string.
 */
export type URLParameterValidatorSpecMetadata<
  TURLData extends protocol.TURLDataBase,
  TValidatorHKT extends data.ValidatorHKTBase,
> = {
  [P in keyof TURLData]-?: URLParameterValidationAdditionalMetadata &
    s.WithDecoder<TValidatorHKT, TURLData[P]>;
};

/**
 * This is metadata parameter for {@link s.StringDataValidatorSpec}, and it specifies the properties required for metadata object of each parameter encoded in URL path string.
 */
export type URLParameterValidationAdditionalMetadata = {
  /**
   * The {@link RegExp} to use to test the parameter against.
   */
  regExp: RegExp;
};

/**
 * This is the serialized form of the parameters encoded in URL path string.
 */
export type URLParameterValue = string;

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
  decoder: data.MaterializeDecoder<TValidatorHKT, TRuntime>;
  /**
   * The TyRAS {@link data.DataValidator} callback invoking the `decoder`.
   */
  validator: data.DataValidator<string, TRuntime>;

  /**
   * The {@link RegExp} for URL path parameter.
   */
  regExp: RegExp;
}

/**
 * This function creates {@link URLParameterInfo} for decoding (deserializing) data.
 * It is meant to be used by other TyRAS libraries, not by client code directly.
 * @param name The name of the URL path parameter.
 * @param decoder The native decoder for the parameter.
 * @param regExp The regular expression to match the parameter in URL path.
 * @param decoderToValidator The callback to create TyRAS {@link data.DataValidator} from native decoder.
 * @returns The {@link URLParameterInfo} to be used by other TyRAS libraries.
 */
export const urlParameterGeneric = <
  TName extends string,
  TParameter,
  TValidatorHKT extends data.ValidatorHKTBase,
>(
  name: TName,
  decoder: data.MaterializeDecoder<TValidatorHKT, TParameter>,
  regExp: RegExp | undefined,
  decoderToValidator: <TRuntime>(
    decoder: data.MaterializeDecoder<TValidatorHKT, TRuntime>,
  ) => data.DataValidator<data.ReadonlyStringValue, TRuntime>,
): URLParameterInfo<TName, TParameter, TValidatorHKT> => ({
  name,
  regExp: regExp ?? defaultParameterRegExp(),
  validator: decoderToValidator(decoder),
  decoder,
});

const DEFAULT_PARAM_REGEXP = /[^/]+/;
/**
 * This helper callback creates new {@link RegExp} which has the default pattern to match parameters encoded in URL path string.
 * The pattern is `[^/]+`, so as many consecutive characters as possible until encountering first `/`.
 * @returns A new RegExp with the default pattern to match parameters encoded in URL path string.
 */
export const defaultParameterRegExp = () => new RegExp(DEFAULT_PARAM_REGEXP);
