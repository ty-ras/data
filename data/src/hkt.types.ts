/**
 * @file This file contains code related to expressing TyRAS validators as [HKT]().
 */

/**
 * This is base type for all TyRAS validator [higher-kinded types (HKT)](https://www.matechs.com/blog/encoding-hkts-in-typescript-once-again).
 * The point of HKT is that it can be used as generic argument without having generic arguments itself, e.g. something like using `function myFunc(list: List)` instead of `function <T>myFunc(list: List<T>)`.
 */
export interface ValidatorHKTBase {
  /**
   * This property will be used as argument for both {@link MaterializeDecoder} and {@link MaterializeEncoder} types.
   * It should never be overwritten by sub-types.
   */
  readonly _argDecodedType?: unknown;

  /**
   * This property will be used as argument for {@link MaterializeEncoder} type.
   * It should never be overwritten by sub-types.
   */
  readonly _argEncodedType?: unknown;

  /**
   * This property will be used as argument for {@link MaterializeDecodedType} type.
   * It should never be overwritten by sub-types.
   */
  readonly _argDecoder?: unknown;

  /**
   * This property should contain the type expression for {@link MaterializeEncoder} type.
   * It must always be overwritten by sub-types.
   */
  readonly _getEncoder?: unknown;

  /**
   * This property should contain the type expression for {@link MaterializeDecoder} type.
   * It must always be overwritten by sub-types.
   */
  readonly _getDecoder?: unknown;

  /**
   * This property should contain the type expression for {@link MaterializeDecodedType} type.
   * It must always be overwritten by sub-types.
   */
  readonly _getDecodedType?: unknown;
}

/**
 * This is type which operates on subtypes of {@link ValidatorHKTBase}, and is responsible for providing the actual generic type ("materializing") for a decoder, given the type being decoded to.
 */
export type MaterializeDecoder<
  TValidatorHKT extends ValidatorHKTBase,
  TDecodedType,
> = TValidatorHKT extends {
  readonly _getDecoder: unknown;
}
  ? (TValidatorHKT & {
      readonly _argDecodedType: TDecodedType;
    })["_getDecoder"]
  : never;

/**
 * This is type which operates on subtypes of {@link ValidatorHKTBase}, and is responsible for providing the actual generic type ("materializing") for a encoder, given the type being encoded from, and type being encoded to.
 */
export type MaterializeEncoder<
  TValidatorHKT extends ValidatorHKTBase,
  TDecodedType,
  TEncodedType,
> = TValidatorHKT extends {
  readonly _getEncoder: unknown;
}
  ? (TValidatorHKT & {
      readonly _argDecodedType: TDecodedType;
      readonly _argEncodedType: TEncodedType;
    })["_getEncoder"]
  : never;

/**
 * This is type which operates on subtypes of {@link ValidatorHKTBase}, and is responsible for providing the actual generic type ("materializing") for a decoded type, given the decoder type.
 */
export type MaterializeDecodedType<
  TValidatorHKT extends ValidatorHKTBase,
  TDecoder,
> = TValidatorHKT extends { readonly _getDecodedType: unknown }
  ? (TValidatorHKT & { readonly _argDecoder: TDecoder })["_getDecodedType"]
  : never;

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * This is helper type to use in e.g. generic type constraints as base type for any decoder.
 */
export type AnyDecoderGeneric<TValidatorHKT extends ValidatorHKTBase> =
  MaterializeDecoder<TValidatorHKT, any>;
/**
 * This is helper type to use in e.g. generic type constraints as base type for any encoder.
 */
export type AnyEncoderGeneric<TValidatorHKT extends ValidatorHKTBase> =
  MaterializeEncoder<TValidatorHKT, any, any>;
