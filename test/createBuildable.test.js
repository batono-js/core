import {arrayOf, buildable, createBuildable, optional} from "../dist/utils/createBuildable.js";
import {describe, test} from 'node:test'
import assert from 'node:assert/strict'
import {bt} from '../dist/index.js'

describe('createBuildable', () => {

  const Stat = createBuildable('stat', {
    name: String,
    num: Number,
    variant: optional('foo')
  }, {
    variant: (variant) => ({variant})
  })

  test('builds correctly into graph', () => {
    const json = JSON.parse(JSON.stringify(bt.graph(Stat({name: 'test', num: 1}))))
    assert.equal(json.layout.type, 'stat')
    assert.equal(json.layout.name, 'test')
    assert.equal(json.layout.num, 1)
  })

  test('uses default value for optional field', () => {
    const json = JSON.parse(JSON.stringify(bt.graph(Stat({name: 'test', num: 1}))))
    assert.equal(json.layout.variant, 'foo')
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
    assert.equal(json.layout.variant, 'foo')
  })

  test('throws on missing required field', () => {
    assert.throws(
      () => Stat({num: 1}),
      /missing required field "name"/
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
    assert.equal(json.layout.variant, null)
  })

  test('accepts any type for optional field without default', () => {
    const Flexible = createBuildable('flexible', {
      name: String,
      extra: optional()
    })

    const json = JSON.parse(JSON.stringify(bt.graph(Flexible({name: 'test', extra: '42'}))))
    assert.equal(json.layout.extra, '42')
  })

  test('overrides default value when optional field is provided', () => {
    const WithDefault = createBuildable('withdefault', {
      name: String,
      variant: optional('primary')
    })

    const json = JSON.parse(JSON.stringify(bt.graph(WithDefault({name: 'test', variant: 'secondary'}))))
    assert.equal(json.layout.variant, 'secondary')
  })
})

describe('createBuildable — arrayOf', () => {

  const List = createBuildable('list', {
    title: String,
    tags: arrayOf(String)
  })

  test('builds with array field', () => {
    const json = JSON.parse(JSON.stringify(bt.graph(List({title: 'My List', tags: ['a', 'b', 'c']}))))
    assert.deepEqual(json.layout.tags, ['a', 'b', 'c'])
  })

  test('throws when array field receives non-array', () => {
    assert.throws(
      () => List({title: 'My List', tags: 'not-an-array'}),
      /expected array, got string/
    )
  })

  test('accepts empty array', () => {
    const json = JSON.parse(JSON.stringify(bt.graph(List({title: 'My List', tags: []}))))
    assert.deepEqual(json.layout.tags, [])
  })

})

describe('createBuildable — buildable', () => {

  const Stat = createBuildable('stat', {
    name: String,
    value: Number,
  })

  const Card = createBuildable('card', {
    title: String,
    content: buildable()
  })

  test('builds nested buildable', () => {
    const json = JSON.parse(JSON.stringify(bt.graph(Card({
      title: 'My Card',
      content: Stat({name: 'Users', value: 42})
    }))))
    assert.equal(json.layout.content.type, 'stat')
    assert.equal(json.layout.content.name, 'Users')
    assert.equal(json.layout.content.value, 42)
  })

  test('nested buildable carries $graph token', () => {
    const json = JSON.parse(JSON.stringify(bt.graph(Card({
      title: 'My Card',
      content: Stat({name: 'Users', value: 42})
    }))))
    assert.equal(json.layout.content.$graph, json.$graph)
  })

  test('throws when buildable field receives non-buildable', () => {
    assert.throws(
      () => Card({title: 'My Card', content: 'not-a-buildable'}),
      /expected IBuildable/
    )
  })

  test('builds array of nested buildables', () => {
    const Item = createBuildable('item', {
      label: String
    })

    const List = createBuildable('list', {
      title: String,
      items: arrayOf(buildable())
    })

    const json = JSON.parse(JSON.stringify(bt.graph(List({
      title: 'My List',
      items: [
        Item({label: 'A'}),
        Item({label: 'B'}),
        Item({label: 'C'})
      ]
    }))))

    assert.equal(json.layout.items.length, 3)
    assert.equal(json.layout.items[0].type, 'item')
    assert.equal(json.layout.items[0].label, 'A')
    assert.equal(json.layout.items[2].label, 'C')
    assert.equal(json.layout.items[0].$graph, json.$graph)
  })
})
