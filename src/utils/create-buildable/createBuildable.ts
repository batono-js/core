import {type BuildableConstructor, type BuildableInstance, type InferSchema,} from "./schema-types.js";
import {isBuildableItem} from "./utils.js";
import type {FieldBuilder} from "./FieldBuilder.js";
import type {BuildResult} from "../../types/results.js";
import {buildDefinition} from "../../BuildDefinition.js";
import {__BATONO_INTERNAL_BUILD_SYMBOL} from "../../internal/index.js";
import type {IBuildable, IInteractionGraph} from "../../types/types.js";
import {validateField} from "./validateField.js";
import {ValidationError} from "./ValidationError.js";
import {When} from "../condition-when/when.js";

const resolveWhen = (value: unknown): unknown =>
  value instanceof When ? value.valueOf() : value

const resolveArray = (arr: unknown[]): unknown[] =>
  arr.map(resolveWhen).filter(v => v !== false && v !== null && v !== undefined)


export function createBuildable<
  TSchema extends Record<string, FieldBuilder<unknown>>,
  TMethods extends Record<string, (arg: any) => Partial<InferSchema<TSchema>>>
>(
  type: string,
  schema: TSchema,
  methods: TMethods = {} as TMethods
): BuildableConstructor<InferSchema<TSchema>, TMethods> {

  const schemaKeys = Object.keys(schema)
  const descriptors = Object.fromEntries(
    schemaKeys.map(key => [key, schema[key]!.toDescriptor()])
  )

  const validate = (data: Record<string, unknown>) => {
    for (const key of schemaKeys) {
      const descriptor = descriptors[key]!

      if (!(key in data) || data[key] === undefined) {
        if (descriptor.optional) continue
        throw new ValidationError('missing_field', type, key, 'is required')
      }

      const value = descriptor.many && Array.isArray(data[key])
        ? resolveArray(data[key] as unknown[])
        : resolveWhen(data[key])

      validateField(type, key, value, descriptor)
    }
  }

  const createInstance = (data: InferSchema<TSchema>): BuildableInstance<InferSchema<TSchema>, TMethods> => {
    const withMethods: Record<string, unknown> = {}

    for (const key of Object.keys(methods)) {
      const methodName = `with${key.charAt(0).toUpperCase()}${key.slice(1)}`
      withMethods[methodName] = (arg: unknown) => {
        const patch = (methods as Record<string, (arg: unknown) => Partial<InferSchema<TSchema>>>)[key]!(arg)
        return createInstance({...data, ...patch})
      }
    }

    return {
      ...withMethods,
      [__BATONO_INTERNAL_BUILD_SYMBOL](ig: IInteractionGraph): BuildResult<InferSchema<TSchema>> {
        const builtData: Record<string, unknown> = {}

        for (const key of schemaKeys) {
          const value = (data as Record<string, unknown>)[key]
          const descriptor = descriptors[key]!

          if (descriptor.containsBuildable && value != null) {
            if (descriptor.many && Array.isArray(value)) {
              builtData[key] = value.map(item =>
                isBuildableItem(item) ? item[__BATONO_INTERNAL_BUILD_SYMBOL](ig) : item
              )
            } else if (descriptor.baseType === 'object' && descriptor.objectSchema) {
              const obj = value as Record<string, unknown>
              builtData[key] = Object.fromEntries(
                Object.entries(obj).map(([k, v]) => [
                  k,
                  isBuildableItem(v) ? v[__BATONO_INTERNAL_BUILD_SYMBOL](ig) : v
                ])
              )
            } else if (descriptor.baseType === 'record') {
              const obj = value as Record<string, unknown>
              builtData[key] = Object.fromEntries(
                Object.entries(obj).map(([k, v]) => [
                  k,
                  isBuildableItem(v)
                    ? v[__BATONO_INTERNAL_BUILD_SYMBOL](ig)
                    : v
                ])
              )
            } else if (descriptor.baseType === 'union') {
              builtData[key] = isBuildableItem(value)
                ? value[__BATONO_INTERNAL_BUILD_SYMBOL](ig)
                : value
            } else {
              builtData[key] = (value as IBuildable)[__BATONO_INTERNAL_BUILD_SYMBOL](ig)
            }
          } else {
            builtData[key] = value
          }
        }

        return buildDefinition(ig, {type, ...builtData} as {
          type: string
        } & InferSchema<TSchema>)
      }
    } as BuildableInstance<InferSchema<TSchema>, TMethods>
  }

  return (args: InferSchema<TSchema>) => {
    const dataWithDefaults = {...args} as Record<string, unknown>

    for (const key of schemaKeys) {
      const descriptor = descriptors[key]!

      if (descriptor.optional && dataWithDefaults[key] === undefined && descriptor.defaultValue !== undefined) {
        dataWithDefaults[key] = descriptor.defaultValue
      }

      // Resolve When *before* validate so type checks see the real value
      if (descriptor.many && Array.isArray(dataWithDefaults[key])) {
        dataWithDefaults[key] = resolveArray(dataWithDefaults[key] as unknown[])
      } else {
        dataWithDefaults[key] = resolveWhen(dataWithDefaults[key])
      }
    }

    // FIX 1 cont.: validate after resolution so When-instances are unwrapped
    validate(dataWithDefaults)

    return createInstance(dataWithDefaults as InferSchema<TSchema>)
  }
}
