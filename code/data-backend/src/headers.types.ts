/**
 * @file This types-only file contains types related to HTTP headers: request header functionality, request header data, and response header data.
 */

import type * as data from "@ty-ras/data";
import type * as protocol from "@ty-ras/protocol";
import * as s from "./string";

/**
 * This type specifies the shape for request header data validation: the validator for each header name, and metadata associated with them.
 * @see HeaderDataValidatorSpec
 * @see s.StringDataValidatorSpec
 */
export type RequestHeaderDataValidatorSpec<
  THeaderData extends protocol.TRequestHeadersDataBase,
  TValidatorHKT extends data.ValidatorHKTBase,
> = HeaderDataValidatorSpec<THeaderData, TValidatorHKT, true>;

/**
 * This type specifies the shape for response header data validation: the validator for each header name, and metadata associated with them.
 * @see HeaderDataValidatorSpec
 * @see s.StringDataValidatorSpec
 */
export type ResponseHeaderDataValidatorSpec<
  THeaderData extends protocol.TResponseHeadersDataBase,
  TValidatorHKT extends data.ValidatorHKTBase,
> = HeaderDataValidatorSpec<THeaderData, TValidatorHKT, false>;

/**
 * This type is generic parametrizable header data validation type used by {@link RequestHeaderDataValidatorSpec} and {@link ResponseHeaderDataValidatorSpec}.
 * It is not meant to be used directly.
 */
export type HeaderDataValidatorSpec<
  THeaderData extends
    | protocol.TRequestHeadersDataBase
    | protocol.TResponseHeadersDataBase,
  TValidatorHKT extends data.ValidatorHKTBase,
  IsDecoder extends boolean,
> = s.StringDataValidatorSpec<
  THeaderData,
  TValidatorHKT,
  true extends IsDecoder ? data.ReadonlyHeaderValue : data.HeaderValue,
  IsDecoder
>;

/**
 * This is the metadata information about validation related to request header data validation.
 */
export type RequestHeaderDataValidatorSpecMetadata<
  THeaderData extends protocol.TRequestHeadersDataBase,
  TValidatorHKT extends data.ValidatorHKTBase,
> = HeaderDataValidatorSpecMetadata<THeaderData, TValidatorHKT, true>;

/**
 * This is the metadata information about validation related to response header data validation.
 */
export type ResponseHeaderDataValidatorSpecMetadata<
  THeaderData extends protocol.TResponseHeadersDataBase,
  TValidatorHKT extends data.ValidatorHKTBase,
> = HeaderDataValidatorSpecMetadata<THeaderData, TValidatorHKT, false>;

/**
 * This type is generic parametrizable header data validation type used by {@link RequestHeaderDataValidatorSpecMetadata} and {@link ResponseHeaderDataValidatorSpecMetadata}.
 * It is not meant to be used directly.
 */
export type HeaderDataValidatorSpecMetadata<
  THeaderData extends
    | protocol.TRequestHeadersDataBase
    | protocol.TResponseHeadersDataBase,
  TValidatorHKT extends data.ValidatorHKTBase,
  IsDecoder extends boolean,
> = s.StringDataValidatorSpecMetadata<
  THeaderData,
  TValidatorHKT,
  true extends IsDecoder ? data.ReadonlyHeaderValue : data.HeaderValue,
  IsDecoder
>;

/**
 * This type describes the runtime validators used to validate the request headers.
 */
export type RequestHeaderDataValidators<
  THeaderData extends protocol.TRequestHeadersDataBase,
> = HeaderDataValidators<THeaderData, true>;
/**
 * This type describes the runtime validators used to validate the response headers.
 */
export type ResponseHeaderDataValidators<
  THeaderData extends protocol.TResponseHeadersDataBase,
> = HeaderDataValidators<THeaderData, false>;
/**
 * This type is generic parametrizable header data validation type used by {@link RequestHeaderDataValidators} and {@link ResponseHeaderDataValidators}.
 * It is not meant to be used directly.
 */
export type HeaderDataValidators<
  THeaderData extends
    | protocol.TRequestHeadersDataBase
    | protocol.TResponseHeadersDataBase,
  IsDecoder extends boolean,
> = s.StringDataValidators<
  THeaderData,
  true extends IsDecoder ? data.ReadonlyHeaderValue : data.HeaderValue,
  IsDecoder
>;
