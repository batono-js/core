import {createBuildable, optional} from "../dist/utils/createBuildable.js";
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

    const json = JSON.parse(JSON.stringify(bt.graph(WithDefault({ name: 'test', variant: 'secondary' }))))
    assert.equal(json.layout.variant, 'secondary')
  })
})
