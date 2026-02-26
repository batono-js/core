import {
  __BATONO_INTERNAL_BUILD_SYMBOL,
  INTERNAL_ADD_ACTION_KEY,
  INTERNAL_REGISTER_ACTION_KEY
} from "./internal/internalKeys.js";
import type {IActionDefinition, IBuildable, IInteractionGraph} from "./types/types.js";
import type {ActionReferenceResult} from "./types/results.js";
import {buildDefinition} from "./BuildDefinition.js";

export class DefinedAction implements IActionDefinition<DefinedAction, ActionReferenceResult> {

  readonly #definitions: IBuildable[]

  #payload?: Record<string, unknown>

  constructor(...definitions: IBuildable[]) {
    this.#definitions = definitions
  }

  withPayload(payload: Record<string, unknown>): DefinedAction {
    const da = new DefinedAction(...this.#definitions)
    da.#payload = payload
    return da
  }

  [__BATONO_INTERNAL_BUILD_SYMBOL](interactionGraph: IInteractionGraph): ActionReferenceResult {

    const actionName = interactionGraph[INTERNAL_ADD_ACTION_KEY](this)
    interactionGraph[INTERNAL_REGISTER_ACTION_KEY](
      actionName,
      this.#definitions.map(x => x[__BATONO_INTERNAL_BUILD_SYMBOL](interactionGraph))
    )

    return buildDefinition(interactionGraph, 'action-reference', {
      action: actionName,
      payload: this.#payload
    })
  }
}
