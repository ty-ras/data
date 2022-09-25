/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import test, { ExecutionContext } from "ava";
import type * as data from "@ty-ras/data";
import * as spec from "../utils";
import { isDeepStrictEqual } from "util";
import type * as s from "../string";

test("Test default parameter regexp", (t) => {
  t.deepEqual(spec.defaultParameterRegExp(), /[^/]+/);
});

test("Test checkHeaders work", (t) => {
  t.plan(8);
  performCheckHeadersTest(
    t,
    {
      "Header-Name": validatorForValue("header-value"),
    },
    "header-value",
    false,
    "Header-Name",
    [
      true,
      {
        "Header-Name": "header-value",
      },
      {},
    ],
    "The header value must pass validation",
  );

  performCheckHeadersTest(
    t,
    {
      "Header-Name": validatorForValue("header-value"),
    },
    "header-value",
    true,
    "header-name",
    [
      true,
      {
        "Header-Name": "header-value",
      },
      {},
    ],
    "The header value must pass validation",
  );

  performCheckHeadersTest(
    t,
    {
      "Header-Name": validatorForValue("header-value"),
    },
    "not-header-value",
    false,
    "Header-Name",
    [
      false,
      {},
      {
        "Header-Name": {
          error: "error",
          errorInfo: "not-header-value",
          getHumanReadableMessage,
        },
      },
    ],
    "The header value must not pass validation",
  );

  performCheckHeadersTest(
    t,
    {
      "Header-Name-Ok": validatorForValue("header-value"),
      "Header-Name": validatorForValue("header-value"),
    },
    {
      "Header-Name-Ok": "header-value",
      "Header-Name": "not-header-value",
    },
    false,
    ["Header-Name-Ok", "Header-Name"],
    [
      false,
      {
        "Header-Name-Ok": "header-value",
      },
      {
        "Header-Name": {
          error: "error",
          errorInfo: "not-header-value",
          getHumanReadableMessage,
        },
      },
    ],
    "A single validation fail must fail whole headers validation as a whole",
  );
});

const performCheckHeadersTest = <THeadersData extends s.RuntimeAnyStringData>(
  t: ExecutionContext,
  validators: s.StringDataValidators<THeadersData, data.HeaderValue, boolean>,
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

const validatorForValue =
  <T>(value: T): data.DataValidator<unknown, T> =>
  (data) =>
    isDeepStrictEqual(data, value)
      ? { error: "none", data: data as any }
      : { error: "error", errorInfo: data, getHumanReadableMessage };

const getHumanReadableMessage = () => "";
