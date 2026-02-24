# @batono/core

> The protocol engine behind Batono — server-driven UI interactions for the web.

[![npm version](https://badge.fury.io/js/%40batono%2Fcore.svg)](https://www.npmjs.com/package/@batono/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![codecov](https://codecov.io/gh/batono-js/core/branch/main/graph/badge.svg)](https://codecov.io/gh/batono-js/core)

`@batono/core` is the foundation of the Batono protocol. It provides the `InteractionGraph` — a self-contained,
serializable description of UI interactions. The backend defines structure and behavior. The frontend renders and executes — nothing more.

---

## Features

- ✅ No dependencies
- ✅ Backend-driven action definitions
- ✅ Automatic action gathering — no manual registration
- ✅ Graph instance tokens (`$graph`) for response consistency
- ✅ Sequential and parallel action flows out of the box
- ✅ Partial re-rendering via scopes
- ✅ Fully typed with TypeScript

---

## Installation

```bash
npm install @batono/core
```

---

## Basic Usage

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

res.json(graph)
```

---

## Documentation

| Topic                                           | Description                                                            |
|-------------------------------------------------|------------------------------------------------------------------------|
| [actions.md](docs/actions.md)                   | `defineAction`, `sequential`, `parallel`, `withPayload`                |
| [graph.md](docs/graph.md)                       | `InteractionGraph`, output format, token generation                    |
| [create-buildable.md](docs/create-buildable.md) | `createBuildable`, schema builder `s`, custom definitions              |
| [when.md](docs/when.md)                         | Conditional values with `when`, `.else()`, `.elseif()`                 |
| [scope.md](docs/scope.md)                       | Partial re-rendering with `createScope`, `ScopedBuildable`, `scopable` |

---

## Design Goals

- **Protocol over implementation** — `@batono/core` defines the contract, not the UI
- **Actions are first-class** — defined once, referenced anywhere, gathered automatically
- **No magic** — everything is explicit, serializable, and predictable
- **Extensible** — build custom `IBuildable` implementations on top of the core primitives
- **Package-boundary safe** — internal symbols prevent accidental misuse across package boundaries
- **Stateless by design** — no server-side UI state required
- 
---

## License

MIT
