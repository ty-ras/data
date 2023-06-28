/**
 * @file This file contains tests for methods.ts file in parent folder.
 */
import test from "ava";
import * as spec from "../methods";
import * as protocol from "@ty-ras/protocol";

test("Validate isMethodWithoutRequestBody works", (t) => {
  t.plan(8);
  for (const [method, result] of Object.entries(methodRequestBodySpec)) {
    t.deepEqual(
      spec.isMethodWithoutRequestBody(method as protocol.HttpMethod),
      result,
      `The return value of isMethodWithoutRequestBody for ${method} must be expected`,
    );
  }
});

const methodRequestBodySpec: Record<protocol.HttpMethod, boolean> = {
  [protocol.METHOD_OPTIONS]: true,
  [protocol.METHOD_GET]: true,
  [protocol.METHOD_POST]: false,
  [protocol.METHOD_PUT]: false,
  [protocol.METHOD_DELETE]: false,
  [protocol.METHOD_HEAD]: true,
  [protocol.METHOD_PATCH]: false,
  [protocol.METHOD_TRACE]: true,
};
