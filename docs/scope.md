# Scope

Scopes enable **partial re-rendering** — the client can replace a specific subtree without reloading the full graph.

---

## Concepts

| Concept           | Role                                                        |
|-------------------|-------------------------------------------------------------|
| `Scope`           | Token carrier — identifies a replaceable region             |
| `ScopedBuildable` | Wraps an `IBuildable` and marks its output with `$node`     |
| `scopable()`      | Factory wrapper that adds `.scope()` to buildable instances |

---

## Basic Usage

```ts
import {bt} from '@batono/core'

const tableScope = bt.createScope()

const graph = bt.graph(
  bt.scope(table, tableScope)
)
```

The serialized output:

```json
{
  "type": "table",
  "$node": [
    "s_1"
  ]
}
```

When the client triggers an action with `replace: tableScope`, the server returns a new graph. The client replaces all
nodes with `$node: "s_1"` in the DOM.

---

## `createScope()`

```ts
const scope = bt.createScope()
```

Creates a new `Scope` instance. The token is generated lazily — on the first build call, `ig.nextToken('n')` is called
and the result is cached. The same `Scope` instance used on multiple nodes will always produce the same token.

---

## `bt.scope(buildable, scope)`

```ts
bt.scope(table, tableScope)
```

Wraps a buildable with a `ScopedBuildable` that adds `$node` to the serialized output. Does not mutate the original
buildable.

---

## `scopable(factory)`

For buildables that are frequently scoped, `scopable()` adds `.scope()` directly to the instance:

```ts
import {scopable, createBuildable, s} from '@batono/core'

const Table = scopable(createBuildable('table', {
  title: s.string()
}))

const tableScope = bt.createScope()

Table({title: 'Bookings'}).scope(tableScope)
```

Without `scopable`:

```ts
bt.scope(Table({title: 'Bookings'}), tableScope)
```

---

## Multiple Scopes

A single node can belong to multiple scopes — `.scope()` is chainable:

```ts
Table({title: 'Bookings'})
  .scope(tableScope)
  .scope(sectionScope)
```

Serialized output:

```json
{
  "type": "table",
  "$node": [
    "s_1",
    "s_2"
  ]
}
```

An action with `replace: tableScope` replaces all nodes with `"s_1"` in their `$node` array.

---

## Same Scope on Multiple Nodes

The same `Scope` instance can mark multiple nodes — all are replaced together:

```ts
const scope = bt.createScope()

bt.graph(
  bt.rows(
    bt.row(bt.scope(header, scope)),
    bt.row(bt.scope(table, scope))
  )
)
```

Both `header` and `table` will have the same `$node` token. A replace action targeting this scope will replace both.

---

## Token Generation

Tokens are generated per `InteractionGraph` using an internal counter — `s_1`, `s_2`, `s_3`. They are unique within a
graph. The `$graph` token separates graphs from different responses.

---

## Using Scope in `createBuildable`

```ts
import {createBuildable, s} from '@batono/core'

const Button = createBuildable('button', {
  label: s.string(),
  replace: s.scope()
})

Button({
  label: 'Reload',
  replace: tableScope
})
```

Serialized:

```json
{
  "type": "button",
  "label": "Reload",
  "replace": {
    "type": "scope",
    "token": "s_1"
  }
}
```
