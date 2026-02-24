export interface Defined {
  $schema: string
  $graph: string
  type: string
}

export interface ActionReferenceResult extends Defined {
  type: 'action-reference'
  action: string
  payload?: Record<string, unknown> | undefined
}

export interface ParallelActionResult extends Defined {
  type: 'parallel'
  items: Defined[]
}

export interface SequentialActionResult extends Defined {
  type: 'sequential'
  items: Defined[]
}

export interface ScopeResult extends Defined {
  type: 'scope'
  token: string
}

export type DefinedNode<T> = T & {
  $node: string[]
}

export type BuildResult<TData> = Defined & { type: string } & TData
