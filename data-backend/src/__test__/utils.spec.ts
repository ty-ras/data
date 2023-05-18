/**
 * @file This file contains unit tests for code in `../utils.ts`.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import test, { ExecutionContext } from "ava";
import * as spec from "../utils";
import * as common from "./common";
import type * as data from "@ty-ras/data";
import type * as s from "../string.types";

test("Test default parameter regexp", (t) => {
  t.deepEqual(spec.defaultParameterRegExp(), /[^/]+/);
});

test("Test checkHeaders work", (t) => {
  t.plan(8);
  performCheckHeadersTest(
    t,
    {
      [HEADER_NAME]: common.validatorForValue(HEADER_VALUE),
    },
    HEADER_VALUE,
    false,
    HEADER_NAME,
    [
      true,
      {
        [HEADER_NAME]: HEADER_VALUE,
      },
      {},
    ],
    "The header value must pass validation",
  );

  performCheckHeadersTest(
    t,
    {
      [HEADER_NAME]: common.validatorForValue(HEADER_VALUE),
    },
    HEADER_VALUE,
    true,
    "header-name",
    [
      true,
      {
        [HEADER_NAME]: HEADER_VALUE,
      },
      {},
    ],
    "The header value must pass validation",
  );

  performCheckHeadersTest(
    t,
    {
      "Header-Name": common.validatorForValue(HEADER_VALUE),
    },
    NOT_HEADER_VALUE,
    false,
    HEADER_NAME,
    [
      false,
      {},
      {
        [HEADER_NAME]: {
          error: "error",
          errorInfo: NOT_HEADER_VALUE,
          getHumanReadableMessage: common.getHumanReadableMessage,
        },
      },
    ],
    "The header value must not pass validation",
  );

  performCheckHeadersTest(
    t,
    {
      "Header-Name-Ok": common.validatorForValue(HEADER_VALUE),
      [HEADER_NAME]: common.validatorForValue(HEADER_VALUE),
    },
    {
      "Header-Name-Ok": HEADER_VALUE,
      [HEADER_NAME]: NOT_HEADER_VALUE,
    },
    false,
    ["Header-Name-Ok", HEADER_NAME],
    [
      false,
      {
        "Header-Name-Ok": HEADER_VALUE,
      },
      {
        [HEADER_NAME]: {
          error: "error",
          errorInfo: NOT_HEADER_VALUE,
          getHumanReadableMessage: common.getHumanReadableMessage,
        },
      },
    ],
    "A single validation fail must fail whole headers validation as a whole",
  );
});

const performCheckHeadersTest = <THeadersData extends s.RuntimeAnyStringData>(
  t: ExecutionContext,
  validators: s.StringDataValidators<
    THeadersData,
    data.ReadonlyHeaderValue,
    boolean
  >,
  headerValues: data.HeaderValue | Record<string, data.HeaderValue>,
  lowercaseHeaderName: boolean,
  expectedHeaderNames: data.OneOrMany<string>,
  expectedReturnValue: [
    boolean,
    Record<string, unknown>,
    Record<string, data.DataValidatorResultError>,
  ],
  message: string,
) => {
  const seenHeaderNames: Array<string> = [];
  t.deepEqual(
    spec.checkHeaders(
      validators,
      (headerName) => {
        seenHeaderNames.push(headerName);
        return typeof headerValues === "object" && !Array.isArray(headerValues)
          ? headerValues[headerName]
          : headerValues;
      },
      lowercaseHeaderName,
    ),
    expectedReturnValue,
    message,
  );
  const expectedHeaderNamesSet = new Set(
    Array.isArray(expectedHeaderNames)
      ? expectedHeaderNames
      : [expectedHeaderNames],
  );
  t.deepEqual(
    new Set(seenHeaderNames),
    expectedHeaderNamesSet,
    `The header names must match`,
  );
};

const HEADER_VALUE = "header-value";
const HEADER_NAME = "Header-Name";
const NOT_HEADER_VALUE = `not-${HEADER_VALUE}`;
