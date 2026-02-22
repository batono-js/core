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
