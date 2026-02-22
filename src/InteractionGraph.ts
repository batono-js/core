import {
  __BATONO_INTERNAL_BUILD_SYMBOL,
  INTERNAL_ADD_ACTION_KEY,
  INTERNAL_REGISTER_ACTION_KEY
} from "./internal/internalKeys.js";
import {randomUUID} from "node:crypto";
import type {IBuildable, IDefinedAction, IInteractionGraph, InteractionGraphPayload} from "./types/types.js";
import type {Defined} from "./types/results.js";

export class InteractionGraph implements IInteractionGraph {

  #latestActionId: number = 0

  readonly #$schema: string = 'batono.interaction-graph.v1'

  readonly #layout: IBuildable

  readonly #$graph: string = randomUUID().slice(0, 8)

  readonly #actionRegistry: Map<IDefinedAction, string> = new Map()

  constructor(layout: IBuildable) {
    this.#layout = layout
  }

  get $graph(): string {
    return this.#$graph
  }

  get $schema(): string {
    return this.#$schema
  }

  [INTERNAL_ADD_ACTION_KEY](action: IDefinedAction): string {
    let name = this.#actionRegistry.get(action)
    if (name) return name
    name = `action_${++this.#latestActionId}`
    this.#actionRegistry.set(action, name)
    return name
  }

  [INTERNAL_REGISTER_ACTION_KEY](actionName: string, actionReferenceResult: Defined[]): this {
    this.#actions[actionName] = actionReferenceResult
    return this
  }

  #actions: Record<string, Defined[]> = {}

  #build(): InteractionGraphPayload {
    const layout = this.#layout[__BATONO_INTERNAL_BUILD_SYMBOL](this)
    return {
      $schema: this.#$schema,
      $graph: this.#$graph,
      layout,
      actions: this.#actions
    }
  }

  toJSON(): InteractionGraphPayload {
    return this.#build()
  }
}
