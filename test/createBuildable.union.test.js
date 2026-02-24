import {bt, createBuildable, s} from "../dist/index.js";
import {describe, test} from 'node:test'
import assert from 'node:assert/strict'

describe('createBuildable — s.union', () => {

  test('throws when union has no types', () => {
    assert.throws(
      () => s.union(),
      /must have at least one type/
    )
  })

  test('accepts string in string | number union', () => {
    const Item = createBuildable('item', {
      value: s.union(s.string(), s.number())
    })
    const json = JSON.parse(JSON.stringify(bt.graph(Item({value: 'hello'}))))
    assert.equal(json.layout.value, 'hello')
  })

  test('accepts number in string | number union', () => {
    const Item = createBuildable('item', {
      value: s.union(s.string(), s.number())
    })
    const json = JSON.parse(JSON.stringify(bt.graph(Item({value: 42}))))
    assert.equal(json.layout.value, 42)
  })

  test('throws when value does not match any union type', () => {
    const Item = createBuildable('item', {
      value: s.union(s.string(), s.number())
    })
    assert.throws(
      () => Item({value: true}),
      /does not match any union type/
    )
  })

  test('accepts buildable in union', () => {
    const Inner = createBuildable('inner', {label: s.string()})
    const Item = createBuildable('item', {
      value: s.union(s.string(), s.buildable())
    })
    const json = JSON.parse(JSON.stringify(bt.graph(Item({value: Inner({label: 'foo'})}))))
    assert.equal(json.layout.value.type, 'inner')
  })

})

describe('createBuildable — nullable', () => {

  test('accepts null for nullable field', () => {
    const Item = createBuildable('item', {
      value: s.string().nullable()
    })
    const json = JSON.parse(JSON.stringify(bt.graph(Item({value: null}))))
    assert.equal(json.layout.value, null)
  })

  test('accepts value for nullable field', () => {
    const Item = createBuildable('item', {
      value: s.string().nullable()
    })
    const json = JSON.parse(JSON.stringify(bt.graph(Item({value: 'hello'}))))
    assert.equal(json.layout.value, 'hello')
  })

  test('throws on wrong type for nullable field when value is not null', () => {
    const Item = createBuildable('item', {
      value: s.string().nullable()
    })
    assert.throws(
      () => Item({value: 42}),
      /expected string, got number/
    )
  })

})

describe('createBuildable — buildable many branch', () => {

  test('builds array of buildables via s.buildable().many()', () => {
    const Inner = createBuildable('inner', {label: s.string()})
    const Outer = createBuildable('outer', {
      items: s.buildable().many()
    })

    const json = JSON.parse(JSON.stringify(bt.graph(Outer({
      items: [Inner({label: 'A'}), Inner({label: 'B'})]
    }))))

    assert.equal(json.layout.items[0].type, 'inner')
    assert.equal(json.layout.items[0].label, 'A')
    assert.equal(json.layout.items[1].label, 'B')
    assert.equal(json.layout.items[0].$graph, json.$graph)
  })

  test('mixed array — buildables and primitives', () => {
    const Inner = createBuildable('inner', {label: s.string()})
    const Outer = createBuildable('outer', {
      items: s.union(s.string(), s.buildable()).many()
    })

    const json = bt.graph(Outer({
      items: ['plain', Inner({label: 'B'})]
    })).toJSON()

    assert.equal(json.layout.items[0], 'plain')
    assert.equal(json.layout.items[1].type, 'inner')
  })

})


describe('createBuildable — union containsBuildable', () => {

  test('builds buildable inside union', () => {
    const Inner = createBuildable('inner', {label: s.string()})
    const Item = createBuildable('item', {
      value: s.union(s.string(), s.buildable())
    })

    const json = JSON.parse(JSON.stringify(bt.graph(Item({
      value: Inner({label: 'foo'})
    }))))

    assert.equal(json.layout.value.type, 'inner')
    assert.equal(json.layout.value.label, 'foo')
    assert.equal(json.layout.value.$graph, json.$graph)
  })

  test('keeps primitive value in union with buildable', () => {
    const Inner = createBuildable('inner', {label: s.string()})
    const Item = createBuildable('item', {
      value: s.union(s.string(), s.buildable())
    })

    const json = JSON.parse(JSON.stringify(bt.graph(Item({
      value: 'just a string'
    }))))

    assert.equal(json.layout.value, 'just a string')
  })

  test('nested union containsBuildable propagates', () => {
    const Inner = createBuildable('inner', {label: s.string()})
    const Item = createBuildable('item', {
      value: s.union(s.number(), s.union(s.string(), s.buildable()))
    })

    const json = JSON.parse(JSON.stringify(bt.graph(Item({
      value: Inner({label: 'foo'})
    }))))

    assert.equal(json.layout.value.type, 'inner')
    assert.equal(json.layout.value.$graph, json.$graph)
  })
})
