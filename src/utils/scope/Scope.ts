import {__BATONO_INTERNAL_BUILD_SYMBOL, buildDefinition} from "../../internal/index.js";
import type {IInteractionGraph} from "../../types/types.js";
import type {ScopeResult} from "../../types/results.js";

export class Scope {
  readonly #token: string

  constructor(token: string) {
    this.#token = token
  }

  get token(): string {
    return this.#token
  }

  [__BATONO_INTERNAL_BUILD_SYMBOL](ig: IInteractionGraph): ScopeResult {
    return buildDefinition(ig, {
      type: 'scope' as const,
      token: this.#token
    })
  }
}
