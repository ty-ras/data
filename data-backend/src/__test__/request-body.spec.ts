/**
 * @file This file contains unit tests for code in `../request-body.ts`.
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import test from "ava";
import * as spec from "../request-body";
import * as common from "./common";
import * as stream from "stream";
import type * as data from "@ty-ras/data";

test("Validate requestBody works", async (c) => {
  c.plan(7);
  const data = "Value";
  const { validator, validatorSpec } = createRequestBody(data);
  c.deepEqual(validatorSpec, {
    contents: {
      [common.CONTENT_TYPE]: common.VALIDATOR_NATIVE,
    },
  });
  const correctReadable = () => stream.Readable.from([JSON.stringify(data)]);
  c.deepEqual(
    await validator({
      contentType: common.CONTENT_TYPE,
      input: correctReadable(),
    }),
    {
      error: "none",
      data: data,
    },
  );
  c.deepEqual(
    await validator({
      contentType: "incorrect/applicationtype",
      input: correctReadable(),
    }),
    {
      error: "unsupported-content-type",
      supportedContentTypes: [common.CONTENT_TYPE],
    },
  );
  c.like(
    await validator({
      contentType: common.CONTENT_TYPE,
      input: stream.Readable.from([JSON.stringify(123)]),
    }),
    {
      error: "error",
      errorInfo: 123,
    },
  );
  c.like(
    await validator({
      contentType: common.CONTENT_TYPE,
      input: stream.Readable.from([]),
    }),
    {
      error: "error",
      errorInfo: undefined,
    },
  );
  c.like(
    await validator({
      contentType: common.CONTENT_TYPE,
      input: stream.Readable.from(["not-a-json"]),
    }),
    {
      error: "error",
      errorInfo: new SyntaxError("Unexpected token o in JSON at position 1"),
    },
  );
  c.deepEqual(
    await createRequestBody(data, false, "utf16le").validator({
      contentType: common.CONTENT_TYPE,
      input: stream.Readable.from([
        Buffer.from(JSON.stringify(data), "utf16le"),
      ]),
    }),
    {
      error: "none",
      data: data,
    },
  );
});

test("Validate request body optionality works", async (c) => {
  c.plan(4);
  const { validator: forbidRequestBody } = createRequestBody(undefined);
  c.deepEqual(
    await forbidRequestBody({
      contentType: common.CONTENT_TYPE,
      input: stream.Readable.from([]),
    }),
    {
      error: "none",
      data: undefined,
    },
  );
  c.like(
    await forbidRequestBody({
      contentType: common.CONTENT_TYPE,
      input: stream.Readable.from([JSON.stringify("123")]),
    }),
    {
      error: "error",
    },
  );
  const { validator: optionalRequestBody } = createRequestBodyWithValidator(
    (data) =>
      data === undefined || typeof data === "string"
        ? { error: "none", data }
        : {
            error: "error",
            errorInfo: data,
            getHumanReadableMessage: common.getHumanReadableMessage,
          },
  );
  c.deepEqual(
    await optionalRequestBody({
      contentType: common.CONTENT_TYPE,
      input: stream.Readable.from([]),
    }),
    {
      error: "none",
      data: undefined,
    },
  );
  c.deepEqual(
    await optionalRequestBody({
      contentType: common.CONTENT_TYPE,
      input: stream.Readable.from([JSON.stringify("123")]),
    }),
    {
      error: "none",
      data: "123",
    },
  );
});

test("Validate request body detects invalid JSON", async (c) => {
  c.plan(1);
  const { validator } = createRequestBody("123");
  const result = await validator({
    contentType: common.CONTENT_TYPE,
    input: stream.Readable.from(["not-a-json"]),
  });
  c.like(result, {
    error: "error",
    errorInfo: new SyntaxError("Unexpected token o in JSON at position 1"),
  });
});

const createRequestBody = <T>(
  value: T,
  strictContentType = false,
  overrideEncoding?: string,
) =>
  createRequestBodyWithValidator(
    common.validatorForValue(value),
    strictContentType,
    overrideEncoding,
  );

const createRequestBodyWithValidator = <T>(
  validator: data.DataValidator<unknown, T>,
  strictContentType = false,
  overrideEncoding?: string,
) =>
  spec.requestBodyGeneric(
    common.VALIDATOR_NATIVE,
    validator,
    common.CONTENT_TYPE,
    strictContentType,
    async (readable, encoding) => {
      const blocks: Array<string> = [];
      for await (const block of readable) {
        blocks.push(
          block instanceof Buffer
            ? block.toString((overrideEncoding ?? encoding) as BufferEncoding)
            : `${block}`,
        );
      }
      return blocks.join("");
    },
  );
