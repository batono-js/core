import {__BATONO_INTERNAL_BUILD_SYMBOL} from "../../internal/index.js";
import type {IBuildable, IInteractionGraph} from "../../types/types.js";
import type {Scope} from "./Scope.js";
import type {Defined, DefinedNode} from "../../types/results.js";

export class ScopedBuildable<T extends Defined> implements IBuildable<DefinedNode<T>> {
  readonly #inner: IBuildable<T>
  readonly #scope: Scope

  constructor(inner: IBuildable<T>, scope: Scope) {
    this.#inner = inner
    this.#scope = scope
  }

  [__BATONO_INTERNAL_BUILD_SYMBOL](ig: IInteractionGraph): DefinedNode<T> {
    const result = this.#inner[__BATONO_INTERNAL_BUILD_SYMBOL](ig) as DefinedNode<T>
    const existing = result.$node ?? []
    return {...result, $node: [...existing, this.#scope.token]}
  }
}
