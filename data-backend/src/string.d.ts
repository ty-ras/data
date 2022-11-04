import type * as data from "@ty-ras/data";

export interface StringDataValidatorSpec<
  TStringData extends RuntimeAnyStringData,
  TDecoderOrEncoder,
  TSerializedValue,
  // eslint-disable-next-line @typescript-eslint/ban-types
  TAdditionalMetadata extends Record<string, unknown> = {},
> {
  validators: StringDataValidators<
    TStringData,
    TSerializedValue,
    TDecoderOrEncoder extends WithDecoder<unknown> ? true : false
  >;
  metadata: StringDataValidatorSpecMetadata<
    keyof TStringData & string,
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
  TStringData extends RuntimeAnyStringData,
  TSerializedValue,
  IsDecoder extends boolean,
> = {
  [P in keyof TStringData]-?: data.DataValidator<
    true extends IsDecoder ? TSerializedValue : TStringData[P],
    true extends IsDecoder ? TStringData[P] : TSerializedValue
  >;
};

export type RuntimeAnyStringData = Record<string, unknown>;

export type WithDecoder<TDecoder> = { decoder: TDecoder };
export type WithEncoder<TEncoder> = { encoder: TEncoder };
