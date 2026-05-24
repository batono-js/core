import {test} from 'node:test'
import assert from 'node:assert/strict'
import {when} from "../dist/utils/condition-when/when.js";
import {bt, createBuildable, s} from "../dist/index.js";

test('when returns value via valueOf when condition is true', () => {
  const result = when(true, 'foo')
  assert.equal(result.valueOf(), 'foo')
})

test('when returns false via valueOf when condition is false', () => {
  const result = when(false, 'foo')
  assert.equal(result.valueOf(), false)
})


test('when.else returns value when condition is true', () => {
  assert.equal(when(true, 'foo').else('bar'), 'foo')
})

test('when.else returns fallback when condition is false', () => {
  assert.equal(when(false, 'foo').else('bar'), 'bar')
})

test('when.elseif returns first match', () => {
  assert.equal(when(true, 'foo').elseif(true, 'bar').else('baz'), 'foo')
})

test('when.elseif returns second match', () => {
  assert.equal(when(false, 'foo').elseif(true, 'bar').else('baz'), 'bar')
})

test('when.elseif falls through to else', () => {
  assert.equal(when(false, 'foo').elseif(false, 'bar').else('baz'), 'baz')
})

test('when accepts factory and executes it when condition is true', () => {
  const result = when(true, () => 'computed')
  assert.equal(result.valueOf(), 'computed')
})

test('when does not execute factory when condition is false', () => {
  let called = false
  const result = when(false, () => { called = true; return 'computed' })
  assert.equal(result.valueOf(), false)
  assert.equal(called, false)
})

test('when.else accepts factory and executes it when condition is false', () => {
  assert.equal(when(false, 'foo').else(() => 'computed'), 'computed')
})

test('when.else does not execute factory when condition is true', () => {
  let called = false
  const result = when(true, 'foo').else(() => { called = true; return 'computed' })
  assert.equal(result, 'foo')
  assert.equal(called, false)
})

test('when.elseif accepts factory and executes it when condition matches', () => {
  assert.equal(when(false, 'foo').elseif(true, () => 'computed').else('baz'), 'computed')
})

test('when.elseif does not execute factory when prior condition matched', () => {
  let called = false
  const result = when(true, 'foo').elseif(true, () => { called = true; return 'computed' }).else('baz')
  assert.equal(result, 'foo')
  assert.equal(called, false)
})

test('resolveWhen resolves When instance before validation', () => {
  const List = createBuildable('list', {
    items: s.buildable().many()
  })

  const Item = createBuildable('item', {label: s.string()})
  const item = Item({label: 'foo'})

  const json = JSON.parse(JSON.stringify(bt.graph(List({
    items: [
      when(true, item),
      when(false, item)
    ]
  }))))

  assert.equal(json.$layout.items.length, 1)
  assert.equal(json.$layout.items[0].label, 'foo')
})
