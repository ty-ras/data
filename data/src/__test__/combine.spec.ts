import test from "ava";
import * as spec from "../combine";
import type * as common from "../common";

test("ValidationCombiner required part works", (t) => {
  t.plan(2);
  const combined = spec
    .newCombiner()
    .withValidator("mandatory", stringValidator);

  const input = {
    mandatory: "string",
  };
  t.deepEqual(combined.getOutputs(input), {
    error: "none",
    data: input,
  });
  t.deepEqual(combined.getOutputs({ mandatory: 123 }), {
    error: "error",
    errorInfo: {
      mandatory: {
        error: "validator-error",
        errorInfo: {
          error: "error",
          errorInfo: null,
          getHumanReadableMessage,
        },
      },
    },
  });
});

test("ValidationCombiner optional part works", (t) => {
  t.plan(2);
  const flag = false;
  const combined = spec
    .newCombiner()
    .withValidator("mandatory", stringValidator)
    .withValidator("optional", flag ? stringValidator : undefined);

  const input = {
    mandatory: "string",
  };
  t.deepEqual(combined.getOutputs(input), {
    error: "none",
    data: input,
  });
  t.deepEqual(
    combined.getOutputs({ ...input, optional: "string" }),
    {
      error: "none",
      data: input,
    },
    "The 'optional' value should not leak to the result",
  );
});

test("ValidationCombiner detects missing property", (t) => {
  const combined = spec
    .newCombiner()
    .withValidator("mandatory", stringValidator);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  t.deepEqual(combined.getOutputs({ optional: "string" } as any), {
    error: "error",
    errorInfo: {
      mandatory: {
        error: "missing-validator",
      },
    },
  });
});

const getHumanReadableMessage = () => "";

const stringValidator: common.DataValidator<unknown, string> = (data) =>
  typeof data === "string"
    ? { error: "none", data }
    : {
        error: "error",
        errorInfo: null,
        getHumanReadableMessage,
      };
