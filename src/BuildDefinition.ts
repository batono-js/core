import type {IInteractionGraph} from "./types/types.js";
import type {BuildResult} from "./types/results.js";

export function buildDefinition<T extends { type: string } & Record<string, unknown>>(
  interactionGraph: IInteractionGraph,
  buildData: T
): BuildResult<T> {
  return {
    $schema: interactionGraph.$schema,
    $graph: interactionGraph.$graph,
    ...buildData,
  }
}
