import type {IBuildable, IInteractionGraph} from "../types/types.js";
import {__BATONO_INTERNAL_BUILD_SYMBOL} from "../internal/internalKeys.js";
import type {ParallelActionResult} from "../types/results.js";
import {buildDefinition} from "../BuildDefinition.js";


export class ParallelAction implements IBuildable<ParallelActionResult> {
  readonly #items: IBuildable[]

  constructor(...items: IBuildable[]) {
    this.#items = items
  }

  [__BATONO_INTERNAL_BUILD_SYMBOL](interactionGraph: IInteractionGraph): ParallelActionResult {
    return buildDefinition(interactionGraph, {
      type: 'parallel' as const,
      items: this.#items.map(item => item[__BATONO_INTERNAL_BUILD_SYMBOL](interactionGraph))
    })
  }
}
