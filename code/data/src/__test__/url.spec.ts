/**
 * @file This file contains unit tests for code in `../url.ts`.
 */

import test from "ava";
import * as spec from "../url";

test("Test default parameter regexp", (t) => {
  t.deepEqual(spec.defaultParameterRegExp(), /[^/]+/);
});
