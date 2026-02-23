import type {IBuildable} from "../../types/types.js";
import {__BATONO_INTERNAL_BUILD_SYMBOL} from "../../internal/index.js";

export function isBuildableItem(value: unknown): value is IBuildable {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as Record<symbol, unknown>)[__BATONO_INTERNAL_BUILD_SYMBOL] === 'function'
  )
}
