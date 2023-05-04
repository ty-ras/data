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
  /**
   * Creates a new instance of {@link ValidationCombiner}.
   * Should not be used by client libraries directly, use {@link newCombiner} function instead.
   * @param _state the state that this object should have.
   */
  public constructor(
    private readonly _state: TRequiredValidators & TOptionalValidators,
  ) {}

  /**
   * Adds new named validator to a group of validators this object represents.
   * This overload is for validators which are deemed to be required.
   * @param name The name of the validator.
   * @param validator The implementation of the validator.
   */
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

  /**
   * Adds new named validator to a group of validators this object represents.
   * This overload is for validators which are deemed to be optional.
   * @param name The name of the validator.
   * @param validator The implementation of the validator.
   */
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

  /**
   * Adds new named validator to a group of validators this object represents.
   * The validator is deemed to be optional if it is `undefined`.
   * @param name The name of the validator.
   * @param validator The implementation of the validator.
   * @returns new instance of {@link ValidationCombiner} with all the validators that current object has, and also the specified new validator
   */
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

  /**
   * Invokes named validators for named inputs, either succeeding for all of the given inputs, or failing with one or more errors.
   * @param inputs The inputs, each named input for the each named validator that this object contains.
   * @returns The record of {@link validation.DataValidatorResultSuccess}s, or a {@link validation.DataValidatorResultError} if there are errors.
   */
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

/**
 * Helper method to avoid calling {@link ValidationCombiner} directly and thus needing to specify generic arguments explicitly.
 * @returns A new instance of {@link ValidationCombiner}.
 */
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

/**
 * Helper type to extract inputs (`TInput` generic argument) of record of {@link validation.DataValidator}s.
 */
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

/**
 * Helper type to extract outputs (`TOutput` generic argument) of record of {@link validation.DataValidator}s.
 */
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

/**
 * This type describes a single error related to input given to `getOutputs` method of {@link ValidationCombiner}.
 */
export type ValidationChainError =
  | {
      error: "missing-validator";
    }
  | {
      error: "validator-error";
      errorInfo: validation.DataValidatorResultError;
    };
