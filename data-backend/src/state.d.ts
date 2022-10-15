import type * as common from "@ty-ras/data";

export type StateValidator<TState> = common.DataValidator<
  unknown,
  TState,
  | common.DataValidatorResultError
  | {
      error: "protocol-error";
      statusCode: number;
      body: string | undefined;
    }
>;

export type StateValidatorResult<TState> = ReturnType<StateValidator<TState>>;
