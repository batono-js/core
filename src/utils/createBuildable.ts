import {__BATONO_INTERNAL_BUILD_SYMBOL} from "../internal/index.js";
import {buildDefinition} from "../BuildDefinition.js";

import type {IBuildable, IInteractionGraph} from "../types/types.js";
import {INTERNAL_BUILDER_PARAM_OPTIONAL} from "../internal/internalKeys.js";
import type {Defined} from "../types/results.js";

type SchemaType = typeof String | typeof Number | typeof Boolean

interface OptionalField<T> {
  [INTERNAL_BUILDER_PARAM_OPTIONAL]: true
  defaultValue: T | undefined
}

type SchemaValue = SchemaType | OptionalField<unknown>

type InferSchemaValue<T extends SchemaValue> =
  T extends OptionalField<infer D>
    ? D extends string ? string | undefined
      : D extends number ? number | undefined
        : D extends boolean ? boolean | undefined
          : unknown
    : T extends typeof String ? string
      : T extends typeof Number ? number
        : T extends typeof Boolean ? boolean
          : unknown

type InferRequired<S extends Record<string, SchemaValue>> = {
  [K in keyof S as S[K] extends OptionalField<any> ? never : K]: InferSchemaValue<S[K]>
}

type InferOptional<S extends Record<string, SchemaValue>> = {
  [K in keyof S as S[K] extends OptionalField<any> ? K : never]?: InferSchemaValue<S[K]>
}

type InferSchema<S extends Record<string, SchemaValue>> = InferRequired<S> & InferOptional<S>

type WithMethods<TData, TMethods extends Record<string, (arg: unknown) => Partial<TData>>> = {
  [K in keyof TMethods as `with${Capitalize<string & K>}`]: (
    arg: Parameters<TMethods[K]>[0]
  ) => BuildableInstance<TData, TMethods>
}

type BuildableInstance<TData, TMethods extends Record<string, (arg: unknown) => Partial<TData>>> =
  IBuildable & WithMethods<TData, TMethods>

type BuildableConstructor<TData, TMethods extends Record<string, (arg: unknown) => Partial<TData>>> =
  (args: TData) => BuildableInstance<TData, TMethods>

export function optional<T>(defaultValue?: T): OptionalField<T> {
  return {[INTERNAL_BUILDER_PARAM_OPTIONAL]: true, defaultValue}
}

export function createBuildable<
  TSchema extends Record<string, SchemaValue>,
  TMethods extends Record<string, (arg: any) => Partial<InferSchema<TSchema>>>
>(
  type: string,
  schema: TSchema,
  methods: TMethods = {} as TMethods
): BuildableConstructor<InferSchema<TSchema>, TMethods> {

  const schemaKeys = Object.keys(schema)

  const validate = (data: Record<string, unknown>) => {
    for (const key of schemaKeys) {
      const expectedType = schema[key]
      const isOptional = (expectedType as OptionalField<unknown>)?.[INTERNAL_BUILDER_PARAM_OPTIONAL]

      if (!(key in data)) {
        if (isOptional) continue
        throw new Error(`createBuildable [${type}]: missing required field "${key}"`)
      }

      const value = data[key]
      if (value == null && isOptional) continue

      const typeCtor = isOptional
        ? (expectedType as OptionalField<unknown>).defaultValue?.constructor
        : expectedType as SchemaType

      if (typeCtor && typeof value !== (typeCtor as SchemaType).name.toLowerCase()) {
        throw new Error(
          `createBuildable [${type}]: field "${key}" expected ${(typeCtor as SchemaType).name.toLowerCase()}, got ${typeof value}`
        )
      }
    }
  }

  const createInstance = (data: InferSchema<TSchema>): BuildableInstance<InferSchema<TSchema>, TMethods> => {
    const withMethods: Record<string, unknown> = {}

    for (const key in methods) {
      const methodName = `with${key.charAt(0).toUpperCase()}${key.slice(1)}`
      withMethods[methodName] = (arg: unknown) => {
        const patch = methods[key]!(arg)
        return createInstance({...data, ...patch})
      }
    }

    return {
      ...withMethods,
      [__BATONO_INTERNAL_BUILD_SYMBOL](ig: IInteractionGraph): Defined {
        return buildDefinition(ig, {type, ...data} as { type: string } & Record<string, unknown>)
      }
    } as BuildableInstance<InferSchema<TSchema>, TMethods>
  }

  return (args: InferSchema<TSchema>) => {
    validate(args as Record<string, unknown>)
    const dataWithDefaults = {...args}
    for (const key of schemaKeys) {
      const expectedType = schema[key]
      if ((expectedType as OptionalField<unknown>)?.[INTERNAL_BUILDER_PARAM_OPTIONAL] && !(key in dataWithDefaults)) {
        const defaultValue = (expectedType as OptionalField<unknown>).defaultValue
        if (defaultValue !== undefined) {
          (dataWithDefaults as Record<string, unknown>)[key] = defaultValue
        }
      }
    }
    return createInstance(dataWithDefaults)
  }
}
