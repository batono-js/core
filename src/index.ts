import {createScope, Scope, ScopedBuildable} from "./utils/scope/index.js";
import type {IBuildable, IDefinedFlow, IInteractionGraph} from "./types/types.js";
import {InteractionGraph} from "./InteractionGraph.js";
import {DefinedFlow} from "./DefinedFlow.js";
import {SequentialAction} from "./actions/SequentialAction.js";
import {ParallelAction} from "./actions/ParallelAction.js";

export * from './types/results.js'
export * from './types/types.js'
export * from './utils/create-buildable/index.js'
export * from "./utils/scope/index.js";
export {when} from "./utils/condition-when/when.js";
export {InteractionGraph} from "./InteractionGraph.js";
export {DefinedFlow} from "./DefinedFlow.js";
export {SequentialAction} from "./actions/SequentialAction.js";
export {ParallelAction} from "./actions/ParallelAction.js";

export const bt = {
  graph: (layout: IBuildable): IInteractionGraph => new InteractionGraph(layout),
  defineFlow: (...actions: IBuildable[]): IDefinedFlow => new DefinedFlow(...actions),
  sequential: (...items: IBuildable[]) => new SequentialAction(...items),
  parallel: (...items: IBuildable[]) => new ParallelAction(...items),
  scope: (buildable: IBuildable, scope: Scope) => new ScopedBuildable(buildable, scope),
  createScope: () => createScope()
}
export type Bt = typeof bt
