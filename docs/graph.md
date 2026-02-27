# InteractionGraph

The `InteractionGraph` is the core output of Batono — a self-contained, serializable description of a UI interaction. The backend defines it, the frontend renders and executes it.

---

## `bt.graph()`

```ts
const graph = bt.graph(layout)
res.json(graph)
```

Builds the graph from a root `IBuildable`. During the build:

- Every child node receives a `$g_<id>` discriminator key for runtime identification
- All referenced `DefinedFlow` instances are gathered automatically into `$flows`
- Scope tokens are generated lazily via the graph's internal counter

---

## Output Format

```json
{
  "$schema": "batono.interaction-graph.v1",
  "$graph": "g_745jwh",
  "$layout": {
    "$g_745jwh": 1,
    "$type": "rows",
    "items": [
      {
        "$g_745jwh": 1,
        "$type": "action-reference",
        "$flow": "flow_1"
      }
    ]
  },
  "$flows": {
    "flow_1": [
      {
        "$g_745jwh": 1,
        "$type": "request",
        "method": "POST",
        "url": "/bookings"
      }
    ]
  }
}
```

### `$schema`

Identifies the protocol version — `batono.interaction-graph.v1`. Used by the renderer to validate compatibility.

### `$graph`

A unique token per response, generated with `crypto.randomUUID()`. Present only on the root wrapper object.

### `$g_<id>`

Every child node carries a `$g_<id>: 1` key derived from the graph token. The renderer uses this to identify nodes as belonging to the current graph and to distinguish buildable nodes from plain values at runtime.

### `$layout`

The root node of the UI tree. Every nested node is a serialized `IBuildable`.

### `$flows`

A flat map of all flows referenced anywhere in the layout. Keys are auto-generated (`flow_1`, `flow_2`, ...). Each value is an array of action definitions supporting sequential and parallel execution.

---

## `$node`

Nodes marked with `.scope()` carry a `$node` array:

```json
{
  "$g_745jwh": 1,
  "$type": "table",
  "$node": ["s_1"]
}
```

The client uses `$node` to locate nodes for partial re-rendering. See [scope.md](./scope.md).

---

## Token Generation

| Token          | Source                      | Format      |
|----------------|-----------------------------|-------------|
| `$graph`       | `crypto.randomUUID()`       | `g_a3f9x1`  |
| `$node` / flow keys | Internal counter per graph | `s_1`, `flow_1` |

Tokens are unique within a graph. `$graph` separates graphs from different responses.

---

## Validation

The renderer should validate every incoming graph:

```ts
import type {InteractionGraphPayload} from '@batono/core'

function isBatonoGraph(json: unknown): json is InteractionGraphPayload {
  return (
    typeof json === 'object' &&
    json !== null &&
    '$schema' in json &&
    (json as any).$schema === 'batono.interaction-graph.v1'
  )
}
```

For individual nodes, check for the graph discriminator:

```ts
function isBatonoNode(json: unknown, graphId: string): boolean {
  return (
    typeof json === 'object' &&
    json !== null &&
    `$${graphId}` in json
  )
}
```

---

## Design Goals

- **Self-contained** — one response contains everything the renderer needs
- **Tamper-resistant** — `$graph` token links all nodes to a single response
- **Predictable** — no hidden state, no magic, everything is explicit and serializable
