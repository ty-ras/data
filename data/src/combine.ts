/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import type * as common from "./common";

// TODO This will probably be removed when #21 is being worked on.
export class ValidationCombiner<
  TRequiredValidators extends Record<
    string,
    common.DataValidator<any, unknown>
  >,
  TOptionalValidators extends Record<
    string,
    common.DataValidator<any, unknown> | undefined
  >,
> {
  public constructor(
    private readonly _state: TRequiredValidators & TOptionalValidators,
  ) {}

  public withValidator<
    TName extends string,
    TDataValidator extends common.DataValidator<any, unknown>,
  >(
    name: TName &
      (TName extends keyof (TRequiredValidators | TOptionalValidators)
        ? never
        : {}),
    validator: TDataValidator,
  ): TDataValidator extends common.DataValidator<any, unknown, unknown>
    ? ValidationCombiner<
        {
          [P in
            | keyof TRequiredValidators
            | TName]: P extends keyof TRequiredValidators
            ? TRequiredValidators[P]
            : TDataValidator;
        },
        TOptionalValidators
      >
    : never;
  public withValidator<
    TName extends string,
    TDataValidator extends common.DataValidator<any, unknown>,
  >(
    name: TName &
      (TName extends keyof (TRequiredValidators | TOptionalValidators)
        ? never
        : {}),
    validator: TDataValidator | undefined,
  ): TDataValidator extends common.DataValidator<any, unknown, unknown>
    ? ValidationCombiner<
        TRequiredValidators,
        {
          [P in
            | keyof TOptionalValidators
            | TName]: P extends keyof TOptionalValidators
            ? TOptionalValidators[P]
            : TDataValidator;
        }
      >
    : never;

  public withValidator<
    TName extends string,
    TDataValidator extends common.DataValidator<any, unknown>,
  >(
    name: TName & (TName extends keyof TRequiredValidators ? never : {}),
    validator: TDataValidator | undefined,
  ): TDataValidator extends common.DataValidator<any, unknown, unknown>
    ? ValidationCombiner<
        {
          [P in
            | keyof TRequiredValidators
            | TName]: P extends keyof TRequiredValidators
            ? TRequiredValidators[P]
            : TDataValidator;
        },
        {
          [P in
            | keyof TOptionalValidators
            | TName]: P extends keyof TOptionalValidators
            ? TOptionalValidators[P]
            : TDataValidator;
        }
      >
    : never {
    return (validator
      ? new ValidationCombiner({
          ...this._state,
          [name]: validator,
        })
      : this) as unknown as TDataValidator extends common.DataValidator<
      any,
      unknown,
      unknown
    >
      ? ValidationCombiner<
          {
            [P in
              | keyof TRequiredValidators
              | TName]: P extends keyof TRequiredValidators
              ? TRequiredValidators[P]
              : TDataValidator;
          },
          {
            [P in
              | keyof TOptionalValidators
              | TName]: P extends keyof TOptionalValidators
              ? TOptionalValidators[P]
              : TDataValidator;
          }
        >
      : never;
  }

  public getOutputs(
    inputs: GetValidationChainInputs<TRequiredValidators> &
      Partial<GetValidationChainInputs<TOptionalValidators>>,
  ):
    | common.DataValidatorResultSuccess<
        GetValidationChainOutputs<TRequiredValidators & TOptionalValidators>
      >
    | {
        error: "error";
        errorInfo: Partial<
          Record<
            keyof (TRequiredValidators | TOptionalValidators),
            ValidationChainError
          >
        >;
      } {
    const outputs = {} as GetValidationChainOutputs<
      TRequiredValidators & TOptionalValidators
    >;
    const errors: Partial<
      Record<
        keyof (TRequiredValidators | TOptionalValidators),
        ValidationChainError
      >
    > = {};
    for (const [name, validator] of Object.entries(
      this._state as Record<string, common.DataValidator<unknown, unknown>>,
    )) {
      if (name in inputs) {
        const validationResult = validator(inputs[name]);
        if (isSuccessResult(validationResult)) {
          outputs[name as keyof typeof outputs] =
            validationResult.data as typeof outputs[keyof typeof outputs];
        } else {
          errors[name as keyof typeof errors] = {
            error: "validator-error",
            errorInfo: validationResult,
          } as typeof errors[keyof typeof errors];
        }
      } else {
        errors[name as keyof typeof errors] = {
          error: "missing-validator",
        } as typeof errors[keyof typeof errors];
      }
    }

    return Object.keys(errors).length > 0
      ? {
          error: "error",
          errorInfo: errors,
        }
      : {
          error: "none",
          data: outputs,
        };
  }
}

export const newCombiner = (): ValidationCombiner<{}, {}> =>
  new ValidationCombiner({});

const isSuccessResult = (
  val: unknown,
): val is common.DataValidatorResultSuccess<unknown> =>
  !!val &&
  typeof val === "object" &&
  "error" in val &&
  "data" in val &&
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (val as any).error === "none";

export type GetValidationChainInputs<TValidators> = {
  [P in keyof TValidators]: TValidators[P] extends common.DataValidator<
    infer TInput,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    infer _,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    infer _1
  >
    ? TInput
    : never;
};

export type GetValidationChainOutputs<TValidators> = {
  [P in keyof TValidators]: TValidators[P] extends common.DataValidator<
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    infer _,
    infer TOutput,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    infer _1
  >
    ? TOutput
    : never;
};

export type ValidationChainError =
  | {
      error: "missing-validator";
    }
  | {
      error: "validator-error";
      errorInfo: common.DataValidatorResultError;
    };
