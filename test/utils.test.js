import {describe, test} from 'node:test'
import assert from 'node:assert/strict'
import {typeOfForErrorMessage} from "../dist/utils/create-buildable/validateField.js";
import {bt, createBuildable, s} from "../dist/index.js";
import {when} from "../dist/utils/condition-when/when.js";
import {resolveBuildable, resolveBuildableArray} from "../dist/utils/create-buildable/utils.js";

describe('utils — typeOfForErrorMessage', () => {

  test('returns "null" for null', () => {
    assert.equal(typeOfForErrorMessage(null), 'null')
  })

  test('returns "undefined" for undefined', () => {
    assert.equal(typeOfForErrorMessage(undefined), 'undefined')
  })

  test('returns typeof for other values', () => {
    assert.equal(typeOfForErrorMessage('foo'), 'string')
    assert.equal(typeOfForErrorMessage(42), 'number')
    assert.equal(typeOfForErrorMessage(true), 'boolean')
    assert.equal(typeOfForErrorMessage({}), 'object')
  })
})

describe('utils — resolveBuildable', () => {

  const Item = createBuildable('item', {label: s.string()})

  test('returns built Defined for a valid IBuildable', () => {
    const graph = bt.graph(Item({label: 'foo'}))
    const result = resolveBuildable(Item({label: 'foo'}), graph)
    assert.equal(result.$type, 'item')
  })

  test('returns undefined for null', () => {
    const graph = bt.graph(Item({label: 'foo'}))
    assert.equal(resolveBuildable(null, graph), undefined)
  })

  test('returns undefined for undefined', () => {
    const graph = bt.graph(Item({label: 'foo'}))
    assert.equal(resolveBuildable(undefined, graph), undefined)
  })

  test('returns undefined for a plain string', () => {
    const graph = bt.graph(Item({label: 'foo'}))
    assert.equal(resolveBuildable('not-a-buildable', graph), undefined)
  })

  test('resolves When(true) wrapping a buildable', () => {
    const graph = bt.graph(Item({label: 'foo'}))
    const result = resolveBuildable(when(true, Item({label: 'bar'})), graph)
    assert.equal(result.$type, 'item')
  })

  test('returns undefined for When(false) wrapping a buildable', () => {
    const graph = bt.graph(Item({label: 'foo'}))
    const result = resolveBuildable(when(false, Item({label: 'bar'})), graph)
    assert.equal(result, undefined)
  })

})

describe('utils — resolveBuildableArray', () => {

  const Item = createBuildable('item', {label: s.string()})

  test('builds all valid buildables in array', () => {
    const graph = bt.graph(Item({label: 'foo'}))
    const result = resolveBuildableArray([Item({label: 'A'}), Item({label: 'B'})], graph)
    assert.equal(result.length, 2)
    assert.equal(result[0].$type, 'item')
    assert.equal(result[1].$type, 'item')
  })

  test('filters out null values', () => {
    const graph = bt.graph(Item({label: 'foo'}))
    const result = resolveBuildableArray([null, Item({label: 'A'})], graph)
    assert.equal(result.length, 1)
  })

  test('filters out undefined values', () => {
    const graph = bt.graph(Item({label: 'foo'}))
    const result = resolveBuildableArray([undefined, Item({label: 'A'})], graph)
    assert.equal(result.length, 1)
  })

  test('filters out plain primitives', () => {
    const graph = bt.graph(Item({label: 'foo'}))
    const result = resolveBuildableArray(['string', 42, Item({label: 'A'})], graph)
    assert.equal(result.length, 1)
  })

  test('resolves When(true) entries', () => {
    const graph = bt.graph(Item({label: 'foo'}))
    const result = resolveBuildableArray([
      when(true, Item({label: 'A'})),
      Item({label: 'B'})
    ], graph)
    assert.equal(result.length, 2)
  })

  test('filters out When(false) entries', () => {
    const graph = bt.graph(Item({label: 'foo'}))
    const result = resolveBuildableArray([
      when(false, Item({label: 'A'})),
      Item({label: 'B'})
    ], graph)
    assert.equal(result.length, 1)
    assert.equal(result[0].$type, 'item')
  })

  test('returns empty array for empty input', () => {
    const graph = bt.graph(Item({label: 'foo'}))
    const result = resolveBuildableArray([], graph)
    assert.deepEqual(result, [])
  })

  test('returns empty array when all items are filtered out', () => {
    const graph = bt.graph(Item({label: 'foo'}))
    const result = resolveBuildableArray([null, undefined, when(false, Item({label: 'A'}))], graph)
    assert.deepEqual(result, [])
  })

})
