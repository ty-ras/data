import type * as data from "@ty-ras/data";
import type * as s from "./string";

export type RequestHeaderDataValidatorSpec<
  THeaderData extends RuntimeAnyHeaders,
  TDecoder,
> = HeaderDataValidatorSpec<THeaderData, s.WithDecoder<TDecoder>>;
export type ResponseHeaderDataValidatorSpec<
  THeaderData extends RuntimeAnyHeaders,
  TEncoder,
> = HeaderDataValidatorSpec<THeaderData, s.WithEncoder<TEncoder>>;
export type HeaderDataValidatorSpec<
  THeaderData extends RuntimeAnyHeaders,
  TDecoderOrEncoder,
> = s.StringDataValidatorSpec<
  THeaderData,
  TDecoderOrEncoder,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TDecoderOrEncoder extends s.WithDecoder<infer _>
    ? data.ReadonlyHeaderValue
    : data.HeaderValue,
  HeaderValidationAdditionalMetadata
>;

export type HeaderValidationAdditionalMetadata = {
  required: boolean;
};

export type RequestHeaderDataValidatorSpecMetadata<
  THeaderNames extends string,
  TDecoder,
> = HeaderDataValidatorSpecMetadata<THeaderNames, s.WithDecoder<TDecoder>>;
export type ResponseHeaderDataValidatorSpecMetadata<
  THeaderNames extends string,
  TEncoder,
> = HeaderDataValidatorSpecMetadata<THeaderNames, s.WithEncoder<TEncoder>>;
export type HeaderDataValidatorSpecMetadata<
  THeaderNames extends string,
  TDecoderOrEncoder,
> = s.StringDataValidatorSpecMetadata<
  THeaderNames,
  HeaderValidationAdditionalMetadata & TDecoderOrEncoder
>;

export type RequestHeaderDataValidators<THeaderData extends RuntimeAnyHeaders> =
  HeaderDataValidators<THeaderData, true>;
export type ResponseHeaderDataValidators<
  THeaderData extends RuntimeAnyHeaders,
> = HeaderDataValidators<THeaderData, false>;
export type HeaderDataValidators<
  THeaderData extends RuntimeAnyHeaders,
  IsDecoder extends boolean,
> = s.StringDataValidators<
  THeaderData,
  true extends IsDecoder ? data.ReadonlyHeaderValue : data.HeaderValue,
  IsDecoder
>;

export type RuntimeAnyHeaders = Record<string, unknown>;
