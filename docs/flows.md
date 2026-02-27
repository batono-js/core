# Flows

Flows define what happens when the user interacts with the UI. They are defined server-side, serialized into the graph, and executed client-side.

---

## `bt.defineFlow()`

```ts
const deleteUser = bt.defineFlow(
  new RequestAction('DELETE', '/users/42')
)
```

Wraps one or more actions into a `DefinedFlow` — a reusable, serializable reference. Flows are gathered automatically during `bt.graph()` — no manual registration needed.

---

## `withPayload()`

`withPayload` is immutable — it returns a new action instance and never mutates the original:

```ts
const bookUnit = bt.defineFlow(
  new RequestAction('POST', '/bookings')
)

const bookUnit42 = bookUnit.withPayload({id: 42})
```

Or inline per usage:

```ts
const bookUnit = (id: number) => bt.defineFlow(
  new RequestAction('POST', '/bookings').withPayload({id})
)
```

---

## Sequential

Actions execute one after another. Each step waits for the previous to complete.

```ts
const confirmAndDelete = bt.defineFlow(
  bt.sequential(
    new NavigateAction('/confirm'),
    new RequestAction('DELETE', '/users/42')
  )
)
```

Serialized:

```json
{
  "$g_a3f9x1": 1,
  "$type": "sequential",
  "items": [
    {"$g_a3f9x1": 1, "$type": "navigate", "url": "/confirm"},
    {"$g_a3f9x1": 1, "$type": "request", "method": "DELETE", "url": "/users/42"}
  ]
}
```

---

## Parallel

Actions execute simultaneously.

```ts
const notify = bt.defineFlow(
  bt.parallel(
    new RequestAction('POST', '/notifications'),
    new RequestAction('POST', '/audit-log')
  )
)
```

---

## Nested Flows

Sequential and parallel flows can be arbitrarily nested:

```ts
const complexFlow = bt.defineFlow(
  bt.sequential(
    new NavigateAction('/confirm'),
    bt.parallel(
      new RequestAction('POST', '/bookings'),
      new RequestAction('POST', '/notifications')
    )
  )
)
```

---

## Flow Deduplication

The same `DefinedFlow` instance used in multiple places is registered only once in the graph:

```ts
const bookUnit = bt.defineFlow(new RequestAction('POST', '/bookings'))

bt.graph(
  bt.rows(
    bt.row(btUi.action('Book A', bookUnit)),
    bt.row(btUi.action('Book B', bookUnit.withPayload({id: 2})))
  )
)
```

`bookUnit` appears once in `$flows` — `bookUnit.withPayload(...)` is a new instance and gets its own entry.

---

## Output Format

```json
{
  "$flows": {
    "flow_1": [
      {
        "$g_a3f9x1": 1,
        "$type": "request",
        "method": "DELETE",
        "url": "/users/42"
      }
    ]
  }
}
```

Each flow is an array of action definitions — supporting sequential and parallel execution as ordered steps.
