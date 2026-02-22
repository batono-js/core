import type {IInteractionGraph} from "./types/types.js";
import type {Defined} from "./types/results.js";

export function buildDefinition<T extends { type: string } & Record<string, unknown>>(
  interactionGraph: IInteractionGraph,
  buildData: T
): Defined & T {
  return {
    $schema: interactionGraph.$schema,
    $graph: interactionGraph.$graph,
    ...buildData,
  }
}
