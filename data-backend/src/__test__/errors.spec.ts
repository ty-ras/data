import test, { ExecutionContext } from "ava";
import * as spec from "../errors";

const testHTTPErrorConstructorNonThrowing = (
  c: ExecutionContext,
  ctorArgs: ConstructorParameters<typeof spec.HTTPError>,
  expectedProperties: { message: string; statusCode: number; body?: string },
) => {
  c.plan(3);
  const error = new spec.HTTPError(...ctorArgs);
  c.deepEqual(error.statusCode, expectedProperties.statusCode);
  c.deepEqual(error.body, expectedProperties.body);
  c.deepEqual(error.message, expectedProperties.message);
};

test(
  "Validate that HTTPError constructor works without body or message",
  testHTTPErrorConstructorNonThrowing,
  [400],
  {
    statusCode: 400,
    message: "HTTP error: status code 400, no body.",
  },
);

test(
  "Validate that HTTPError constructor works with body, but without message",
  testHTTPErrorConstructorNonThrowing,
  [400, "body"],
  {
    statusCode: 400,
    body: "body",
    message: 'HTTP error: status code 400, body "body".',
  },
);

test(
  "Validate that HTTPError constructor works with body and with message",
  testHTTPErrorConstructorNonThrowing,
  [400, "body", "message"],
  {
    statusCode: 400,
    body: "body",
    message: "HTTP error: message.",
  },
);

test("Validate that HTTPError constructor throws on invalid status code", (c) => {
  c.plan(2);
  c.throws(() => new spec.HTTPError(299), { instanceOf: Error });
  c.throws(() => new spec.HTTPError(600), { instanceOf: Error });
});
