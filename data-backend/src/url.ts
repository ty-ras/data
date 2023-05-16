import type * as s from "./string";

export type URLParameterValidatorSpec<
  TURLData extends RuntimeAnyURLData,
  TDecoder,
> = s.StringDataValidatorSpec<
  TURLData,
  s.WithDecoder<TDecoder>,
  URLParameterValue,
  URLParameterValidationAdditionalMetadata
>;

export type URLParameterValidators<TURLData extends RuntimeAnyURLData> =
  s.StringDataValidators<TURLData, URLParameterValue, true>;

export type URLParameterValidatorSpecMetadata<
  TURLDataNames extends string,
  TDecoder,
> = s.StringDataValidatorSpecMetadata<
  TURLDataNames,
  s.WithDecoder<TDecoder> & URLParameterValidationAdditionalMetadata
>;

export type RuntimeAnyURLData = Record<string, unknown>;

export type URLParameterValidationAdditionalMetadata = {
  regExp: RegExp;
};

export type URLParameterValue = string;
