import {bt, createBuildable, s} from "../dist/index.js";
import {describe, test} from 'node:test'
import assert from 'node:assert/strict'

describe('createBuildable — s.record', () => {

  const Item = createBuildable('item', {
    meta: s.record(s.string())
  })

  test('accepts record of strings', () => {
    const json = JSON.parse(JSON.stringify(bt.graph(Item({meta: {foo: 'bar', baz: 'qux'}}))))
    assert.deepEqual(json.$layout.meta, {foo: 'bar', baz: 'qux'})
  })

  test('accepts empty record', () => {
    const json = JSON.parse(JSON.stringify(bt.graph(Item({meta: {}}))))
    assert.deepEqual(json.$layout.meta, {})
  })

  test('throws when record field receives non-object', () => {
    assert.throws(
      () => Item({meta: 'not-an-object'}),
      /expected record, got string/
    )
  })

  test('throws when record field receives array', () => {
    assert.throws(
      () => Item({meta: []}),
      /expected record, got object/
    )
  })

  test('throws when record value has wrong type', () => {
    assert.throws(
      () => Item({meta: {foo: 42}}),
      /expected string, got number/
    )
  })

  test('accepts record of numbers', () => {
    const WithNumbers = createBuildable('item', {
      counts: s.record(s.number())
    })
    const json = JSON.parse(JSON.stringify(bt.graph(WithNumbers({counts: {views: 42, clicks: 7}}))))
    assert.deepEqual(json.$layout.counts, {views: 42, clicks: 7})
  })

  test('accepts record of buildables', () => {
    const Inner = createBuildable('inner', {label: s.string()})
    const Outer = createBuildable('outer', {
      items: s.record(s.buildable())
    })

    const json = JSON.parse(JSON.stringify(bt.graph(Outer({
      items: {
        a: Inner({label: 'A'}),
        b: Inner({label: 'B'})
      }
    }))))

    assert.equal(json.$layout.items.a.$type, 'inner')
    assert.equal(json.$layout.items.a.label, 'A')
    assert.equal(json.$layout.items.b.label, 'B')
  })

  test('builds record field with mixed buildable and primitive values', () => {
    const Inner = createBuildable('inner', {label: s.string()})
    const Outer = createBuildable('outer', {
      meta: s.record(s.string())
    })

    const json = JSON.parse(JSON.stringify(bt.graph(Outer({
      meta: {
        title: 'plain string',
      }
    }))))

    assert.equal(json.$layout.meta.title, 'plain string')
  })

  test('builds record field with mixed buildable and primitive values', () => {
    const Inner = createBuildable('inner', {label: s.string()})
    const Outer = createBuildable('outer', {
      meta: s.record(s.union(s.string(), s.buildable()))
    })

    const json = JSON.parse(JSON.stringify(bt.graph(Outer({
      meta: {
        title: 'plain string',
        content: Inner({label: 'bar'})
      }
    }))))

    assert.equal(json.$layout.meta.title, 'plain string')
    assert.equal(json.$layout.meta.content.$type, 'inner')
  })
})
