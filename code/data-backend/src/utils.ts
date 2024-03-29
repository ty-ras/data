/**
 * @file This file contains generic utilities related to HTTP headers and URL parameter RegExps.
 */

import type * as protocol from "@ty-ras/protocol";
import type * as data from "@ty-ras/data";
import type * as h from "./headers.types";

/**
 * This is callback to check for request or response headers against validators.
 * It is meant to be used by other TyRAS components, and not by client code directly.
 * @param headersValidation The validators for the header data.
 * @param getHeaderValue The callback to get the values for the validators.
 * @param lowercaseHeaderName Should the header names be lower-cased before passing them to `getHeaderValue` callback.
 * @returns The tuple describing: whether the headers passed validation, the possibly validated headers if so, and any errors.
 */
export const checkHeaders = <
  THeaderData extends
    | protocol.TRequestHeadersDataBase
    | protocol.TResponseHeadersDataBase, // eslint-disable-line @typescript-eslint/no-duplicate-type-constituents
  IsDecoder extends boolean,
>(
  headersValidation: h.HeaderDataValidators<THeaderData, IsDecoder>,
  getHeaderValue: (
    headerName: string,
  ) => Parameters<
    h.HeaderDataValidators<THeaderData, IsDecoder>[keyof THeaderData]
  >[0],
  lowercaseHeaderName: boolean,
) => {
  const headers: Record<
    string,
    {
      [P in keyof THeaderData]: (typeof headersValidation)[P] extends data.DataValidator<
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        infer _,
        infer TData
      >
        ? TData
        : never;
    }[keyof THeaderData]
  > = {};
  let proceedToInvokeHandler = true;
  const errors: Record<string, data.DataValidatorResultError> = {};
  for (const [hdrName, hdrValidation] of Object.entries<
    h.HeaderDataValidators<THeaderData, IsDecoder>[keyof THeaderData]
  >(
    headersValidation as {
      [p: string]: h.HeaderDataValidators<
        THeaderData,
        IsDecoder
      >[keyof THeaderData];
    },
  )) {
    const validatedHeader = hdrValidation(
      getHeaderValue(lowercaseHeaderName ? hdrName.toLowerCase() : hdrName),
    );
    if (validatedHeader.error === "none") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      headers[hdrName] = validatedHeader.data as any;
    } else {
      proceedToInvokeHandler = false;
      errors[hdrName] = validatedHeader;
    }
  }

  return [proceedToInvokeHandler, headers, errors] as const;
};
