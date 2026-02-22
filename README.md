# @batono/core

> The protocol engine behind Batono — server-driven UI interactions for the web.

[![npm version](https://badge.fury.io/js/%40batono%2Fcore.svg)](https://www.npmjs.com/package/@batono/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![codecov](https://codecov.io/gh/batono-js/core/branch/main/graph/badge.svg)](https://codecov.io/gh/batono-js/core)

`@batono/core` is the foundation of the Batono protocol. It provides the `InteractionGraph` — a self-contained,
serializable description of UI interactions. The backend defines what happens, the frontend just renders and executes.

---

## Features

- ✅ No dependencies
- ✅ Backend-driven action definitions
- ✅ Automatic action gathering — no manual registration
- ✅ Graph instance tokens (`$graph`) for response consistency
- ✅ Sequential and parallel action flows out of the box
- ✅ Fully typed with TypeScript

---

## Installation

```bash
npm install @batono/core
```

---

## Basic Usage

Define an `InteractionGraph` with actions on the backend, serialize it, send it to the frontend.

```ts
import {bt} from '@batono/core'
import {bt as btUi} from '@batono/ui'

const deleteUser = bt.defineAction(
  btUi.request('DELETE', '/users/42')
)

const graph = bt.graph(
  btUi.rows(
    btUi.row(
      btUi.action('Delete User', deleteUser, {variant: 'ghost'})
    )
  )
)

// Serialize and send as JSON response
res.json(graph)
```

The serialized output contains a unique `$graph` token, a `$schema` identifier, the layout tree, and all referenced
actions — automatically gathered during the build.

---

## Action Flows

### Sequential

Actions execute one after another. Each step waits for the previous to complete.

```ts
const confirmAndDelete = bt.defineAction(
  bt.sequential(
    btUi.modal('Are you sure?'),
    btUi.request('DELETE', '/users/42')
  )
)
```

### Parallel

Actions execute simultaneously.

```ts
const notify = bt.defineAction(
  bt.parallel(
    btUi.request('POST', '/notifications'),
    btUi.request('POST', '/audit-log')
  )
)
```

### Nested Flows

Sequential and parallel flows can be arbitrarily nested.

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

## Reusable Actions with Payload

Define an action once, use it in multiple places with different payloads.
> `withPayload()` is immutable and returns a new action instance.

```ts
const bookUnit = (id: number) => bt.defineAction(
  btUi.request('POST', '/bookings').withPayload({id})
)

btUi.action('Book Unit A', bookUnit(1))
btUi.action('Book Unit B', bookUnit(2))
```

Or use `withPayload` for a shared payload across all definitions:

```ts
const action = bt.defineAction(
  btUi.request('POST', '/bookings'),
  btUi.request('POST', '/notifications')
)

action.withPayload({id: 42}) // returns new instance, does not mutate
```

---

## `createBuildable`

For simple custom definitions, Batono provides `createBuildable`.

It allows you to define lightweight, fully typed `IBuildable` elements without writing a full class. This is intended for **application-level extensions**, not for complex framework integrations.

```ts
import {createBuildable, optional, arrayOf, buildable} from '@batono/core'

const Stat = createBuildable('stat', {
  name: String,
  value: Number,
  variant: optional('default')
})
```

Usage:

```ts
bt.graph(
  Stat({name: 'Active Users', value: 42})
)
```

### Schema Types

| Type | Usage |
|---|---|
| `String` | Required string field |
| `Number` | Required number field |
| `Boolean` | Required boolean field |
| `optional(defaultValue?)` | Optional field with optional default |
| `arrayOf(type)` | Array of a schema type |
| `buildable()` | Nested `IBuildable` instance |

### Optional Fields

Optional fields can define a default value:

```ts
variant: optional('primary')
```

If omitted, the default is used.
If explicitly set to `null`, the value remains `null`.

Optional fields without a default accept any value:

```ts
extra: optional()
```

### Arrays

Use `arrayOf` for array fields:

```ts
const List = createBuildable('list', {
  title: String,
  tags: arrayOf(String)
})

List({title: 'My List', tags: ['a', 'b', 'c']})
```

### Nested Buildables

Use `buildable()` to accept any `IBuildable` as a field value. The nested buildable is automatically built when the parent is serialized:

```ts
const Card = createBuildable('card', {
  title: String,
  content: buildable()
})

Card({
  title: 'My Card',
  content: Stat({name: 'Users', value: 42})
})
```

### Immutability

Modifier methods return a new instance and never mutate the original:

```ts
const a = Stat({name: 'Users', value: 10})
const b = a.withVariant('accent')

// a remains unchanged
```

Custom modifiers via the third argument:

```ts
const Stat = createBuildable('stat', {
  name: String,
  value: Number,
  variant: optional('default')
}, {
  variant: (variant: string) => ({variant})
})

Stat({name: 'Users', value: 10}).withVariant('accent')
```

### When to Use It

`createBuildable` is ideal for:

* Simple custom UI elements
* Project-specific definitions
* Quick extensions without boilerplate

For advanced behavior (custom logic, computed fields, dynamic structures), implement `IBuildable` manually.

---

## Output Format

> `$schema` identifies the protocol version.
> `$graph` identifies the concrete graph instance.

```json
{
  "$schema": "batono.interaction-graph.v1",
  "$graph": "a3f9x1b2",
  "layout": {
    "$schema": "batono.interaction-graph.v1",
    "$graph": "a3f9x1b2",
    "type": "rows",
    "items": [
      ...
    ]
  },
  "actions": {
    "action_1": [
      {
        "$schema": "batono.interaction-graph.v1",
        "$graph": "a3f9x1b2",
        "type": "request",
        "method": "DELETE",
        "url": "/users/42"
      }
    ]
  }
}
```

The `$graph` token is unique per response. Every node in the graph carries the same token — the frontend renderer can
use it to validate that all nodes belong to the same response.

---

## Design Goals

- **Protocol over implementation** — `@batono/core` defines the contract, not the UI
- **Actions are first-class** — defined once, referenced anywhere, gathered automatically
- **No magic** — everything is explicit, serializable, and predictable
- **Extensible** — build custom `IBuildable` implementations on top of the core primitives
- **Package-boundary safe** — internal symbols prevent accidental misuse across package boundaries

---

## License

MIT
