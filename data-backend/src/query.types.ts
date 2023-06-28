/**
 * @file This types-only file contains types related to query data validation.
 */

import type * as protocol from "@ty-ras/protocol";
import type * as data from "@ty-ras/data";
import * as s from "./string";

/**
 * This type specifies the shape for query data validation: the validator for each query parameter name, and metadata associated with them.
 * @see {s.StringDataValidatorSpec}
 */
export type QueryValidatorSpec<
  TQueryData extends protocol.TQueryDataBase,
  TValidatorHKT extends data.ValidatorHKTBase,
> = s.StringDataValidatorSpec<
  TQueryData,
  TValidatorHKT,
  data.ReadonlyQueryValue,
  true
>;

/**
 * This type describes the runtime validators used to validate the query data parameters.
 */
export type QueryDataValidators<TQueryData extends protocol.TQueryDataBase> =
  s.StringDataValidators<TQueryData, data.ReadonlyQueryValue, true>;

/**
 * This is the metadata information about validation related to query parameters data validation.
 */
export type QueryDataValidatorSpecMetadata<
  TQueryData extends protocol.TQueryDataBase,
  TValidatorHKT extends data.ValidatorHKTBase,
> = s.StringDataValidatorSpecMetadata<
  TQueryData,
  TValidatorHKT,
  data.ReadonlyQueryValue,
  true
>;
