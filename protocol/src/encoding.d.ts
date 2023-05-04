/**
 * @file This file contains types related to express some part of HTTP protocol data, type of which varies depending whether it is in transit, or loaded in JS app.
 */

/**
 * This interface should be used for data, type of which varies depending whether it is in transit, or loaded in JS app.
 *
 * This is purely virtual interface for type deduction.
 * No instances of this interface are meant to exist, therefore "& never" for field values.
 *
 * One common usecase for this is to express timestamps like `Encoded<Date, string>`, to signify that timestamp is stringified when serialized, and exists as `Date` object when deserialized.
 */
export interface Encoded<TRuntime, TEncoded> {
  /**
   * The type of the data when it is loaded in JS app.
   */
  __runtime: TRuntime & never;

  /**
   * The type of the data when it is in transit.
   */
  __encoded: TEncoded & never;
}

/**
 * This is higher-kinded type (HKT) to be used as generic argument without having generic arguments itself.
 * See [docs](https://www.matechs.com/blog/encoding-hkts-in-typescript-once-again) to see the HKT in action.
 *
 * This type is meant to be used by other TyRAS packages.
 */
export interface HKTEncodedBase {
  /**
   * The encoded specification, typically of shape of {@link Encoded}.
   */
  readonly _TEncodedSpec?: unknown;
  /**
   * The type that will use the `_TEncodedSpec` to build encoded type.
   */
  readonly typeEncoded?: unknown;
}

/**
 * Helper type to deduce the runtime type of data marked with {@link Encoded} type.
 */
export type RuntimeOf<T> = T extends Array<infer U>
  ? GetRuntimeArray<U>
  : // eslint-disable-next-line @typescript-eslint/no-unused-vars
  T extends Encoded<infer TRuntime, infer _>
  ? TRuntime
  : T extends object
  ? GetRuntimeObject<T>
  : T;
/**
 * Helper type used by {@link RuntimeOf}, for non-array objects.
 */
export type GetRuntimeObject<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [P in keyof T]: T[P] extends Function ? T[P] : RuntimeOf<T[P]>;
};
/**
 * Helper type used by {@link RuntimeOf}, for array objects.
 */
export type GetRuntimeArray<T> = Array<RuntimeOf<T>>;

/**
 * Helper type to deduce the in-transit type of data marked with {@link Encoded} type, using custom type in `_TEncodedSpec` property.
 * That type should take one generic argument, and it will be the `TSpec` generic argument of this type.
 * See docs of {@link HKTEncodedBase} for more info.
 */
export type EncodedOf<F extends HKTEncodedBase, TSpec> = F extends {
  readonly typeEncoded: unknown;
}
  ? (F & {
      readonly _TEncodedSpec: TSpec;
    })["typeEncoded"]
  : never;
