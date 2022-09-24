import test from "ava";
import * as spec from "../utils";

test("Test default parameter regexp", (t) => {
  t.deepEqual(spec.defaultParameterRegExp(), /[^/]+/);
});
