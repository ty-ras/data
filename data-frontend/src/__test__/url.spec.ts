/**
 * @file This file contains unit tests for code in `../url.ts`.
 */

import test from "ava";
import * as spec from "../url";

test("Validate that url validator gives static string when no args", (c) => {
  c.plan(1);
  const url = spec.url`/static/string`;
  c.deepEqual(url, "/static/string");
});

test("Validate that url validator gives function callback with args", (c) => {
  c.plan(1);
  const url = spec.url`/prefix/${spec.urlParam("param", t.string)}/suffix`;
  c.deepEqual(url({ param: "hello" }), {
    error: "none",
    data: "/prefix/hello/suffix",
  });
});

test("Validate that url validator gives function callback with args without suffix", (c) => {
  c.plan(1);
  const url = spec.url`/prefix/${spec.urlParam("param", t.string)}`;
  c.deepEqual(url({ param: "hello" }), {
    error: "none",
    data: "/prefix/hello",
  });
});

test("Validate that url validator gives function callback with args without prefix", (c) => {
  c.plan(1);
  const url = spec.url`${spec.urlParam("param", t.string)}/suffix`;
  c.deepEqual(url({ param: "hello" }), { error: "none", data: "hello/suffix" });
});

test("Validate that url validator gives function callback with args without prefix and suffix", (c) => {
  c.plan(1);
  const url = spec.url`${spec.urlParam("param", t.string)}`;
  c.deepEqual(url({ param: "hello" }), { error: "none", data: "hello" });
});
