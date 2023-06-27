/**
 * @file This file contains tests for methods.ts file in parent folder.
 */

import test from "ava";
import * as spec from "../methods";

test("Test method constant values", (c) => {
  c.plan(8);

  c.deepEqual(spec.METHOD_GET, "GET");
  c.deepEqual(spec.METHOD_DELETE, "DELETE");
  c.deepEqual(spec.METHOD_HEAD, "HEAD");
  c.deepEqual(spec.METHOD_OPTIONS, "OPTIONS");
  c.deepEqual(spec.METHOD_PATCH, "PATCH");
  c.deepEqual(spec.METHOD_POST, "POST");
  c.deepEqual(spec.METHOD_PUT, "PUT");
  c.deepEqual(spec.METHOD_TRACE, "TRACE");
});
