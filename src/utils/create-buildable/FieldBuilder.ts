import {ValidationError} from "./ValidationError.js";
import type {When} from "../condition-when/when.js";

type BaseType = 'string'
  | 'enum'
  | 'any'
  | 'number'
  | 'boolean'
  | 'buildable'
  | 'union'
  | 'scope'
  | 'object'
  | 'record'

export interface FieldDescriptor {
  baseType: BaseType
  optional: boolean
  defaultValue: unknown
  nullable: boolean
  many: boolean
  union: FieldDescriptor[] | null
  containsBuildable: boolean,
  objectSchema: Record<string, FieldDescriptor> | null
  enumValues: string[] | null
  recordValueType: FieldDescriptor | null
}

export type Whenable<T> = T | When<T>

export class FieldBuilder<T, TOptional extends boolean = false> {
  readonly #baseType: BaseType
  #optional: boolean = false
  #defaultValue: unknown = undefined
  #nullable: boolean = false
  #many: boolean = false
  readonly #objectSchema: Record<string, FieldBuilder<unknown>> | null = null
  readonly #union: FieldBuilder<unknown, boolean>[] | null = null

  #enumValues: string[] | null = null
  #recordValueType: FieldBuilder<unknown> | null = null

  constructor(
    baseType: BaseType,
    union: FieldBuilder<unknown, boolean>[] | null = null,
    objectSchema: Record<string, FieldBuilder<unknown>> | null = null,
    enumValues: string[] | null = null,
    recordValueType: FieldBuilder<unknown> | null = null
  ) {
    this.#baseType = baseType

    if (baseType === 'union' && (!Array.isArray(union) || union.length === 0)) {
      throw new ValidationError('invalid_union', 'schema', 'union', 'must have at least one type')
    }
    this.#objectSchema = objectSchema
    this.#union = union
    this.#recordValueType = recordValueType
    this.#enumValues = enumValues
  }

  optional(defaultValue?: T): FieldBuilder<T | undefined, true> {
    const f = this.#clone<T | undefined, true>()
    f.#optional = true
    f.#defaultValue = defaultValue
    return f
  }


  nullable(): FieldBuilder<T | null, TOptional> {
    const f = this.#clone<T | null, TOptional>()
    f.#nullable = true
    return f
  }

  many(): FieldBuilder<Whenable<T>[], TOptional> {
    const f = this.#clone<Whenable<T>[], TOptional>()
    f.#many = true
    return f
  }

  #clone<U, UOptional extends boolean = TOptional>(): FieldBuilder<U, UOptional> {
    const f = new FieldBuilder<U, UOptional>(this.#baseType, this.#union, this.#objectSchema, this.#enumValues, this.#recordValueType)
    f.#optional = this.#optional
    f.#defaultValue = this.#defaultValue
    f.#nullable = this.#nullable
    f.#many = this.#many
    return f
  }

  toDescriptor(): FieldDescriptor {

    const union = this.#union?.map(f => f.toDescriptor()) ?? null
    const objectSchema = this.#objectSchema
      ? Object.fromEntries(
        Object.entries(this.#objectSchema).map(([k, v]) => [k, v.toDescriptor()])
      ) : null

    const containsBuildable =
      this.#baseType === 'buildable'
      || this.#baseType === 'scope'
      || (this.#baseType === 'union' && union!.some(d => d.containsBuildable))
      || (this.#baseType === 'object' && Object.values(objectSchema!).some(d => d.containsBuildable))
      || (this.#baseType === 'record' && !!this.#recordValueType?.toDescriptor().containsBuildable)

    return {
      baseType: this.#baseType,
      optional: this.#optional,
      defaultValue: this.#defaultValue,
      nullable: this.#nullable,
      many: this.#many,
      union,
      enumValues: this.#enumValues,
      recordValueType: this.#recordValueType?.toDescriptor() ?? null,
      containsBuildable,
      objectSchema,
    }
  }
}
