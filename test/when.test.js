import {test} from 'node:test'
import assert from 'node:assert/strict'
import {when} from "../dist/utils/condition-when/when.js";

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
