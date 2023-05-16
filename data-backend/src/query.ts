/**
 * @file This file contains types related to query data validation.
 */
import type * as data from "@ty-ras/data";
import type * as s from "./string";

/**
 * This type specifies the shape for query data validation: the validator for each query parameter name, and metadata associated with them.
 * @see {s.StringDataValidatorSpec}
 */
export type QueryValidatorSpec<
  TQueryData extends RuntimeAnyQuery,
  TDecoder,
> = s.StringDataValidatorSpec<
  TQueryData,
  s.WithDecoder<TDecoder>,
  data.ReadonlyQueryValue,
  QueryValidationAdditionalMetadata
>;

/**
 * This type describes the runtime validators used to validate the query data parameters.
 */
export type QueryDataValidators<TQueryData extends RuntimeAnyQuery> =
  s.StringDataValidators<TQueryData, data.ReadonlyQueryValue, true>;

/**
 * This is the metadata information about validation related to query parameters data validation.
 */
export type QueryDataValidatorSpecMetadata<
  TQueryNames extends string,
  TDecoder,
> = s.StringDataValidatorSpecMetadata<
  TQueryNames,
  s.WithDecoder<TDecoder> & QueryValidationAdditionalMetadata
>;

/**
 * This type is base type constraint for query parameters data.
 */
export type RuntimeAnyQuery = Record<string, unknown>;

/**
 * This is metadata parameter for {@link s.StringDataValidatorSpec}, and it specifies the properties required for metadata object of each query parameter validation.
 */
export type QueryValidationAdditionalMetadata = {
  /**
   * This property specifies whether the query parameter is deemed to be required.
   */
  required: boolean;
};
