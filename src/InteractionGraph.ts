import {
  __BATONO_INTERNAL_BUILD_SYMBOL,
  INTERNAL_ADD_FLOW_KEY,
  INTERNAL_REGISTER_FLOW_KEY
} from "./internal/internalKeys.js";
import type {IBuildable, IDefinedFlow, IInteractionGraph, InteractionGraphPayload} from "./types/types.js";
import type {Defined} from "./types/results.js";
import {randomUUID} from 'node:crypto'

export class InteractionGraph implements IInteractionGraph {

  #latestFlowId: number = 0

  readonly #$schema: string = 'batono.interaction-graph.v1'

  readonly #layout: IBuildable

  readonly #$graph: string = `g_${randomUUID().slice(0, 8)}`

  readonly #flowRegistry: Map<IDefinedFlow, string> = new Map()

  #tokenCounter: number = 0

  constructor(layout: IBuildable) {
    this.#layout = layout
  }

  get $graph(): string {
    return this.#$graph
  }

  get $schema(): string {
    return this.#$schema
  }

  nextToken(prefix: string): string {
    return `${prefix}${++this.#tokenCounter}`
  }

  [INTERNAL_ADD_FLOW_KEY](flow: IDefinedFlow): string {
    let name = this.#flowRegistry.get(flow)
    if (name) return name
    name = `flow_${++this.#latestFlowId}`
    this.#flowRegistry.set(flow, name)
    return name
  }

  [INTERNAL_REGISTER_FLOW_KEY](flowName: string, actionReferenceResult: Defined[]): this {
    this.#flows[flowName] = actionReferenceResult
    return this
  }

  #flows: Record<string, Defined[]> = {}

  #build(): InteractionGraphPayload {
    const $layout = this.#layout[__BATONO_INTERNAL_BUILD_SYMBOL](this)
    return {
      $schema: this.#$schema,
      $graph: this.#$graph,
      $layout,
      $flows: this.#flows
    }
  }

  toJSON(): InteractionGraphPayload {
    return this.#build()
  }
}
