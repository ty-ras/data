/**
 * @file This types-only file contains types related to validating parameters encoded in URL path string.
 */

import type * as s from "./string.types";

/**
 * This type specifies the shape for validating parameters encoded in URL path string.: the validator for path parameter name, and metadata associated with them.
 * @see s.StringDataValidatorSpec
 */
export type URLParameterValidatorSpec<
  TURLData extends RuntimeAnyURLData,
  TDecoder,
> = s.StringDataValidatorSpec<
  TURLData,
  s.WithDecoder<TDecoder>,
  URLParameterValue,
  URLParameterValidationAdditionalMetadata
>;

/**
 * This type describes the runtime validators used to validate the parameters encoded in URL path string.
 */
export type URLParameterValidators<TURLData extends RuntimeAnyURLData> =
  s.StringDataValidators<TURLData, URLParameterValue, true>;

/**
 * This is the metadata information about validation related to the parameters encoded in URL path string.
 */
export type URLParameterValidatorSpecMetadata<
  TURLDataNames extends string,
  TDecoder,
> = s.StringDataValidatorSpecMetadata<
  TURLDataNames,
  s.WithDecoder<TDecoder> & URLParameterValidationAdditionalMetadata
>;

/**
 * This is base type constraint for the parameters encoded in URL path string.
 */
export type RuntimeAnyURLData = Record<string, unknown>;

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
