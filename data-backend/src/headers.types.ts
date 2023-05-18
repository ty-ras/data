/**
 * @file This types-only file contains types related to HTTP headers: request header functionality, request header data, and response header data.
 */
import type * as data from "@ty-ras/data";
import type * as s from "./string.types";

/**
 * This type specifies the shape for request header data validation: the validator for each header name, and metadata associated with them.
 * @see HeaderDataValidatorSpec
 * @see s.StringDataValidatorSpec
 */
export type RequestHeaderDataValidatorSpec<
  THeaderData extends RuntimeAnyHeaders,
  TDecoder,
> = HeaderDataValidatorSpec<THeaderData, s.WithDecoder<TDecoder>>;

/**
 * This type specifies the shape for response header data validation: the validator for each header name, and metadata associated with them.
 * @see HeaderDataValidatorSpec
 * @see s.StringDataValidatorSpec
 */
export type ResponseHeaderDataValidatorSpec<
  THeaderData extends RuntimeAnyHeaders,
  TEncoder,
> = HeaderDataValidatorSpec<THeaderData, s.WithEncoder<TEncoder>>;

/**
 * This type is generic parametrizable header data validation type used by {@link RequestHeaderDataValidatorSpec} and {@link ResponseHeaderDataValidatorSpec}.
 * It is not meant to be used directly.
 */
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

/**
 * This is metadata parameter for {@link s.StringDataValidatorSpec}, and it specifies the properties required for metadata object of each header validation.
 */
export type HeaderValidationAdditionalMetadata = {
  /**
   * This property specifies whether the header is deemed to be required.
   */
  required: boolean;
};

/**
 * This is the metadata information about validation related to request header data validation.
 */
export type RequestHeaderDataValidatorSpecMetadata<
  THeaderNames extends string,
  TDecoder,
> = HeaderDataValidatorSpecMetadata<THeaderNames, s.WithDecoder<TDecoder>>;

/**
 * This is the metadata information about validation related to response header data validation.
 */
export type ResponseHeaderDataValidatorSpecMetadata<
  THeaderNames extends string,
  TEncoder,
> = HeaderDataValidatorSpecMetadata<THeaderNames, s.WithEncoder<TEncoder>>;

/**
 * This type is generic parametrizable header data validation type used by {@link RequestHeaderDataValidatorSpecMetadata} and {@link ResponseHeaderDataValidatorSpecMetadata}.
 * It is not meant to be used directly.
 */
export type HeaderDataValidatorSpecMetadata<
  THeaderNames extends string,
  TDecoderOrEncoder,
> = s.StringDataValidatorSpecMetadata<
  THeaderNames,
  HeaderValidationAdditionalMetadata & TDecoderOrEncoder
>;

/**
 * This type describes the runtime validators used to validate the request headers.
 */
export type RequestHeaderDataValidators<THeaderData extends RuntimeAnyHeaders> =
  HeaderDataValidators<THeaderData, true>;
/**
 * This type describes the runtime validators used to validate the response headers.
 */
export type ResponseHeaderDataValidators<
  THeaderData extends RuntimeAnyHeaders,
> = HeaderDataValidators<THeaderData, false>;
/**
 * This type is generic parametrizable header data validation type used by {@link RequestHeaderDataValidators} and {@link ResponseHeaderDataValidators}.
 * It is not meant to be used directly.
 */
export type HeaderDataValidators<
  THeaderData extends RuntimeAnyHeaders,
  IsDecoder extends boolean,
> = s.StringDataValidators<
  THeaderData,
  true extends IsDecoder ? data.ReadonlyHeaderValue : data.HeaderValue,
  IsDecoder
>;

/**
 * This type is base type constraint for request or response header data.
 */
export type RuntimeAnyHeaders = Record<string, unknown>;
