import {type BuildableConstructor, type BuildableInstance, type InferSchema,} from "./schema-types.js";
import {isBuildableItem} from "./utils.js";
import type {FieldBuilder} from "./FieldBuilder.js";
import type {Defined} from "../../types/results.js";
import {buildDefinition} from "../../BuildDefinition.js";
import {__BATONO_INTERNAL_BUILD_SYMBOL} from "../../internal/index.js";
import type {IBuildable, IInteractionGraph} from "../../types/types.js";
import {validateField} from "./validateField.js";


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

      if (!(key in data)) {
        if (descriptor.optional) continue
        throw new Error(`createBuildable [${type}]: missing required field "${key}"`)
      }

      validateField(type, key, data[key], descriptor)
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
          const descriptor = descriptors[key]!

          if (descriptor.containsBuildable && value != null) {
            if (descriptor.many && Array.isArray(value)) {
              builtData[key] = value.map(item =>
                isBuildableItem(item) ? item[__BATONO_INTERNAL_BUILD_SYMBOL](ig) : item
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

        return buildDefinition(ig, {type, ...builtData} as { type: string } & Record<string, unknown>)
      }
    } as BuildableInstance<InferSchema<TSchema>, TMethods>
  }

  return (args: InferSchema<TSchema>) => {
    validate(args as Record<string, unknown>)
    const dataWithDefaults = {...args}
    for (const key of schemaKeys) {
      const descriptor = descriptors[key]!
      if (descriptor.optional && !(key in dataWithDefaults) && descriptor.defaultValue !== undefined) {
        (dataWithDefaults as Record<string, unknown>)[key] = descriptor.defaultValue
      }
    }
    return createInstance(dataWithDefaults)
  }
}
