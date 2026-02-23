import {FieldBuilder} from "./FieldBuilder.js";
import type {IBuildable} from "../../types/types.js";

export type InferField<T extends FieldBuilder<unknown>> =
  T extends FieldBuilder<infer U> ? U : unknown

type InferRequired<S extends Record<string, FieldBuilder<any, any>>> = {
  [K in keyof S as S[K] extends FieldBuilder<any, infer O>
    ? O extends true ? never : K
    : K]: InferField<S[K]>
}

type InferOptional<S extends Record<string, FieldBuilder<any, any>>> = {
  [K in keyof S as S[K] extends FieldBuilder<any, infer O>
    ? O extends true ? K : never
    : never]?: InferField<S[K]>
}

export type InferSchema<S extends Record<string, FieldBuilder<any, any>>> =
  InferRequired<S> & InferOptional<S>

type WithMethods<TData, TMethods extends Record<string, (arg: any) => Partial<TData>>> = {
  [K in keyof TMethods as `with${Capitalize<string & K>}`]: (
    arg: Parameters<TMethods[K]>[0]
  ) => BuildableInstance<TData, TMethods>
}

export type BuildableInstance<TData, TMethods extends Record<string, (arg: any) => Partial<TData>>> =
  IBuildable & WithMethods<TData, TMethods>

export  type BuildableConstructor<TData, TMethods extends Record<string, (arg: any) => Partial<TData>>> =
  (args: TData) => BuildableInstance<TData, TMethods>
