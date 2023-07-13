/**
 * @file This file contains unit tests for code in `../url.ts`.
 */

import test from "ava";
import * as spec from "../url";
import * as common from "./common";
import type * as protocol from "@ty-ras/protocol";
import * as data from "@ty-ras/data";

test("Validate that url validator gives static string when no args", (c) => {
  c.plan(1);
  const url = newUrl`/static/string`;
  c.deepEqual(url, "/static/string");
});

test("Validate that url validator gives function callback with args", (c) => {
  c.plan(1);
  const url = newUrl`/prefix/${urlParam("param", "hello")}/suffix`;
  c.deepEqual(url({ param: "hello" }), {
    error: "none",
    data: "/prefix/hello/suffix",
  });
});

test("Validate that url validator gives function callback with args without suffix", (c) => {
  c.plan(1);
  const url = newUrl`/prefix/${urlParam("param", "hello")}`;
  c.deepEqual(url({ param: "hello" }), {
    error: "none",
    data: "/prefix/hello",
  });
});

test("Validate that url validator gives function callback with args without prefix", (c) => {
  c.plan(1);
  const url = newUrl`${urlParam("param", "hello")}/suffix`;
  c.deepEqual(url({ param: "hello" }), { error: "none", data: "hello/suffix" });
});

test("Validate that url validator gives function callback with args without prefix and suffix", (c) => {
  c.plan(1);
  const url = newUrl`${urlParam("param", "hello")}`;
  c.deepEqual(url({ param: "hello" }), { error: "none", data: "hello" });
});

test("Validate that calling url validator creator with wrong parameters fails", (c) => {
  c.plan(1);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  c.throws(() => newUrl([] as any), {
    instanceOf: Error,
    message:
      "Please call this function as string template literal: <function-name><template string expression with back-ticks>, not using the traditional parenthesis call-style.",
  });
});

function newUrl(fragments: TemplateStringsArray): string;
function newUrl<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TArgs extends Array<spec.URLParameterInfo<string, any, common.ValidatorHKT>>,
>(
  fragments: TemplateStringsArray,
  ...args: TArgs
): data.DataValidator<
  protocol.RuntimeOf<spec.URLParameterReducer<TArgs>>,
  string
>;
function newUrl<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TArgs extends Array<spec.URLParameterInfo<string, any, common.ValidatorHKT>>,
>(
  fragments: TemplateStringsArray,
  ...args: TArgs
):
  | string
  | data.DataValidator<
      protocol.RuntimeOf<spec.URLParameterReducer<TArgs>>,
      string
    > {
  return spec.urlGeneric<common.ValidatorHKT, TArgs>(
    fragments,
    args,
    (encoders) => encoders,
    common.encoderToValidator(false),
  );
}

const urlParam = <TName extends string, TRuntime>(
  name: TName,
  encoder: data.MaterializeEncoder<common.ValidatorHKT, TRuntime, string>,
  regExp?: RegExp,
): spec.URLParameterInfo<TName, TRuntime, common.ValidatorHKT> =>
  spec.urlParamGeneric(name, encoder, regExp);
