import {__BATONO_INTERNAL_BUILD_SYMBOL} from "../internal/index.js";
import {buildDefinition} from "../BuildDefinition.js";

import type {IBuildable, IInteractionGraph} from "../types/types.js";
import {
  INTERNAL_BUILDER_PARAM_ARRAY,
  INTERNAL_BUILDER_PARAM_BUILDABLE,
  INTERNAL_BUILDER_PARAM_OPTIONAL
} from "../internal/internalKeys.js";
import type {Defined} from "../types/results.js";

type SchemaType = typeof String | typeof Number | typeof Boolean

interface OptionalField<T> {
  [INTERNAL_BUILDER_PARAM_OPTIONAL]: true
  defaultValue: T | undefined
}

interface ArrayOfField<T> {
  [INTERNAL_BUILDER_PARAM_ARRAY]: true
  type: T
}

interface BuildableField {
  [INTERNAL_BUILDER_PARAM_BUILDABLE]: true
}

function isBuildableItem(value: unknown): value is IBuildable {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as Record<symbol, unknown>)[__BATONO_INTERNAL_BUILD_SYMBOL] === 'function'
  )
}

type SchemaValue = SchemaType | OptionalField<unknown> | ArrayOfField<unknown> | BuildableField

type InferSchemaValue<T extends SchemaValue> =
  T extends OptionalField<infer D>
    ? D extends string ? string | undefined
      : D extends number ? number | undefined
        : D extends boolean ? boolean | undefined
          : D extends ArrayOfField<infer A extends SchemaValue> ? Array<InferSchemaValue<A>> | undefined
            : unknown
    : T extends typeof String ? string
      : T extends typeof Number ? number
        : T extends typeof Boolean ? boolean
          : T extends ArrayOfField<infer A extends SchemaValue> ? Array<InferSchemaValue<A>>
            : T extends BuildableField ? IBuildable
              : unknown

type InferRequired<S extends Record<string, SchemaValue>> = {
  [K in keyof S as S[K] extends OptionalField<any> ? never : K]: InferSchemaValue<S[K]>
}

type InferOptional<S extends Record<string, SchemaValue>> = {
  [K in keyof S as S[K] extends OptionalField<any> ? K : never]?: InferSchemaValue<S[K]>
}

type InferSchema<S extends Record<string, SchemaValue>> = InferRequired<S> & InferOptional<S>

type WithMethods<TData, TMethods extends Record<string, (arg: any) => Partial<TData>>> = {
  [K in keyof TMethods as `with${Capitalize<string & K>}`]: (
    arg: Parameters<TMethods[K]>[0]
  ) => BuildableInstance<TData, TMethods>
}

type BuildableInstance<TData, TMethods extends Record<string, (arg: any) => Partial<TData>>> =
  IBuildable & WithMethods<TData, TMethods>

type BuildableConstructor<TData, TMethods extends Record<string, (arg: any) => Partial<TData>>> =
  (args: TData) => BuildableInstance<TData, TMethods>

export function optional<T>(defaultValue?: T): OptionalField<T> {
  return {[INTERNAL_BUILDER_PARAM_OPTIONAL]: true, defaultValue}
}

export function arrayOf<T extends SchemaValue>(type: T): ArrayOfField<T> {
  return {[INTERNAL_BUILDER_PARAM_ARRAY]: true, type}
}

export function buildable(): BuildableField {
  return {[INTERNAL_BUILDER_PARAM_BUILDABLE]: true}
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
      const isArray = (expectedType as ArrayOfField<unknown>)?.[INTERNAL_BUILDER_PARAM_ARRAY]
      const isBuildable = (expectedType as BuildableField)?.[INTERNAL_BUILDER_PARAM_BUILDABLE]

      if (!(key in data)) {
        if (isOptional) continue
        throw new Error(`createBuildable [${type}]: missing required field "${key}"`)
      }

      const value = data[key]
      if (value == null && isOptional) continue

      if (isBuildable) {
        if (!isBuildableItem(value)) {
          throw new Error(`createBuildable [${type}]: field "${key}" expected IBuildable, got ${typeof value}`)
        }
        continue
      }

      if (isArray) {
        if (!Array.isArray(value)) {
          throw new Error(`createBuildable [${type}]: field "${key}" expected array, got ${typeof value}`)
        }
        continue
      }

      const typeCtor = isOptional
        ? (expectedType as OptionalField<unknown>).defaultValue?.constructor ?? null
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
        const builtData: Record<string, unknown> = {}

        for (const key of schemaKeys) {
          const value = (data as Record<string, unknown>)[key]
          const expectedType = schema[key]
          const isBuildable = (expectedType as BuildableField)?.[INTERNAL_BUILDER_PARAM_BUILDABLE]
          const isArray = (expectedType as ArrayOfField<unknown>)?.[INTERNAL_BUILDER_PARAM_ARRAY]

          if (isBuildable && value != null) {
            builtData[key] = (value as IBuildable)[__BATONO_INTERNAL_BUILD_SYMBOL](ig)
          } else if (isArray && Array.isArray(value)) {
            builtData[key] = value.map(item =>
              isBuildableItem(item)
                ? item[__BATONO_INTERNAL_BUILD_SYMBOL](ig)
                : item
            )
          } else {
            builtData[key] = value
          }
        }

        return buildDefinition(ig, {type, ...builtData} as { type: string } & Record<string, unknown>)
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
