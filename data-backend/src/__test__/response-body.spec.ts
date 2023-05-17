/**
 * @file This file contains unit tests for code in `../response-body.ts`.
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import test from "ava";
import * as spec from "../response-body";
import * as errors from "../errors";
import * as common from "./common";
import type * as data from "@ty-ras/data";

test("Validate responseBody works", (c) => {
  c.plan(3);
  const data = "Value";
  const { validator, validatorSpec } = createResponseBody(data);
  c.deepEqual(validatorSpec, {
    contents: {
      [common.CONTENT_TYPE]: common.VALIDATOR_NATIVE,
    },
  });
  c.deepEqual(validator(data), {
    error: "none",
    data: {
      contentType: common.CONTENT_TYPE,
      output: JSON.stringify(data),
    },
  });
  c.like(validator(123), {
    error: "error",
    errorInfo: 123,
  });
});

test("Validate response body detects invalid JSON", (c) => {
  c.plan(1);
  const { validator } = createResponseBodyWithValidator((data) => ({
    error: "none",
    data,
  }));
  const recursive: Recursive = {} as any;
  recursive.a = recursive;
  c.like(validator(recursive), {
    error: "error",
    errorInfo: new TypeError(
      `Converting circular structure to JSON
    --> starting at object with constructor 'Object'
    --- property 'a' closes the circle`,
    ),
  });
});

test("Validate response body detects HTTPError", (c) => {
  const { validator } = createResponseBodyWithValidator(() => {
    throw new errors.HTTPError(404);
  });
  c.deepEqual(validator("ignored"), {
    error: "protocol-error",
    statusCode: 404,
    body: undefined,
  });
});

interface Recursive {
  a: Recursive;
}

const createResponseBody = <T>(value: T) =>
  createResponseBodyWithValidator(common.validatorForValue(value));

const createResponseBodyWithValidator = <T>(
  validator: data.DataValidator<unknown, T>,
) =>
  spec.responseBodyGeneric(
    common.VALIDATOR_NATIVE,
    validator,
    common.CONTENT_TYPE,
  );
