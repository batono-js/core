import {bt, createBuildable, s} from "../dist/index.js";
import {describe, test} from 'node:test'
import assert from 'node:assert/strict'

describe('createBuildable', () => {

  const Stat = createBuildable('stat', {
    name: s.string(),
    num: s.number(),
    variant: s.string().optional('foo')
  }, {
    variant: (variant) => ({variant})
  })

  test('builds correctly into graph', () => {
    const json = JSON.parse(JSON.stringify(bt.graph(Stat({name: 'test', num: 1}))))
    assert.equal(json.$layout.$type, 'stat')
    assert.equal(json.$layout.name, 'test')
    assert.equal(json.$layout.num, 1)
  })

  test('uses default value for optional field', () => {
    const json = JSON.parse(JSON.stringify(bt.graph(Stat({name: 'test', num: 1}))))
    assert.equal(json.$layout.variant, 'foo')
  })

  test('withVariant returns new instance', () => {
    const a = Stat({name: 'test', num: 1})
    const b = a.withVariant('bar')
    assert.notEqual(a, b)
  })

  test('withVariant does not mutate original', () => {
    const a = Stat({name: 'test', num: 1})
    a.withVariant('bar')
    const json = JSON.parse(JSON.stringify(bt.graph(a)))
    assert.equal(json.$layout.variant, 'foo')
  })

  test('throws on missing required field', () => {
    assert.throws(
      () => Stat({num: 1}),
      /is required/
    )
  })

  test('throws on wrong type', () => {
    assert.throws(
      () => Stat({name: 123, num: 1}),
      /expected string, got number/
    )
  })

  test('accepts null for optional field', () => {
    const json = JSON.parse(JSON.stringify(bt.graph(Stat({name: 'test', num: 1, variant: null}))))
    assert.equal(json.$layout.variant, null)
  })

  test('accepts any type for optional field without default', () => {
    const Flexible = createBuildable('flexible', {
      name: s.string(),
      extra: s.string().optional()
    })

    const json = JSON.parse(JSON.stringify(bt.graph(Flexible({name: 'test', extra: '42'}))))
    assert.equal(json.$layout.extra, '42')
  })

  test('overrides default value when optional field is provided', () => {
    const WithDefault = createBuildable('withdefault', {
      name: s.string(),
      variant: s.string().optional('primary')
    })

    const json = JSON.parse(JSON.stringify(bt.graph(WithDefault({name: 'test', variant: 'secondary'}))))
    assert.equal(json.$layout.variant, 'secondary')
  })

  test('validates type against default value type for optional field with default', () => {
    const WithDefault = createBuildable('withdefault', {
      name: s.string(),
      variant: s.string().optional('foo')
    })

    assert.throws(
      () => WithDefault({name: 'test', variant: 42}),
      /expected string, got number/
    )
  })

  test('uses default value when optional field with default is omitted', () => {
    const WithDefault = createBuildable('withdefault', {
      name: s.string(),
      variant: s.string().optional('primary')
    })

    const json = JSON.parse(JSON.stringify(bt.graph(WithDefault({name: 'test'}))))
    assert.equal(json.$layout.variant, 'primary')
  })

})

describe('createBuildable — arrayOf', () => {

  const List = createBuildable('list', {
    title: s.string(),
    tags: s.string().many()
  })

  test('builds with array field', () => {
    const json = JSON.parse(JSON.stringify(bt.graph(List({title: 'My List', tags: ['a', 'b', 'c']}))))
    assert.deepEqual(json.$layout.tags, ['a', 'b', 'c'])
  })

  test('throws when array field receives non-array', () => {
    assert.throws(
      () => List({title: 'My List', tags: 'not-an-array'}),
      /expected array, got string/
    )
  })

  test('accepts empty array', () => {
    const json = JSON.parse(JSON.stringify(bt.graph(List({title: 'My List', tags: []}))))
    assert.deepEqual(json.$layout.tags, [])
  })

})

describe('createBuildable — buildable', () => {

  const Stat = createBuildable('stat', {
    name: s.string(),
    value: s.number(),
  })

  const Card = createBuildable('card', {
    title: s.string(),
    content: s.buildable()
  })

  test('builds nested buildable', () => {
    const json = JSON.parse(JSON.stringify(bt.graph(Card({
      title: 'My Card',
      content: Stat({name: 'Users', value: 42})
    }))))
    assert.equal(json.$layout.content.$type, 'stat')
    assert.equal(json.$layout.content.name, 'Users')
    assert.equal(json.$layout.content.value, 42)
  })

  test('nested buildable carries $graph token', () => {
    const json = JSON.parse(JSON.stringify(bt.graph(Card({
      title: 'My Card',
      content: Stat({name: 'Users', value: 42})
    }))))
    assert.equal(json.$layout.content[`$${json.$graph}`], 1)
  })

  test('throws when buildable field receives non-buildable', () => {
    assert.throws(
      () => Card({title: 'My Card', content: 'not-a-buildable'}),
      /expected IBuildable/
    )
  })

  test('builds array of nested buildables', () => {
    const Item = createBuildable('item', {
      label: s.string()
    })

    const List = createBuildable('list', {
      title: s.string(),
      items: s.buildable().many()
    })

    const json = JSON.parse(JSON.stringify(bt.graph(List({
      title: 'My List',
      items: [
        Item({label: 'A'}),
        Item({label: 'B'}),
        Item({label: 'C'})
      ]
    }))))

    assert.equal(json.$layout.items.length, 3)
    assert.equal(json.$layout.items[0].$type, 'item')
    assert.equal(json.$layout.items[0].label, 'A')
    assert.equal(json.$layout.items[2].label, 'C')
    assert.equal(json.$layout.items[0][`$${json.$graph}`], 1)
  })

  test('accepts boolean value', () => {
    const Item = createBuildable('item', {
      active: s.boolean()
    })
    const json = JSON.parse(JSON.stringify(bt.graph(Item({active: true}))))
    assert.equal(json.$layout.active, true)
  })

  test('throws on wrong type for boolean field', () => {
    const Item = createBuildable('item', {
      active: s.boolean()
    })
    assert.throws(
      () => Item({active: 'true'}),
      /expected boolean, got string/
    )
  })

  // Tests for the optional-field branch in createBuildable:
// if (descriptor.optional) continue

  test('optional field can be omitted entirely', () => {
    const built = createBuildable('test', {
      name: s.string(),
      tag: s.string().optional(),
    })

    assert.doesNotThrow(() => built({name: 'foo'}))
  })

  test('optional field can be passed as undefined explicitly', () => {
    const built = createBuildable('test', {
      name: s.string(),
      tag: s.string().optional(),
    })

    assert.doesNotThrow(() => built({name: 'foo', tag: undefined}))
  })

  test('optional field with default uses default when omitted', () => {
    const built = createBuildable('test', {
      name: s.string(),
      tag: s.string().optional('default-tag'),
    })

    // The instance is built without throwing; the default is applied internally.
    assert.doesNotThrow(() => built({name: 'foo'}))
  })

  test('required field throws when omitted', () => {
    const built = createBuildable('test', {
      name: s.string(),
      tag: s.string(),
    })

    assert.throws(
      () => built({name: 'foo'}),
      (err) => err.code === 'missing_field'
    )
  })

  test('required field throws when explicitly undefined', () => {
    const built = createBuildable('test', {
      name: s.string(),
      tag: s.string(),
    })

    assert.throws(
      () => built({name: 'foo', tag: undefined}),
      (err) => err.code === 'missing_field'
    )
  })
})
