/**
 * @file This file contains unit tests for code in `../errors.ts`.
 */

import test from "ava";
import * as spec from "../errors";

test("Validate that error object passes as-is", (c) => {
  c.plan(1);
  const error = new Error("Error");
  c.is(spec.toError(error), error);
});

test("Validate that output error returns expected error message", (c) => {
  c.plan(1);
  c.deepEqual(
    spec.toError({ error: "error", errorInfo, getHumanReadableMessage })
      .message,
    `Error with API call output: ${MESSAGE}`,
  );
});

test("Validate that input error returns expected error message", (c) => {
  c.plan(1);
  // c.deepEqual(
  //   spec.toError({
  //     error: "error-input",
  //     errorInfo: { body: { error: "missing-validator" } },
  //   }).message,
  //   'Error with API call input: No validator for "body".',
  // );

  c.deepEqual(
    spec.toError({
      error: "error-input",
      errorInfo: {
        url: {
          error: "error",
          errorInfo,
          getHumanReadableMessage,
        },
      },
    }).message,
    `Error with API call input: Validator for "url" returned: ${MESSAGE}`,
  );
});

const getHumanReadableMessage = () => MESSAGE;
const MESSAGE = "The message";
const errorInfo = undefined;
