import {bt, createBuildable, s} from "../dist/index.js";
import {describe, test} from 'node:test'
import assert from 'node:assert/strict'

describe('createBuildable — s.enum', () => {

  const Item = createBuildable('item', {
    variant: s.enum('primary', 'secondary', 'ghost')
  })

  test('accepts valid enum value', () => {
    const json = JSON.parse(JSON.stringify(bt.graph(Item({variant: 'primary'}))))
    assert.equal(json.layout.variant, 'primary')
  })

  test('throws on invalid enum value', () => {
    assert.throws(
      () => Item({variant: 'accent'}),
      /expected one of "primary", "secondary", "ghost"/
    )
  })

  test('throws when enum field is missing', () => {
    assert.throws(
      () => Item({}),
      /is required/
    )
  })

  test('accepts optional enum field when omitted', () => {
    const WithOptional = createBuildable('item', {
      variant: s.enum('primary', 'secondary').optional()
    })
    const json = JSON.parse(JSON.stringify(bt.graph(WithOptional({}))))
    assert.equal(json.layout.variant, undefined)
  })

  test('accepts optional enum with default', () => {
    const WithDefault = createBuildable('item', {
      variant: s.enum('primary', 'secondary').optional('primary')
    })
    const json = JSON.parse(JSON.stringify(bt.graph(WithDefault({}))))
    assert.equal(json.layout.variant, 'primary')
  })

})
