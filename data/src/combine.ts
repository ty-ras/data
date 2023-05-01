/**
 * @file This file contains utility class to combine multiple validators.
 * Notice!!! The utility class will at some point be deleted.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import * as validation from "./validation";

/**
 * This is helper class to combine multiple {@link validation.DataValidator}s into one.
 * It is frankly quite awkward and not very user-friendly, and will be gone once issue #21 will be worked on.
 */
export class ValidationCombiner<
  TRequiredValidators extends Record<
    string,
    validation.DataValidator<any, unknown>
  >,
  TOptionalValidators extends Record<
    string,
    validation.DataValidator<any, unknown> | undefined
  >,
> {
  public constructor(
    private readonly _state: TRequiredValidators & TOptionalValidators,
  ) {}

  public withValidator<
    TName extends string,
    TDataValidator extends validation.DataValidator<any, unknown>,
  >(
    name: TName &
      (TName extends keyof (TRequiredValidators | TOptionalValidators)
        ? never
        : {}),
    validator: TDataValidator,
  ): TDataValidator extends validation.DataValidator<any, unknown, unknown>
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
    TDataValidator extends validation.DataValidator<any, unknown>,
  >(
    name: TName &
      (TName extends keyof (TRequiredValidators | TOptionalValidators)
        ? never
        : {}),
    validator: TDataValidator | undefined,
  ): TDataValidator extends validation.DataValidator<any, unknown, unknown>
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
    TDataValidator extends validation.DataValidator<any, unknown>,
  >(
    name: TName & (TName extends keyof TRequiredValidators ? never : {}),
    validator: TDataValidator | undefined,
  ): TDataValidator extends validation.DataValidator<any, unknown, unknown>
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
      : this) as unknown as TDataValidator extends validation.DataValidator<
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
    | validation.DataValidatorResultSuccess<
        GetValidationChainOutputs<TRequiredValidators & TOptionalValidators>
      >
    | {
        error: validation.DataValidatorResultErrorKind;
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
      this._state as Record<string, validation.DataValidator<unknown, unknown>>,
    )) {
      if (name in inputs) {
        const validationResult = validator(inputs[name]);
        if (isSuccessResult(validationResult)) {
          outputs[name as keyof typeof outputs] =
            validationResult.data as (typeof outputs)[keyof typeof outputs];
        } else {
          errors[name as keyof typeof errors] = {
            error: "validator-error",
            errorInfo: validationResult,
          } as (typeof errors)[keyof typeof errors];
        }
      } else {
        errors[name as keyof typeof errors] = {
          error: "missing-validator",
        } as (typeof errors)[keyof typeof errors];
      }
    }

    return Object.keys(errors).length > 0
      ? {
          error: validation.DATA_VALIDATION_RESULT_KIND_ERROR,
          errorInfo: errors,
        }
      : {
          error: validation.DATA_VALIDATION_RESULT_KIND_SUCCESS,
          data: outputs,
        };
  }
}

export const newCombiner = (): ValidationCombiner<{}, {}> =>
  new ValidationCombiner({});

const isSuccessResult = (
  val: unknown,
): val is validation.DataValidatorResultSuccess<unknown> =>
  !!val &&
  typeof val === "object" &&
  "error" in val &&
  "data" in val &&
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (val as any).error === "none";

export type GetValidationChainInputs<TValidators> = {
  [P in keyof TValidators]: TValidators[P] extends validation.DataValidator<
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
  [P in keyof TValidators]: TValidators[P] extends validation.DataValidator<
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
      errorInfo: validation.DataValidatorResultError;
    };
