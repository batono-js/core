# Actions

Actions define what happens when the user interacts with the UI. They are defined server-side, serialized into the graph, and executed client-side.

---

## `bt.defineAction()`

```ts
const deleteUser = bt.defineAction(
  btUi.request('DELETE', '/users/42')
)
```

Wraps an action definition into a `DefinedAction` — a reusable, serializable reference. Actions are gathered automatically during `bt.graph()` — no manual registration needed.

---

## `withPayload()`

`withPayload` is immutable — it returns a new action instance and never mutates the original:

```ts
const bookUnit = bt.defineAction(
  btUi.request('POST', '/bookings')
)

const bookUnit42 = bookUnit.withPayload({id: 42})
```

Or inline per usage:

```ts
const bookUnit = (id: number) => bt.defineAction(
  btUi.request('POST', '/bookings').withPayload({id})
)

btUi.action('Book Unit A', bookUnit(1))
btUi.action('Book Unit B', bookUnit(2))
```

---

## Sequential

Actions execute one after another. Each step waits for the previous to complete.

```ts
const confirmAndDelete = bt.defineAction(
  bt.sequential(
    btUi.modal('Are you sure?'),
    btUi.request('DELETE', '/users/42')
  )
)
```

Serialized:

```json
{
  "type": "sequential",
  "items": [
    {"type": "modal", "message": "Are you sure?"},
    {"type": "request", "method": "DELETE", "url": "/users/42"}
  ]
}
```

---

## Parallel

Actions execute simultaneously.

```ts
const notify = bt.defineAction(
  bt.parallel(
    btUi.request('POST', '/notifications'),
    btUi.request('POST', '/audit-log')
  )
)
```

---

## Nested Flows

Sequential and parallel flows can be arbitrarily nested:

```ts
const complexFlow = bt.defineAction(
  bt.sequential(
    btUi.modal('Confirm booking?'),
    bt.parallel(
      btUi.request('POST', '/bookings'),
      btUi.request('POST', '/notifications')
    )
  )
)
```

---

## Action Deduplication

The same `DefinedAction` instance used in multiple places is registered only once in the graph:

```ts
const bookUnit = bt.defineAction(btUi.request('POST', '/bookings'))

bt.graph(
  bt.rows(
    bt.row(btUi.action('Book A', bookUnit)),
    bt.row(btUi.action('Book B', bookUnit.withPayload({id: 2})))
  )
)
```

`bookUnit` appears once in `actions` — `bookUnit.withPayload(...)` is a new instance and gets its own entry.

---

## Output Format

```json
{
  "actions": {
    "action_1": [
      {
        "$schema": "batono.interaction-graph.v1",
        "$graph": "g_a3f9x1",
        "type": "request",
        "method": "DELETE",
        "url": "/users/42"
      }
    ]
  }
}
```

Each action is an array of definitions — supporting sequential and parallel flows as ordered steps.
