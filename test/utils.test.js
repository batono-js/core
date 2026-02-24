import {describe, test} from 'node:test'
import assert from 'node:assert/strict'
import {typeOfForErrorMessage} from "../dist/utils/create-buildable/validateField.js";

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
