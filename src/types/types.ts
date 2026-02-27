import type {Defined, FlowReferenceResult} from "./results.js";
import {
  __BATONO_INTERNAL_BUILD_SYMBOL,
  INTERNAL_ADD_FLOW_KEY,
  INTERNAL_REGISTER_FLOW_KEY
} from "../internal/internalKeys.js";
import type {When} from "../utils/condition-when/when.js";

export type InteractionGraphPayload = {
  $schema: string
  $graph: string
  $layout: Defined
  $flows: Record<string, Defined[]>
}

export interface IInteractionGraph {
  readonly $graph: string
  readonly $schema: string

  [INTERNAL_REGISTER_FLOW_KEY](actionName: string, definitions: Defined[]): this

  [INTERNAL_ADD_FLOW_KEY](action: IDefinedFlow): string

  toJSON(): InteractionGraphPayload

  nextToken(prefix: string): string
}

export interface IBuildable<T extends Defined = Defined> {
  [__BATONO_INTERNAL_BUILD_SYMBOL](interactionGraph: IInteractionGraph): T
}

export interface IDefinedFlow extends IBuildable<FlowReferenceResult>, IWithPayload<IDefinedFlow> {
}

export interface IActionDefinition<TSelf extends IActionDefinition<TSelf, TResult>, TResult extends Defined = Defined>
  extends IBuildable<TResult>, IWithPayload<TSelf> {
}

export interface IWithPayload<TSelf> {
  withPayload(payload: Record<string, unknown>): TSelf
}

export type Whenable<T> = T | When<T>

export type ConditionalBuildable = Whenable<IBuildable>
