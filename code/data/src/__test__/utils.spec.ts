/**
 * @file This file contains tests for utils.ts file in parent folder.
 */
import test from "ava";
import * as spec from "../utils";
import type * as common from "../validation";

test("Test transitiveDataValidation works", (t) => {
  t.plan(3);
  const getHumanReadableMessage1 = () => "Must be string";
  const getHumanReadableMessage2 = () => "Must be int string";
  const stringValidation: common.DataValidator<unknown, string> = (data) =>
    typeof data === "string"
      ? { error: "none", data }
      : {
          error: "error",
          errorInfo: getHumanReadableMessage1(),
          getHumanReadableMessage: getHumanReadableMessage1,
        };
  const parseIntValidation: common.DataValidator<
    string,
    number,
    { error: "error-custom" } & Omit<common.DataValidatorResultError, "error">
  > = (str) => {
    const maybeInt = parseInt(str);
    return isNaN(maybeInt)
      ? {
          error: "error-custom",
          errorInfo: getHumanReadableMessage2(),
          getHumanReadableMessage: getHumanReadableMessage2,
        }
      : {
          error: "none",
          data: maybeInt,
        };
  };
  const intString = spec.transitiveDataValidation(
    stringValidation,
    parseIntValidation,
  );
  t.deepEqual(intString("Hello"), {
    error: "error-custom",
    errorInfo: getHumanReadableMessage2(),
    getHumanReadableMessage: getHumanReadableMessage2,
  });
  t.deepEqual(intString("123"), {
    error: "none",
    data: 123,
  });
  t.deepEqual(intString(123), {
    error: "error",
    errorInfo: getHumanReadableMessage1(),
    getHumanReadableMessage: getHumanReadableMessage1,
  });
});

test("Test omit works", (t) => {
  t.plan(2);
  const original = { one: 1, two: 2 };
  t.deepEqual(
    spec.omit(original, "one"),
    {
      two: 2,
    },
    "Result must be omitted object",
  );
  t.deepEqual(
    original,
    { one: 1, two: 2 },
    "Original value must not have been modified",
  );
});

test("Test combineErrorObjects works", (t) => {
  t.plan(2);
  const error1 = "one";
  const error2 = 2;
  const getHumanReadableMessage = () => "Dummy";
  const combined = spec.combineErrorObjects([
    {
      error: "error",
      errorInfo: error1,
      getHumanReadableMessage,
    },
    {
      error: "error",
      errorInfo: error2,
      getHumanReadableMessage,
    },
  ]);

  t.deepEqual(spec.omit(combined, "getHumanReadableMessage"), {
    error: "error",
    errorInfo: [
      {
        error: "error",
        errorInfo: error1,
        getHumanReadableMessage,
      },
      {
        error: "error",
        errorInfo: error2,
        getHumanReadableMessage,
      },
    ],
  });
  t.deepEqual(
    combined.getHumanReadableMessage(),
    `${getHumanReadableMessage()}\n${getHumanReadableMessage()}`,
  );
});

test("Test exceptionAsValidationError works", (t) => {
  t.plan(2);
  const parameter = "Anything really";
  const error = spec.exceptionAsValidationError(parameter);
  t.deepEqual(spec.omit(error, "getHumanReadableMessage"), {
    error: "error",
    errorInfo: parameter,
  });
  t.deepEqual(error.getHumanReadableMessage(), parameter);
});

test("Test transformEntries works", (t) => {
  t.plan(1);
  t.deepEqual(
    spec.transformEntries(
      {
        test: 1,
      },
      (entry) => entry + 1,
    ),
    { test: 2 },
  );
});

test("Test stripUndefineds works", (t) => {
  t.plan(4);
  t.deepEqual(spec.stripUndefineds({ one: "one", two: undefined }), {
    one: "one",
  });
  t.deepEqual(spec.stripUndefineds({ one: "one", two: null }), {
    one: "one",
    two: null,
  });
  t.deepEqual(spec.stripUndefineds({ one: "one", two: "two" }), {
    one: "one",
    two: "two",
  });
  t.deepEqual(spec.stripUndefineds({}), {});
});

test("Test getJSONParseReviver works", (t) => {
  t.plan(4);
  t.deepEqual(spec.getJSONParseReviver(true), undefined);
  const reviver = spec.getJSONParseReviver(false);
  if (reviver !== undefined) {
    t.deepEqual(typeof reviver, "function");
    t.deepEqual(reviver("some-key", "value"), "value");
    t.deepEqual(reviver("__proto__", "value"), undefined);
  }
});
