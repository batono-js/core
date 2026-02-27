import {type BuildableConstructor, type BuildableInstance, type InferSchema,} from "./schema-types.js";
import {isBuildableItem, resolveArray, resolveWhen} from "./utils.js";
import type {FieldBuilder} from "./FieldBuilder.js";
import type {BuildResult} from "../../types/results.js";
import {buildDefinition} from "../../BuildDefinition.js";
import {__BATONO_INTERNAL_BUILD_SYMBOL} from "../../internal/index.js";
import type {IInteractionGraph} from "../../types/types.js";
import {validateField} from "./validateField.js";
import {ValidationError} from "./ValidationError.js";


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
    const resolveValue = (val: unknown, ig: IInteractionGraph): any => {
      if (isBuildableItem(val)) return val[__BATONO_INTERNAL_BUILD_SYMBOL](ig);
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        return Object.fromEntries(
          Object.entries(val).map(([k, v]) => [k, resolveValue(v, ig)])
        );
      }
      return val;
    };

    const withMethods: Record<string, unknown> = {};
    for (const key of Object.keys(methods)) {
      const methodName = `with${key.charAt(0).toUpperCase()}${key.slice(1)}`;
      withMethods[methodName] = (arg: unknown) => {
        const patch = (methods as Record<string, (arg: unknown) => Partial<InferSchema<TSchema>>>)[key]!(arg);
        return createInstance({...data, ...patch});
      };
    }

    return {
      ...withMethods,
      [__BATONO_INTERNAL_BUILD_SYMBOL](ig: IInteractionGraph): BuildResult<InferSchema<TSchema>> {
        const builtData: Record<string, unknown> = {};

        for (const key of schemaKeys) {
          const value = (data as Record<string, unknown>)[key];
          const descriptor = descriptors[key]!;

          if (descriptor.many && Array.isArray(value)) {
            builtData[key] = value.map(item => resolveValue(item, ig))
          } else {
            builtData[key] = resolveValue(value, ig)
          }
        }

        return buildDefinition(ig, type, builtData as { type: string } & InferSchema<TSchema>);
      }
    } as BuildableInstance<InferSchema<TSchema>, TMethods>;
  }

  return (args: InferSchema<TSchema>) => {
    const dataWithDefaults = {...args} as Record<string, unknown>

    for (const key of schemaKeys) {
      const descriptor = descriptors[key]!

      if (descriptor.optional && dataWithDefaults[key] === undefined && descriptor.defaultValue !== undefined) {
        dataWithDefaults[key] = descriptor.defaultValue
      }

      if (descriptor.many && Array.isArray(dataWithDefaults[key])) {
        dataWithDefaults[key] = resolveArray(dataWithDefaults[key] as unknown[])
      } else {
        dataWithDefaults[key] = resolveWhen(dataWithDefaults[key])
      }
    }

    validate(dataWithDefaults)

    return createInstance(dataWithDefaults as InferSchema<TSchema>)
  }
}
