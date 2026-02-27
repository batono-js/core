import {
  __BATONO_INTERNAL_BUILD_SYMBOL,
  INTERNAL_ADD_FLOW_KEY,
  INTERNAL_REGISTER_FLOW_KEY
} from "./internal/internalKeys.js";
import type {IActionDefinition, IBuildable, IInteractionGraph} from "./types/types.js";
import type {FlowReferenceResult} from "./types/results.js";
import {buildDefinition} from "./BuildDefinition.js";

export class DefinedFlow implements IActionDefinition<DefinedFlow, FlowReferenceResult> {

  readonly #definitions: IBuildable[]

  #payload?: Record<string, unknown>

  constructor(...definitions: IBuildable[]) {
    this.#definitions = definitions
  }

  withPayload(payload: Record<string, unknown>): DefinedFlow {
    const da = new DefinedFlow(...this.#definitions)
    da.#payload = payload
    return da
  }

  [__BATONO_INTERNAL_BUILD_SYMBOL](interactionGraph: IInteractionGraph): FlowReferenceResult {

    const flowName = interactionGraph[INTERNAL_ADD_FLOW_KEY](this)
    interactionGraph[INTERNAL_REGISTER_FLOW_KEY](
      flowName,
      this.#definitions.map(x => x[__BATONO_INTERNAL_BUILD_SYMBOL](interactionGraph))
    )

    return buildDefinition(interactionGraph, 'flow-reference', {
      $flow: flowName,
      payload: this.#payload
    })
  }
}
