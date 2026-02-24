import {describe, test} from 'node:test'
import assert from 'node:assert/strict'
import {bt, scopable} from '../dist/index.js'
import {createBuildable, s} from '../dist/utils/create-buildable/index.js'
import {__BATONO_INTERNAL_BUILD_SYMBOL} from "../dist/internal/index.js";

describe('ScopedBuildable', () => {

  const Item = scopable(createBuildable('item', {
    label: s.string()
  }))

  test('adds $node to built result', () => {
    const scope = bt.createScope()
    const item = Item({label: 'foo'})
    const graph = bt.graph(bt.scope(item, scope))
    const json = JSON.parse(JSON.stringify(graph))
    assert.deepEqual(json.layout.$node, [scope.token(graph)])
  })

  test('preserves original node type', () => {
    const scope = bt.createScope()
    const item = Item({label: 'foo'})
    const json = JSON.parse(JSON.stringify(bt.graph(bt.scope(item, scope))))
    assert.equal(json.layout.type, 'item')
    assert.equal(json.layout.label, 'foo')
  })

  test('preserves $graph token', () => {
    const scope = bt.createScope()
    const item = Item({label: 'foo'})
    const json = JSON.parse(JSON.stringify(bt.graph(bt.scope(item, scope))))
    assert.equal(json.layout.$graph, json.$graph)
  })

  test('two different scopes generate different tokens', () => {
    const graph = bt.graph({
      [__BATONO_INTERNAL_BUILD_SYMBOL](graph) {
      }
    })
    const scope1 = bt.createScope()
    const scope2 = bt.createScope()
    assert.notEqual(scope1.token(graph), scope2.token(graph))
  })

  test('same scope used on multiple nodes produces same $node token', () => {
    const scope = bt.createScope()
    const item1 = Item({label: 'foo'})
    const item2 = Item({label: 'bar'})
    const row = createBuildable('row', {
      items: s.buildable().many()
    })
    const rows = createBuildable('rows', {
      items: s.buildable().many()
    })

    const graph = bt.graph(
      rows({
          items: [
            row({
              items: [item1.scope(scope)]
            }),
            row({
              items: [item2.scope(scope)]
            }),
          ]
        }
      )
    )

    const json = graph.toJSON()

    assert.deepEqual(json.layout.items[0].items[0].$node, [scope.token(graph)])
    assert.deepEqual(json.layout.items[1].items[0].$node, [scope.token(graph)])
    assert.deepEqual(json.layout.items[0].items[0].$node, json.layout.items[1].items[0].$node)
  })

})

describe('createBuildable — s.scope', () => {

  const Item = createBuildable('item', {
    label: s.string(),
    scope: s.scope()
  })

  test('accepts Scope instance', () => {
    const scope = bt.createScope()
    const json = JSON.parse(JSON.stringify(bt.graph(Item({
      label: 'test',
      scope
    }))))
    assert.equal(json.layout.scope.type, 'scope')
    assert.ok(json.layout.scope.token.startsWith('s_'))
  })

  test('throws when scope field receives non-Scope', () => {
    assert.throws(
      () => Item({label: 'test', scope: 'not-a-scope'}),
      /expected Scope, got string/
    )
  })

  test('throws when scope field receives plain object', () => {
    assert.throws(
      () => Item({label: 'test', scope: {token: 's_123'}}),
      /expected Scope, got object/
    )
  })
})
