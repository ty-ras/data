/**
 * @file This file contains unit tests for code in `../url.ts`.
 */

import test from "ava";
import * as spec from "../url";
import * as common from "./common";

test("Test that URL parameter works", (c) => {
  c.plan(4);
  const regExpInput = /test/;
  const { decoder, name, regExp, validator } = spec.urlParameterGeneric<
    "urlParam",
    string,
    common.ValidatorHKT
  >(
    "urlParam",
    common.VALIDATOR_NATIVE,
    regExpInput,
    common.decoderToValidator(),
  );
  c.deepEqual(decoder, common.VALIDATOR_NATIVE);
  c.deepEqual(name, "urlParam");
  c.deepEqual(regExp, regExpInput);
  c.deepEqual(
    validator(common.VALIDATOR_NATIVE),
    common.validatorForValue(common.VALIDATOR_NATIVE)(common.VALIDATOR_NATIVE),
  );
});

test("Test that URL parameter works without regexp", (c) => {
  c.plan(4);
  const { decoder, name, regExp, validator } = spec.urlParameterGeneric<
    "urlParam",
    string,
    common.ValidatorHKT
  >(
    "urlParam",
    common.VALIDATOR_NATIVE,
    undefined,
    common.decoderToValidator(),
  );
  c.deepEqual(decoder, common.VALIDATOR_NATIVE);
  c.deepEqual(name, "urlParam");
  c.deepEqual(regExp, spec.defaultParameterRegExp());
  c.deepEqual(
    validator(common.VALIDATOR_NATIVE),
    common.validatorForValue(common.VALIDATOR_NATIVE)(common.VALIDATOR_NATIVE),
  );
});

test("Test default parameter regexp", (c) => {
  c.plan(1);
  c.deepEqual(spec.defaultParameterRegExp(), /[^/]+/);
});
