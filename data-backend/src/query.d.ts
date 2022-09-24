import type * as data from "@ty-ras/data";
import type * as s from "./string";

export type QueryValidatorSpec<
  TQueryData extends RuntimeAnyQuery,
  TDecoder,
> = s.StringDataValidatorSpec<
  TQueryData,
  s.WithDecoder<TDecoder>,
  data.QueryValue,
  QueryValidationAdditionalMetadata
>;

export type QueryDataValidators<TQueryData extends RuntimeAnyQuery> =
  s.StringDataValidators<TQueryData, data.QueryValue, true>;

export type QueryDataValidatorSpecMetadata<
  TQueryNames extends string,
  TDecoder,
> = s.StringDataValidatorSpecMetadata<
  TQueryNames,
  s.WithDecoder<TDecoder> & QueryValidationAdditionalMetadata
>;

export type RuntimeAnyQuery = Record<string, unknown>;

export type QueryValidationAdditionalMetadata = {
  required: boolean;
};
