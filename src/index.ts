import {createScope, Scope, ScopedBuildable} from "./utils/scope/index.js";
import type {IBuildable, IDefinedAction, IInteractionGraph} from "./types/types.js";
import {InteractionGraph} from "./InteractionGraph.js";
import {DefinedAction} from "./DefinedAction.js";
import {SequentialAction} from "./actions/SequentialAction.js";
import {ParallelAction} from "./actions/ParallelAction.js";

export * from './types/results.js'
export * from './types/types.js'
export * from './utils/create-buildable/index.js'
export * from "./utils/scope/index.js";

export {InteractionGraph} from "./InteractionGraph.js";
export {DefinedAction} from "./DefinedAction.js";
export {SequentialAction} from "./actions/SequentialAction.js";
export {ParallelAction} from "./actions/ParallelAction.js";

export const bt = {
  graph: (layout: IBuildable): IInteractionGraph => new InteractionGraph(layout),
  defineAction: (...actions: IBuildable[]): IDefinedAction => new DefinedAction(...actions),
  sequential: (...items: IBuildable[]) => new SequentialAction(...items),
  parallel: (...items: IBuildable[]) => new ParallelAction(...items),
  scope: (buildable: IBuildable, scope: Scope) => new ScopedBuildable(buildable, scope),
  createScope: ()=>createScope()
}
export type Bt = typeof bt
