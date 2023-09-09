/**
 * @file This file contains ULR-path specific things common for both BE and FE usage of TyRAS.
 */

const DEFAULT_PARAM_REGEXP = /[^/]+/;
/**
 * This helper callback creates new {@link RegExp} which has the default pattern to match parameters encoded in URL path string.
 * The pattern is `[^/]+`, so as many consecutive characters as possible until encountering first `/`.
 * @returns A new RegExp with the default pattern to match parameters encoded in URL path string.
 */
export const defaultParameterRegExp = () => new RegExp(DEFAULT_PARAM_REGEXP);
