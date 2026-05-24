# when

`when` is a conditional helper for **declarative array composition**. It allows you to include or exclude buildables from arrays without breaking out of the declarative style.

---

## The Problem

```ts
const items = []
items.push(bt.metaItem({content: 'Schüler:in'}))
if (customer.isNew) {
  items.push(bt.metaItem({content: '✓ Neukunde'}))
}
```

Imperative array building breaks the declarative flow. `when` solves this.

---

## Basic Usage

```ts
import {when} from '@batono/core'

bt.inline(
  bt.metaItem({content: 'Schüler:in'}),
  when(customer.isNew, bt.metaItem({content: '✓ Neukunde'})),
  when(customer.created, bt.metaItem({label: '📅 Erstellt', content: format(customer.created)})),
)
```

`when(condition, value)` returns the value if condition is true, `false` otherwise. Arrays in buildables automatically filter out `false`, `null` and `undefined`.

---

## Factory values

The `value` argument and the arguments to `.else()` / `.elseif()` can be a factory function. It is only called when the condition matches — useful for deferring work or keeping unrelated code out of scope:

```ts
when(customer.isNew, () => expensiveNewBadge())
  .else(() => expensiveReturningBadge())
```

The factory is never called when the branch is not taken.

---

## `.else()`

```ts
when(customer.isNew, newBadge).else(returningBadge)
// or with a factory:
when(customer.isNew, () => newBadge()).else(() => returningBadge())
```

Returns the first value if condition is true, the fallback otherwise.

---

## `.elseif()`

```ts
when(user.isNew && user.isChild, () => childItem)
  .elseif(user.isNew && user.isParent, () => parentItem)
  .else(defaultItem)
```

Chains multiple conditions — first match wins. Equivalent to `if / else if / else`.

---

## `valueOf()`

`when` returns a `When<T>` instance. For JS consumers without TypeScript, `valueOf()` retrieves the resolved value directly:

```ts
const result = when(true, 'foo')
result.valueOf() // 'foo'

const result = when(false, 'foo')
result.valueOf() // false
```

---

## Type Safety

`When<T>` is fully typed — TypeScript knows the value type:

```ts
when(true, bt.metaItem({content: 'foo'})) // When<BuildableInstance<...>>
when(false, 42)                            // When<number>
```

---

## Resolution

`When` instances are resolved automatically by `createBuildable` before validation and building. No schema changes needed — pass `when(...)` anywhere a value is expected.

`false` values are filtered from arrays automatically.
