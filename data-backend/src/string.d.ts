import type * as data from "@ty-ras/data";

export interface StringDataValidatorSpec<
  THeaderData extends RuntimeAnyStringData,
  TDecoderOrEncoder,
  TSerializedValue,
  // eslint-disable-next-line @typescript-eslint/ban-types
  TAdditionalMetadata extends Record<string, unknown> = {},
> {
  validators: StringDataValidators<
    THeaderData,
    TSerializedValue,
    TDecoderOrEncoder extends WithDecoder<unknown> ? true : false
  >;
  metadata: StringDataValidatorSpecMetadata<
    keyof THeaderData & string,
    TDecoderOrEncoder & TAdditionalMetadata
  >;
}

export type StringDataValidatorSpecMetadata<
  TKeys extends string,
  TDecoderOrEncoder,
> = {
  [P in TKeys]: TDecoderOrEncoder;
};

export type StringDataValidators<
  THeaderData extends RuntimeAnyStringData,
  TSerializedValue,
  IsDecoder extends boolean,
> = {
  [P in keyof THeaderData]-?: data.DataValidator<
    true extends IsDecoder ? TSerializedValue : THeaderData[P],
    true extends IsDecoder ? THeaderData[P] : TSerializedValue
  >;
};

export type RuntimeAnyStringData = Record<string, unknown>;

export type WithDecoder<TDecoder> = { decoder: TDecoder };
export type WithEncoder<TEncoder> = { encoder: TEncoder };
