import {ScopedBuildable} from "./ScopedBuildable.js";
import type {Scope} from "./Scope.js";
import type {IBuildable} from "../../types/types.js";
import type {Defined} from "../../types/results.js";
import type {BuildableConstructor, BuildableInstance, InferSchema} from "../create-buildable/schema-types.js";
import type {FieldBuilder} from "../create-buildable/FieldBuilder.js";
import {__BATONO_INTERNAL_BUILD_SYMBOL} from "../../internal/index.js";

type ScopedResult<T extends IBuildable<Defined>> =
  Scopable<ScopedBuildable<ReturnType<T[typeof __BATONO_INTERNAL_BUILD_SYMBOL]>>>

export type Scopable<T extends IBuildable<Defined>> = T & {
  scope(scope: Scope): ScopedResult<T>
}

export type ScopableConstructor<TData, TMethods extends Record<string, (arg: any) => Partial<TData>>> =
  (args: TData) => Scopable<BuildableInstance<TData, TMethods>>

const injectScopable = <T extends IBuildable<Defined>>(instance: T): Scopable<T> => {
  const scopable = instance as Scopable<T>
  scopable.scope = (scope: Scope): ScopedResult<T> =>
    injectScopable(new ScopedBuildable(instance, scope) as ScopedResult<T>)
  return scopable
}


export const scopable =
  <
    TSchema extends Record<string, FieldBuilder<unknown>>,
    TMethods extends Record<string, (arg: any) => Partial<InferSchema<TSchema>>>
  >(
    factory: BuildableConstructor<InferSchema<TSchema>, TMethods>
  ): ScopableConstructor<InferSchema<TSchema>, TMethods> =>
    (args: InferSchema<TSchema>) => injectScopable(factory(args))
