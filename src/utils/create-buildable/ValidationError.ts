export type ValidationErrorCode =
  | 'missing_field'
  | 'invalid_type'
  | 'invalid_array'
  | 'invalid_buildable'
  | 'invalid_union'


export class ValidationError extends Error {
  constructor(
    public readonly code: ValidationErrorCode,
    type: string,
    key: string,
    message: string
  ) {
    super(`createBuildable [${type}]: field "${key}" ${message}`)
    this.name = 'ValidationError'
  }
}
