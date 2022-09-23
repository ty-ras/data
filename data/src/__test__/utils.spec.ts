import test from "ava";
import * as spec from "../utils";

test("Test omit works", (t) => {
  t.deepEqual(spec.omit({ one: 1, two: 2 }, "one"), {
    two: 2,
  });
});
