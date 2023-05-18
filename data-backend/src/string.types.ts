/**
 * @file This types-only file contains types related to textual data validation (header or query parameters).
 */
import type * as data from "@ty-ras/data";

/**
 * This interface defines shape related to validating generic named textual parameters, and holding metadata about the validators.
 */
export interface StringDataValidatorSpec<
  TStringData extends RuntimeAnyStringData,
  TDecoderOrEncoder,
  TSerializedValue,
  // eslint-disable-next-line @typescript-eslint/ban-types
  TAdditionalMetadata extends Record<string, unknown> = {},
> {
  /**
   * The validators of the generic named textual parameters.
   * Key is the parameter name, and value is the validator.
   */
  validators: StringDataValidators<
    TStringData,
    TSerializedValue,
    TDecoderOrEncoder extends WithDecoder<unknown> ? true : false
  >;
  /**
   * The metadata about the `validators`.
   * Key is the parameter name, and value is the metadata about the corresponding validator.
   */
  metadata: StringDataValidatorSpecMetadata<
    keyof TStringData & string,
    TDecoderOrEncoder & TAdditionalMetadata
  >;
}

/**
 * This type defines the shape of the metadata of the {@link StringDataValidatorSpec}.
 */
export type StringDataValidatorSpecMetadata<
  TKeys extends string,
  TDecoderOrEncoder,
> = {
  [P in TKeys]: TDecoderOrEncoder;
};

/**
 * This type defines the dictionary object containing {@link data.DataValidator}s of the generic named textual parameters.
 */
export type StringDataValidators<
  TStringData extends RuntimeAnyStringData,
  TSerializedValue,
  IsDecoder extends boolean,
> = {
  [P in keyof TStringData]-?: data.DataValidator<
    true extends IsDecoder ? TSerializedValue : TStringData[P],
    true extends IsDecoder ? TStringData[P] : TSerializedValue
  >;
};

/**
 * This type defines the base type for generic named textual parameters.
 */
export type RuntimeAnyStringData = Record<string, unknown>;

/**
 * This type defines base type for generic named textual parameters, which are deserialized (from HTTP request).
 * Currently these are HTTP request headers and query parameters.
 */
export type WithDecoder<TDecoder> = {
  /**
   * The 'native' decoder (deserialization) object.
   */
  decoder: TDecoder;
};

/**
 * This type defines base type for generic named textual parameters, which are serialized (to HTTP response).
 * Currently these are only HTTP response headers.
 */
export type WithEncoder<TEncoder> = {
  /**
   * The 'native' encoder (serialization) object.
   */
  encoder: TEncoder;
};
