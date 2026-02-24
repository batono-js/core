import {FieldBuilder, type Whenable} from "./FieldBuilder.js";
import type {IBuildable} from "../../types/types.js";
import type {InferField} from "./schema-types.js";
import type {Scope} from "../scope/Scope.js";

export const s = {
  string: (): FieldBuilder<string> => new FieldBuilder('string'),
  number: (): FieldBuilder<number> => new FieldBuilder('number'),
  boolean: (): FieldBuilder<boolean> => new FieldBuilder('boolean'),
  buildable: (): FieldBuilder<Whenable<IBuildable>> => new FieldBuilder('buildable'),
  union: <T extends FieldBuilder<unknown>[]>(...fields: T): FieldBuilder<InferField<T[number]>> =>
    new FieldBuilder<InferField<T[number]>>('union', fields as FieldBuilder<unknown>[]),
  scope: (): FieldBuilder<Scope> => new FieldBuilder('scope'),
}
