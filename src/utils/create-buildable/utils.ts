import type {IBuildable, IInteractionGraph} from "../../types/types.js";
import {__BATONO_INTERNAL_BUILD_SYMBOL} from "../../internal/index.js";
import {When} from "../condition-when/when.js";
import type {Defined} from "../../types/results.js";

export function isBuildableItem(value: unknown): value is IBuildable {
  return (
    value != null &&
    typeof value === 'object' &&
    typeof (value as Record<symbol, unknown>)[__BATONO_INTERNAL_BUILD_SYMBOL] === 'function'
  )
}

export function resolveBuildable(item: unknown, ig: IInteractionGraph): Defined | undefined {
  const resolved = resolveWhen(item)
  if (!resolved || !isBuildableItem(resolved)) return undefined
  return resolved[__BATONO_INTERNAL_BUILD_SYMBOL](ig)
}

export function resolveBuildableArray(items: unknown[], ig: IInteractionGraph): Defined[] {
  return items.reduce<Defined[]>((acc, item) => {
    const resolved = resolveWhen(item)
    if (isBuildableItem(resolved)) {
      acc.push(resolved[__BATONO_INTERNAL_BUILD_SYMBOL](ig))
    }
    return acc
  }, [])
}

export const resolveWhen = (value: unknown): unknown =>
  value instanceof When ? value.valueOf() : value

export const resolveArray = (arr: unknown[]): unknown[] =>
  arr.map(resolveWhen).filter(v => v !== false && v !== null && v !== undefined)
