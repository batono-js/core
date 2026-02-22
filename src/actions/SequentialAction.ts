import type {SequentialActionResult} from "../types/results.js";
import {__BATONO_INTERNAL_BUILD_SYMBOL} from "../internal/internalKeys.js";
import type {IBuildable, IInteractionGraph} from "../types/types.js";
import {buildDefinition} from "../BuildDefinition.js";

export class SequentialAction implements IBuildable<SequentialActionResult> {
  readonly #items: IBuildable[]

  constructor(...items: IBuildable[]) {
    this.#items = items
  }

  [__BATONO_INTERNAL_BUILD_SYMBOL](interactionGraph: IInteractionGraph): SequentialActionResult {
    return buildDefinition(interactionGraph, {
      type: 'sequential' as const,
      items: this.#items.map(item => item[__BATONO_INTERNAL_BUILD_SYMBOL](interactionGraph))
    })
  }
}
