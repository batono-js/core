import {FieldBuilder} from "./FieldBuilder.js";
import type {ConditionalBuildable} from "../../types/types.js";
import type {InferField, InferSchema} from "./schema-types.js";
import type {Scope} from "../scope/Scope.js";

export const s = {
  any: (): FieldBuilder<string> => new FieldBuilder('any'),
  object: <TSchema extends Record<string, FieldBuilder<unknown>>>(schema: TSchema): FieldBuilder<InferSchema<TSchema>> =>
    new FieldBuilder('object', null, schema),
  string: (): FieldBuilder<string> => new FieldBuilder('string'),
  number: (): FieldBuilder<number> => new FieldBuilder('number'),
  boolean: (): FieldBuilder<boolean> => new FieldBuilder('boolean'),
  buildable: (): FieldBuilder<ConditionalBuildable> => new FieldBuilder('buildable'),
  union: <T extends FieldBuilder<unknown>[]>(...fields: T): FieldBuilder<InferField<T[number]>> =>
    new FieldBuilder<InferField<T[number]>>('union', fields as FieldBuilder<unknown>[]),
  scope: (): FieldBuilder<Scope> => new FieldBuilder('scope'),
  enum: <T extends string>(...values: T[]): FieldBuilder<T> =>
    new FieldBuilder('enum', null, null, values),
  record: <T extends FieldBuilder<unknown>>(valueType: T): FieldBuilder<Record<string, InferField<T>>> =>
    new FieldBuilder('record', null, null, null, valueType),

}
