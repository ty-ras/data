/**
 * @file This types-only file contains types related to textual data validation (header or query parameters).
 */

import type * as protocol from "@ty-ras/protocol";
import * as data from "@ty-ras/data";

/**
 * This function creates {@link StringDataValidatorSpec} for decoding (deserializing) data.
 * It is meant to be used by other TyRAS libraries, not by client code directly.
 * @param metadata The metadata about validating string-based datas.
 * @param decoderToValidator The callback to create generic TyRAS {@link data.DataValidator} from native decoder.
 * @param itemName The name of the thing being decoded (query parameter, header, etc).
 * @returns The {@link StringDataValidatorSpec} that can be further used in TyRAS libraries.
 */
export const stringDataValidatorDecoderGeneric = <
  TStringData extends protocol.TTextualDataBase,
  TValidatorHKT extends data.ValidatorHKTBase,
>(
  metadata: StringDataValidatorSpecMetadata<
    TStringData,
    TValidatorHKT,
    data.ReadonlyStringValue,
    true
  >,
  decoderToValidator: <TRuntime>(
    decoder: data.MaterializeDecoder<TValidatorHKT, TRuntime>,
  ) => data.DataValidator<data.ReadonlyStringValue, TRuntime>,
  itemName: string,
): StringDataValidatorSpec<
  TStringData,
  TValidatorHKT,
  data.ReadonlyStringValue,
  true
> => {
  return {
    validators: data.transformEntries(
      metadata,
      ({ required, decoder }, itemNameParam) => {
        const plainValidator = decoderToValidator(decoder);
        return required
          ? (item) =>
              item === undefined
                ? data.exceptionAsValidationError(
                    `${itemName} "${String(itemNameParam)}" is mandatory.`,
                  )
                : plainValidator(item)
          : plainValidator;
      },
    ) as StringDataValidators<TStringData, data.ReadonlyStringValue, true>,
    metadata,
  };
};

/**
 * This function creates {@link StringDataValidatorSpec} for encoding (serializing) data.
 * It is meant to be used by other TyRAS libraries, not by client code directly.
 * @param metadata The metadata about validating string-based datas.
 * @param encoderToValidator The callback to create generic TyRAS {@link data.DataValidator} from native encoder.
 * @param itemName The name of the thing being decoded (query parameter, header, etc).
 * @returns The {@link StringDataValidatorSpec} that can be further used in TyRAS libraries.
 */
export const stringDataValidatorEncoderGeneric = <
  TStringData extends protocol.TTextualDataBase,
  TValidatorHKT extends data.ValidatorHKTBase,
>(
  metadata: StringDataValidatorSpecMetadata<
    TStringData,
    TValidatorHKT,
    data.StringValue,
    false
  >,
  encoderToValidator: <TRuntime>(
    encoder: data.MaterializeEncoder<TValidatorHKT, TRuntime, data.StringValue>,
  ) => data.DataValidator<TRuntime, data.StringValue>,
  itemName: string,
): StringDataValidatorSpec<
  TStringData,
  TValidatorHKT,
  data.StringValue,
  false
> => {
  return {
    validators: data.transformEntries(
      metadata,
      ({ required, encoder }, itemNameParam) => {
        const plainValidator = encoderToValidator(encoder);
        return required
          ? (item: data.StringValue) =>
              item === undefined
                ? data.exceptionAsValidationError(
                    `${itemName} "${String(itemNameParam)}" is mandatory.`,
                  )
                : plainValidator(item)
          : plainValidator;
      },
    ) as unknown as StringDataValidators<TStringData, data.StringValue, false>,
    metadata,
  };
};

/**
 * This is auxiliary type used by {@link RequiredKeys}.
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * This is type to extract keys of given object which are required.
 * Originally from [StackOverflow](https://stackoverflow.com/questions/53809467/typescript-how-get-optional-keys-of-type).
 */
export type RequiredKeys<T> = Exclude<
  KeysOfType<T, Exclude<T[keyof T], undefined>>,
  undefined
>;

/**
 * This is type to extract keys of given object which are optional.
 * Originally from [StackOverflow](https://stackoverflow.com/questions/53809467/typescript-how-get-optional-keys-of-type).
 */
export type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;

/**
 * This interface defines shape related to validating generic named textual parameters, and holding metadata about the validators.
 */
export interface StringDataValidatorSpec<
  TStringData extends protocol.TTextualDataBase,
  TValidatorHKT extends data.ValidatorHKTBase,
  TSerializedValue,
  IsDecoder extends boolean,
> {
  /**
   * The validators of the generic named textual parameters.
   * Key is the parameter name, and value is the validator.
   */
  validators: StringDataValidators<TStringData, TSerializedValue, IsDecoder>;
  /**
   * The metadata about the `validators`.
   * Key is the parameter name, and value is the metadata about the corresponding validator.
   */
  metadata: StringDataValidatorSpecMetadata<
    TStringData,
    TValidatorHKT,
    TSerializedValue,
    IsDecoder
  >;
}

/**
 * This type defines the shape of the metadata of the {@link StringDataValidatorSpec}.
 */
export type StringDataValidatorSpecMetadata<
  TStringData extends protocol.TTextualDataBase,
  TValidatorHKT extends data.ValidatorHKTBase,
  TSerializedValue,
  IsDecoder extends boolean,
> = {
  [P in RequiredKeys<TStringData>]-?: (true extends IsDecoder
    ? WithDecoder<TValidatorHKT, TStringData[P]>
    : WithEncoder<TValidatorHKT, TStringData[P], TSerializedValue>) & {
    required: true;
  };
} & {
  [P in OptionalKeys<TStringData>]-?: (true extends IsDecoder
    ? WithDecoder<TValidatorHKT, TStringData[P]>
    : WithEncoder<TValidatorHKT, TStringData[P], TSerializedValue>) & {
    required: false;
  };
};

/**
 * This type defines the dictionary object containing {@link data.DataValidator}s of the generic named textual parameters.
 */
export type StringDataValidators<
  TStringData extends protocol.TTextualDataBase,
  TSerializedValue,
  IsDecoder extends boolean,
> = {
  [P in keyof TStringData]-?: data.DataValidator<
    true extends IsDecoder ? TSerializedValue : TStringData[P],
    true extends IsDecoder ? TStringData[P] : TSerializedValue
  >;
};

/**
 * This type defines base type for generic named textual parameters, which are deserialized (from HTTP request).
 * Currently these are HTTP request headers and query parameters.
 */
export type WithDecoder<
  TValidatorHKT extends data.ValidatorHKTBase,
  TDecoded,
> = {
  /**
   * The 'native' decoder (deserialization) object.
   */
  decoder: data.MaterializeDecoder<TValidatorHKT, TDecoded>;
};

/**
 * This type defines base type for generic named textual parameters, which are serialized (to HTTP response).
 * Currently these are only HTTP response headers.
 */
export type WithEncoder<
  TValidatorHKT extends data.ValidatorHKTBase,
  TDecoded,
  TEncoded,
> = {
  /**
   * The 'native' encoder (serialization) object.
   */
  encoder: data.MaterializeEncoder<TValidatorHKT, TDecoded, TEncoded>;
};
