import {bt, createBuildable, s} from "../dist/index.js";
import {describe, test} from 'node:test'
import assert from 'node:assert/strict'

describe('createBuildable — s.object', () => {

  const Item = createBuildable('item', {
    meta: s.object({
      createdAt: s.string(),
      updatedAt: s.string(),
    })
  })

  test('builds with object field', () => {
    const json = JSON.parse(JSON.stringify(bt.graph(Item({
      meta: {createdAt: '2026-02-24', updatedAt: '2026-02-24'}
    }))))
    assert.equal(json.layout.meta.createdAt, '2026-02-24')
    assert.equal(json.layout.meta.updatedAt, '2026-02-24')
  })

  test('throws when object field receives non-object', () => {
    assert.throws(
      () => Item({meta: 'not-an-object'}),
      /expected object, got string/
    )
  })

  test('throws when object field receives array', () => {
    assert.throws(
      () => Item({meta: []}),
      /expected object, got object/
    )
  })

  test('throws when nested required field is missing', () => {
    assert.throws(
      () => Item({meta: {createdAt: '2026-02-24'}}),
      /field "meta.updatedAt" is required/
    )
  })

  test('throws when nested field has wrong type', () => {
    assert.throws(
      () => Item({meta: {createdAt: 42, updatedAt: '2026-02-24'}}),
      /field "meta.createdAt" expected string, got number/
    )
  })

  test('accepts optional nested field when omitted', () => {
    const WithOptional = createBuildable('item', {
      meta: s.object({
        createdAt: s.string(),
        tags: s.string().many().optional()
      })
    })

    const json = JSON.parse(JSON.stringify(bt.graph(WithOptional({
      meta: {createdAt: '2026-02-24'}
    }))))
    assert.equal(json.layout.meta.createdAt, '2026-02-24')
    assert.equal(json.layout.meta.tags, undefined)
  })

  test('validates nested array field', () => {
    const WithArray = createBuildable('item', {
      meta: s.object({
        tags: s.string().many()
      })
    })

    const json = JSON.parse(JSON.stringify(bt.graph(WithArray({
      meta: {tags: ['a', 'b', 'c']}
    }))))
    assert.deepEqual(json.layout.meta.tags, ['a', 'b', 'c'])
  })

})

describe('createBuildable — s.any', () => {

  const Item = createBuildable('item', {
    name: s.string(),
    extra: s.any()
  })

  test('accepts string for any field', () => {
    const json = JSON.parse(JSON.stringify(bt.graph(Item({name: 'test', extra: 'foo'}))))
    assert.equal(json.layout.extra, 'foo')
  })

  test('accepts number for any field', () => {
    const json = JSON.parse(JSON.stringify(bt.graph(Item({name: 'test', extra: 42}))))
    assert.equal(json.layout.extra, 42)
  })

  test('accepts object for any field', () => {
    const json = JSON.parse(JSON.stringify(bt.graph(Item({name: 'test', extra: {foo: 'bar'}}))))
    assert.deepEqual(json.layout.extra, {foo: 'bar'})
  })

  test('accepts array for any field', () => {
    const json = JSON.parse(JSON.stringify(bt.graph(Item({name: 'test', extra: [1, 2, 3]}))))
    assert.deepEqual(json.layout.extra, [1, 2, 3])
  })

  test('accepts null for any field', () => {
    const json = JSON.parse(JSON.stringify(bt.graph(Item({name: 'test', extra: null}))))
    assert.equal(json.layout.extra, null)
  })

  test('throws when any field is missing', () => {
    assert.throws(
      () => Item({name: 'test'}),
      /is required/
    )
  })

  test('accepts any field as optional', () => {
    const Flexible = createBuildable('flexible', {
      name: s.string(),
      extra: s.any().optional()
    })

    const json = JSON.parse(JSON.stringify(bt.graph(Flexible({name: 'test'}))))
    assert.equal(json.layout.extra, undefined)
  })

})
