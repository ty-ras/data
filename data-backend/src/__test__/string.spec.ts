/**
 * @file This file contains unit tests for code in `../string.ts`.
 */

import test from "ava";
import * as spec from "../string";
import * as common from "./common";

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */

test("Validate string validator for decoders works", (c) => {
  c.plan(5);
  const { validators, metadata } = spec.stringDataValidatorDecoderGeneric<
    { parameter: string },
    common.ValidatorHKT
  >(
    {
      parameter: {
        required: true,
        decoder: common.VALIDATOR_NATIVE,
      },
    },
    common.decoderToValidator(),
    "String",
  );
  c.deepEqual(metadata, {
    parameter: {
      required: true,
      decoder: common.VALIDATOR_NATIVE,
    },
  });
  c.deepEqual(Object.keys(validators), ["parameter"]);
  c.deepEqual(validators.parameter(common.VALIDATOR_NATIVE), {
    error: "none",
    data: common.VALIDATOR_NATIVE,
  });
  c.like(validators.parameter(undefined), {
    error: "error",
    errorInfo: 'String "parameter" is mandatory.',
  });
  c.like(validators.parameter(123 as any), {
    error: "error",
    errorInfo: 123,
  });
});

test("Validate string validator for encoders works", (c) => {
  c.plan(5);
  const { validators, metadata } = spec.stringDataValidatorEncoderGeneric<
    { parameter: string },
    common.ValidatorHKT
  >(
    {
      parameter: {
        required: true,
        encoder: common.VALIDATOR_NATIVE,
      },
    },
    common.encoderToValidator(),
    "String",
  );
  c.deepEqual(metadata, {
    parameter: {
      required: true,
      encoder: common.VALIDATOR_NATIVE,
    },
  });
  c.deepEqual(Object.keys(validators), ["parameter"]);
  c.deepEqual(validators.parameter(common.VALIDATOR_NATIVE), {
    error: "none",
    data: common.VALIDATOR_NATIVE,
  });
  c.like(validators.parameter(undefined as any), {
    error: "error",
    errorInfo: 'String "parameter" is mandatory.',
  });
  c.like(validators.parameter(123 as any), {
    error: "error",
    errorInfo: 123,
  });
});

test("Validate string validator for decoders works for optional parameters", (c) => {
  c.plan(5);
  const { validators, metadata } = spec.stringDataValidatorDecoderGeneric<
    { parameter: string | undefined },
    common.ValidatorHKT
  >(
    {
      parameter: {
        required: false,
        decoder: common.VALIDATOR_NATIVE,
      },
    },
    common.decoderToValidator(true),
    "String",
  );
  c.deepEqual(metadata, {
    parameter: {
      required: false,
      decoder: common.VALIDATOR_NATIVE,
    },
  });
  c.deepEqual(Object.keys(validators), ["parameter"]);
  c.deepEqual(validators.parameter(common.VALIDATOR_NATIVE), {
    error: "none",
    data: common.VALIDATOR_NATIVE,
  });
  c.like(validators.parameter(undefined), {
    error: "none",
    data: undefined,
  });
  c.like(validators.parameter(123 as any), {
    error: "error",
    errorInfo: 123,
  });
});

test("Validate string validator for encoders works for optional parameters", (c) => {
  c.plan(5);
  const { validators, metadata } = spec.stringDataValidatorEncoderGeneric<
    { parameter?: string },
    common.ValidatorHKT
  >(
    {
      parameter: {
        required: false,
        encoder: common.VALIDATOR_NATIVE,
      },
    },
    common.encoderToValidator(true),
    "String",
  );
  c.deepEqual(metadata, {
    parameter: {
      required: false,
      encoder: common.VALIDATOR_NATIVE,
    },
  });
  c.deepEqual(Object.keys(validators), ["parameter"]);
  c.deepEqual(validators.parameter(common.VALIDATOR_NATIVE), {
    error: "none",
    data: common.VALIDATOR_NATIVE,
  });
  c.like(validators.parameter(undefined as any), {
    error: "none",
    data: undefined,
  });
  c.like(validators.parameter(123 as any), {
    error: "error",
    errorInfo: 123,
  });
});

// test("Validate responseHeaders works", (c) => {
//   c.plan(5);
//   const headerParamValue = t.string;
//   const { validators, metadata } = spec.responseHeaders({
//     headerParam: headerParamValue,
//   });
//   c.deepEqual(metadata, {
//     headerParam: {
//       required: true,
//       encoder: headerParamValue,
//     },
//   });
//   c.deepEqual(Object.keys(validators), ["headerParam"]);
//   c.deepEqual(validators.headerParam("123"), { error: "none", data: "123" });
//   c.like(validators.headerParam(undefined as any), {
//     error: "error",
//     errorInfo: 'Header "headerParam" is mandatory.',
//   });
//   c.like(validators.headerParam(123 as any), {
//     error: "error",
//     errorInfo: [
//       {
//         context: [
//           {
//             key: "",
//             actual: 123,
//             type: headerParamValue,
//           },
//         ],
//         message: "Given value for input was not what the validator needed.",
//         value: 123,
//       },
//     ],
//   });
// });

// test("Validate string decoding optionality detection", (c) => {
//   c.plan(3);
//   const headerType = t.string;
//   const optionalHeaderType = t.union([headerType, t.undefined]);
//   const { validators, metadata } = spec.requestHeaders({
//     requiredHeader: headerType,
//     optionalHeader: optionalHeaderType,
//   });
//   c.deepEqual(metadata, {
//     requiredHeader: {
//       decoder: headerType,
//       required: true,
//     },
//     optionalHeader: {
//       decoder: optionalHeaderType,
//       required: false,
//     },
//   });
//   c.deepEqual(validators.optionalHeader(undefined), {
//     error: "none",
//     data: undefined,
//   });
//   c.like(validators.requiredHeader(undefined), {
//     error: "error",
//   });
// });

// test("Validate string encoding optionality detection", (c) => {
//   c.plan(3);
//   const headerType = t.string;
//   const optionalHeaderType = t.union([headerType, t.undefined]);
//   const { validators, metadata } = spec.responseHeaders({
//     requiredHeader: headerType,
//     optionalHeader: optionalHeaderType,
//   });
//   c.deepEqual(metadata, {
//     requiredHeader: {
//       encoder: headerType,
//       required: true,
//     },
//     optionalHeader: {
//       encoder: optionalHeaderType,
//       required: false,
//     },
//   });
//   c.deepEqual(validators.optionalHeader(undefined), {
//     error: "none",
//     data: undefined,
//   });
//   c.like(validators.requiredHeader(undefined as any), {
//     error: "error",
//   });
// });
