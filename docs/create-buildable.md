# createBuildable

`createBuildable` is the extensibility API for consumers who want to define custom `IBuildable` elements without writing
a full class.

---

## Basic Usage

```ts
import {createBuildable, s} from '@batono/core'

const Stat = createBuildable('stat', {
  name: s.string(),
  value: s.number(),
  variant: s.string().optional('default')
})

Stat({name: 'Active Users', value: 42})
Stat({name: 'Active Users', value: 42}).withVariant('accent')
```

---

## Schema Types

| Schema                | TypeScript type      | Notes                          |
|-----------------------|----------------------|--------------------------------|
| `s.string()`          | `string`             | Required                       |
| `s.number()`          | `number`             | Required                       |
| `s.boolean()`         | `boolean`            | Required                       |
| `s.buildable()`       | `IBuildable`         | Any buildable instance         |
| `s.scope()`           | `Scope`              | A scope token                  |
| `s.union(...fields)`  | Union of field types | At least one type required     |
| `.optional(default?)` | `T \| undefined`     | Optional with optional default |
| `.nullable()`         | `T \| null`          | Accepts null                   |
| `.many()`             | `T[]`                | Array of type                  |

---

## Optional Fields

```ts
const Item = createBuildable('item', {
  name: s.string(),
  variant: s.string().optional('primary'),  // default: 'primary'
  extra: s.string().optional()              // default: undefined
})

Item({name: 'foo'})                         // variant = 'primary'
Item({name: 'foo', variant: 'accent'})      // variant = 'accent'
Item({name: 'foo', variant: null})          // variant = null
```

---

## Nullable Fields

```ts
const Item = createBuildable('item', {
  value: s.string().nullable()
})

Item({value: null})    // ✅
Item({value: 'foo'})   // ✅
Item({value: 42})      // ❌ expected string
```

---

## Arrays

```ts
const List = createBuildable('list', {
  tags: s.string().many()
})

List({tags: ['a', 'b', 'c']})
```

---

## Nested Buildables

Nested buildables are built automatically during serialization:

```ts
const Card = createBuildable('card', {
  title: s.string(),
  content: s.buildable()
})

Card({
  title: 'My Card',
  content: Stat({name: 'Users', value: 42})
})
```

---

## Union Types

```ts
const Item = createBuildable('item', {
  value: s.union(s.string(), s.number())
})

Item({value: 'hello'})  // ✅
Item({value: 42})       // ✅
Item({value: true})     // ❌ does not match any union type
```

---

## Arrays of Buildables

```ts
const List = createBuildable('list', {
  items: s.buildable().many()
})

List({
  items: [
    Stat({name: 'A', value: 1}),
    Stat({name: 'B', value: 2})
  ]
})
```

---

## Custom `with` Methods

```ts
const Stat = createBuildable('stat', {
  name: s.string(),
  value: s.number(),
  variant: s.string().optional()
}, {
  variant: (variant: string) => ({variant})
})

Stat({name: 'Users', value: 10}).withVariant('accent')
```

`with` methods are immutable — they return a new instance and never mutate the original.

---

## Scoping

Use `scopable()` to add `.scope()` directly to instances:

```ts
import {scopable} from '@batono/core'

const Table = scopable(createBuildable('table', {
  title: s.string()
}))

const tableScope = bt.createScope()

Table({title: 'Bookings'}).scope(tableScope)
```

See [scope.md](./scope.md) for details.

---

## `when` in Arrays

Use `when` for conditional array entries:

```ts
import {when} from '@batono/core'

List({
  items: [
    Stat({name: 'Total', value: 99}),
    when(user.isAdmin, Stat({name: 'Internal', value: 42})),
  ]
})
```

`false` values are filtered automatically. See [when.md](./when.md) for details.

---

## Runtime Validation

`createBuildable` validates all fields at runtime — useful for JS consumers without TypeScript:

```
createBuildable [stat]: missing required field "name"
createBuildable [stat]: field "value" expected number, got string
createBuildable [stat]: field "items" expected array, got string
createBuildable [stat]: field "content" expected IBuildable, got object
```

---

## When to Use It

`createBuildable` is ideal for:

- Simple custom UI elements
- Project-specific definitions
- Quick extensions without boilerplate

For advanced behavior — custom logic, computed fields, dynamic structures — implement `IBuildable` manually.
