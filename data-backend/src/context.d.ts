import type * as common from "@ty-ras/data";

export type StateValidator<TContext, TState> = common.DataValidator<
  TContext,
  TState,
  | common.DataValidatorResultError
  | {
      error: "protocol-error";
      statusCode: number;
      body: string | undefined;
    }
>;
