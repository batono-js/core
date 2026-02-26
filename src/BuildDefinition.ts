import type {IInteractionGraph} from "./types/types.js";
import type {BuildResult, GraphDiscriminatorKey} from "./types/results.js";

export function buildDefinition<T extends Record<string, unknown>, TType extends string>(
  interactionGraph: IInteractionGraph,
  type: TType,
  buildData: T
): BuildResult<T, TType> {
  const igKey = `$${interactionGraph.$graph}` as GraphDiscriminatorKey
  const finalBuild = {
    [igKey]: 1,
    $type: type,
    ...buildData,
  }

  if (finalBuild[igKey] !== 1) {
    throw new Error(`buildDefinition: buildData overwrites reserved key "${igKey}"`)
  }
  if (finalBuild.$type !== type) {
    throw new Error(`buildDefinition: buildData overwrites reserved key "$type"`)
  }

  return finalBuild as BuildResult<T, TType>
}
