export type GraphDiscriminatorKey = `$g_${string}`

export type GraphDiscriminator = { [key: GraphDiscriminatorKey]: 1 }

export type Defined = GraphDiscriminator & {
  $type: string
}

export interface FlowReferenceResult extends Defined {
  $type: 'flow-reference'
  $flow: string
  payload?: Record<string, unknown> | undefined
}

export interface ParallelActionResult extends Defined {
  $type: 'parallel'
  items: Defined[]
}

export interface SequentialActionResult extends Defined {
  $type: 'sequential'
  items: Defined[]
}

export interface ScopeResult extends Defined {
  $type: 'scope'
  token: string
}

export type DefinedNode<T> = T & {
  $node: string[]
}

export type BuildResult<T, TType extends string = string> = GraphDiscriminator & {
  $type: TType
} & T
