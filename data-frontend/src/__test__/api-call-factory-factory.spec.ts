/**
 * @file This file contains unit tests for code in `../api-call-factory-factory.ts`.
 */
/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
import test, { ExecutionContext } from "ava";
import type * as data from "@ty-ras/data";
import { isDeepStrictEqual } from "util";
import * as spec from "../api-call-factory-factory";
import type * as factory from "../api-call-factory.types";
import type * as apiCall from "../api-call.types";
import * as protocol from "@ty-ras/protocol";

test("API Call Factory Factory works", async (t) => {
  t.plan(10);
  await performOneTest(
    t,
    {},
    { method: "GET", url: "dummy" },
    { body: { protocol: "APIEndpoint" } },
    ({ apiCallFactory, expectedArg: { url } }) =>
      apiCallFactory.makeAPICall<APIEndpoint>({
        url,
        method: "GET",
        response: validatorForValue({ protocol: "APIEndpoint" }),
      })(),
  );
  await performOneTest(
    t,
    { auth: () => "token" },
    { method: "GET", url: "dummy", headers: { Authorization: "token" } },
    { body: { protocol: "APIEndpointWithHeaderFunctionality" } },
    ({ apiCallFactory, expectedArg: { url } }) =>
      apiCallFactory.makeAPICall<APIEndpointWithHeaderFunctionality>({
        url,
        method: "GET",
        response: validatorForValue({
          protocol: "APIEndpointWithHeaderFunctionality",
        }),
        headersFunctionality: {
          Authorization: "auth",
        },
      })(),
  );
  await performOneTest(
    t,
    {},
    {
      method: "GET",
      url: "dummy",
      headers: { "X-Custom-Header": "HeaderValue" },
    },
    { body: { protocol: "APIEndpointWithHeaderData" } },
    ({ apiCallFactory, expectedArg: { url } }) =>
      apiCallFactory.makeAPICall<APIEndpointWithHeaderData>({
        url,
        method: "GET",
        response: validatorForValue({
          protocol: "APIEndpointWithHeaderData",
        }),
        headers: validatorForValue({
          "X-Custom-Header": "HeaderValue",
        }),
      })({
        headers: {
          "X-Custom-Header": "HeaderValue",
        },
      }),
  );
  await performOneTest(
    t,
    {},
    { method: "GET", url: "dummy" },
    {
      body: { protocol: "APIEndpointWithResponseHeaders" },
      headers: { "X-Custom-Response-Header": "ResponseHeaderValue" },
    },
    ({ apiCallFactory, expectedArg: { url } }) =>
      apiCallFactory.makeAPICall<APIEndpointWithResponseHeaders>({
        url,
        method: "GET",
        response: validatorForValue({
          protocol: "APIEndpointWithResponseHeaders",
        }),
        responseHeaders: validatorForValue({
          "X-Custom-Response-Header": "ResponseHeaderValue",
        }),
      })(),
  );

  await performOneTestOrError(
    t,
    {},
    { method: "GET", url: "dummy" },
    {
      body: { protocol: "APIEndpointWithResponseHeaders" },
      headers: {
        "X-Custom-Response-Header": "ResponseHeaderValue_typoed" as any,
      },
    },
    ({ apiCallFactory, expectedArg: { url } }) =>
      apiCallFactory.makeAPICall<APIEndpointWithResponseHeaders>({
        url,
        method: "GET",
        response: validatorForValue({
          protocol: "APIEndpointWithResponseHeaders",
        }),
        responseHeaders: validatorForValue({
          "X-Custom-Response-Header": "ResponseHeaderValue",
        }),
      })(),
    {
      error: "error",
      errorInfo: {
        "X-Custom-Response-Header": "ResponseHeaderValue_typoed",
      },
      getHumanReadableMessage,
    },
  );
});

test("API Call Factory Factory detects erroneous parameters", async (t) => {
  t.plan(2);
  const httpCall: spec.CallHTTPEndpoint = () => {
    throw new Error("This should not be called");
  };
  const url = "dummy";
  t.throws(
    () =>
      spec
        .createAPICallFactoryGeneric(httpCall)
        .withHeaders({ auth: () => "dummyHeaderValue" })
        .makeAPICall<APIEndpointWithHeaderFunctionality>({
          url,
          method: "GET",
          response: validatorForValue({
            protocol: "APIEndpointWithHeaderFunctionality",
          }),
          headersFunctionality: {
            Authorization: "auth_typoed" as any,
          },
        }),
    {
      message: `The endpoint requires the following header functionality, missing from given header functionality: auth_typoed.`,
    },
  );

  t.deepEqual(
    await spec
      .createAPICallFactoryGeneric(httpCall)
      .withHeaders({})
      .makeAPICall<APIEndpointWithHeaderData>({
        url,
        method: "GET",
        response: validatorForValue({ protocol: "APIEndpointWithHeaderData" }),
        headers: validatorForValue({
          "X-Custom-Header": "HeaderValue",
        }),
      })({
      headers: {
        // Intentional to make validation fail
        "X-Custom-Header": 123 as any,
      },
    }),
    {
      error: "error-input",
      errorInfo: {
        headers: {
          error: "validator-error",
          errorInfo: {
            error: "error",
            errorInfo: {
              "X-Custom-Header": 123,
            },
            getHumanReadableMessage,
          },
        },
      },
    },
  );
});

interface APIEndpointCore {
  method: "GET";
}

type APIEndpoint = APIEndpointCore & {
  responseBody: { protocol: "APIEndpoint" };
};

type APIEndpointWithHeaderFunctionality = APIEndpointCore & {
  responseBody: { protocol: "APIEndpointWithHeaderFunctionality" };
  headers: {
    Authorization: "auth";
  };
};

type APIEndpointWithHeaderData = APIEndpointCore & {
  responseBody: { protocol: "APIEndpointWithHeaderData" };
  headerData: {
    "X-Custom-Header": "HeaderValue";
  };
};

type APIEndpointWithResponseHeaders = APIEndpointCore & {
  responseBody: { protocol: "APIEndpointWithResponseHeaders" };
  responseHeaders: {
    "X-Custom-Response-Header": "ResponseHeaderValue";
  };
};

const getHumanReadableMessage = () => "";

const validatorForValue =
  <T>(value: T): data.DataValidator<unknown, T> =>
  (data) =>
    isDeepStrictEqual(data, value)
      ? { error: "none", data: data as any }
      : { error: "error", errorInfo: data, getHumanReadableMessage };

const performOneTest = async <
  THeaders extends Record<string, spec.HeaderProvider>,
  TExpectedArg extends spec.HTTPInvocationArguments,
>(
  t: ExecutionContext,
  headers: THeaders,
  expectedArg: TExpectedArg,
  response: spec.HTTPInvocationResult,
  getAPICall: (args: {
    apiCallFactory: factory.APICallFactoryBase<
      protocol.HKTEncodedBase,
      keyof THeaders & string
    >;
    expectedArg: TExpectedArg;
    response: spec.HTTPInvocationResult;
  }) => Promise<apiCall.APICallResult<unknown>>,
) =>
  performOneTestOrError(t, headers, expectedArg, response, getAPICall, {
    error: "none",
    data: "headers" in response ? response : response.body,
  });

const performOneTestOrError = async <
  THeaders extends Record<string, spec.HeaderProvider>,
  TExpectedArg extends spec.HTTPInvocationArguments,
>(
  t: ExecutionContext,
  headers: THeaders,
  expectedArg: TExpectedArg,
  response: spec.HTTPInvocationResult,
  getAPICall: (args: {
    apiCallFactory: factory.APICallFactoryBase<
      protocol.HKTEncodedBase,
      keyof THeaders & string
    >;
    expectedArg: TExpectedArg;
    response: spec.HTTPInvocationResult;
  }) => Promise<apiCall.APICallResult<unknown>>,
  expectedAPICallResponse: apiCall.APICallResult<unknown>,
) => {
  const calledArgs: Array<spec.HTTPInvocationArguments> = [];
  const expectedResponses: Array<spec.HTTPInvocationResult> = [response];
  let currentIndex = 0;
  const apiCallFactory = spec
    .createAPICallFactoryGeneric((httpArgs) => {
      calledArgs.push(httpArgs);
      return Promise.resolve(expectedResponses[currentIndex++]);
    })
    .withHeaders(headers);

  t.deepEqual(
    await getAPICall({ apiCallFactory, expectedArg, response }),
    expectedAPICallResponse,
  );
  t.deepEqual(calledArgs, [expectedArg]);
};
