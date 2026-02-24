import type {ActionReferenceResult, Defined} from "./results.js";
import {
  __BATONO_INTERNAL_BUILD_SYMBOL,
  INTERNAL_ADD_ACTION_KEY,
  INTERNAL_REGISTER_ACTION_KEY
} from "../internal/internalKeys.js";

export type InteractionGraphPayload = {
  $schema: string
  $graph: string
  layout: Defined
  actions: Record<string, Defined[]>
}

export interface IInteractionGraph {
  readonly $graph: string
  readonly $schema: string

  [INTERNAL_REGISTER_ACTION_KEY](actionName: string, definitions: Defined[]): this

  [INTERNAL_ADD_ACTION_KEY](action: IDefinedAction): string

  toJSON(): InteractionGraphPayload

  nextToken(prefix: string): string
}

export interface IBuildable<T extends Defined = Defined> {
  [__BATONO_INTERNAL_BUILD_SYMBOL](interactionGraph: IInteractionGraph): T
}

export interface IDefinedAction extends IBuildable<ActionReferenceResult>, IWithPayload<IDefinedAction> {
}

export interface IActionDefinition<TSelf extends IActionDefinition<TSelf, TResult>, TResult extends Defined = Defined>
  extends IBuildable<TResult>, IWithPayload<TSelf> {
}

export interface IWithPayload<TSelf> {
  withPayload(payload: Record<string, unknown>): TSelf
}
