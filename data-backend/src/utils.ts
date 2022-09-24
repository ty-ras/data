import type * as data from "@ty-ras/data";
import type * as h from "./headers";

export const checkHeaders = <
  THeaderData extends h.RuntimeAnyHeaders,
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
      [P in keyof THeaderData]: THeaderData[P] extends data.DataValidator<
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

const DEFAULT_PARAM_REGEXP = /[^/]+/;
export const defaultParameterRegExp = () => new RegExp(DEFAULT_PARAM_REGEXP);
