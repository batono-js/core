import {__BATONO_INTERNAL_BUILD_SYMBOL, buildDefinition} from "../../internal/index.js";
import type {IInteractionGraph} from "../../types/types.js";
import type {ScopeResult} from "../../types/results.js";

export class Scope {
  #token?: string


  token(ig: IInteractionGraph): string {
    return this.#token ??= ig.nextToken('s_')
  }

  [__BATONO_INTERNAL_BUILD_SYMBOL](ig: IInteractionGraph): ScopeResult {
    return buildDefinition(ig, {
      type: 'scope' as const,
      token: this.token(ig)
    })
  }
}
