# InteractionGraph

The `InteractionGraph` is the core output of Batono — a self-contained, serializable description of a UI interaction. The backend defines it, the frontend renders and executes it.

---

## `bt.graph()`

```ts
const graph = bt.graph(layout)
res.json(graph)
```

Builds the graph from a root `IBuildable`. During the build:

- Every node receives the same `$schema` and `$graph` token
- All referenced `DefinedAction` instances are gathered automatically
- Scope tokens are generated lazily via the graph's internal counter

---

## Output Format

```json
{
  "$schema": "batono.interaction-graph.v1",
  "$graph": "g_745jwh",
  "layout": {
    "$schema": "batono.interaction-graph.v1",
    "$graph": "g_745jwh",
    "type": "rows",
    "items": [...]
  },
  "actions": {
    "action_1": [
      {
        "$schema": "batono.interaction-graph.v1",
        "$graph": "g_745jwh",
        "type": "request",
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

A unique token per response, generated with `crypto.randomUUID()`. Every node in the graph carries the same token — the renderer uses it to verify all nodes belong to the same response.

### `layout`

The root node of the UI tree. Every nested node is a serialized `IBuildable`.

### `actions`

A flat map of all actions referenced anywhere in the layout. Keys are auto-generated (`action_1`, `action_2`, ...). Each value is an array of action definitions supporting sequential flows.

---

## `$node`

Nodes marked with `.scope()` carry a `$node` array:

```json
{
  "type": "table",
  "$node": ["n_1"]
}
```

The client uses `$node` to locate nodes for partial re-rendering. See [scope.md](./scope.md).

---

## Token Generation

| Token | Source | Format |
|---|---|---|
| `$graph` | `crypto.randomUUID()` | `g_a3f9x1` |
| `$node` / action keys | Internal counter per graph | `n_1`, `action_1` |

Tokens are unique within a graph. `$graph` separates graphs from different responses.

---

## Validation

The renderer should validate every incoming node:

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

---

## Design Goals

- **Self-contained** — one response contains everything the renderer needs
- **Tamper-resistant** — `$graph` token links all nodes to a single response
- **Predictable** — no hidden state, no magic, everything is explicit and serializable
