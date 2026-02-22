// core/tests/InteractionGraph.test.js
import {describe, test} from 'node:test'
import assert from 'node:assert/strict'
import {bt} from '../dist/index.js'
import {__BATONO_INTERNAL_BUILD_SYMBOL} from '../dist/internal/internalKeys.js'
import {buildDefinition} from "../dist/BuildDefinition.js";

const mockBuildable = (type = 'mock') => ({
  [__BATONO_INTERNAL_BUILD_SYMBOL]: (graph) => buildDefinition(graph, {type})
})

describe('InteractionGraph', () => {

  test('generates unique $graph tokens', () => {
    const g1 = bt.graph(mockBuildable())
    const g2 = bt.graph(mockBuildable())
    assert.notEqual(g1.$graph, g2.$graph)
  })

  test('$schema is correct', () => {
    const g = bt.graph(mockBuildable())
    assert.equal(g.$schema, 'batono.interaction-graph.v1')
  })

  test('toJSON contains expected keys', () => {
    const json = JSON.parse(JSON.stringify(bt.graph(mockBuildable())))
    assert.ok('$schema' in json)
    assert.ok('$graph' in json)
    assert.ok('layout' in json)
    assert.ok('actions' in json)
  })

  test('actions is empty initially', () => {
    const json = JSON.parse(JSON.stringify(bt.graph(mockBuildable())))
    assert.equal(Object.keys(json.actions).length, 0)
  })

})

describe('DefinedAction', () => {

  test('withPayload returns new instance', () => {
    const a = bt.defineAction(mockBuildable())
    const b = a.withPayload({id: 1})
    assert.notEqual(a, b)
  })

  test('withPayload does not mutate original', () => {
    const a = bt.defineAction(mockBuildable())
    a.withPayload({id: 1})
    const graph = bt.graph(mockBuildable())
    a[__BATONO_INTERNAL_BUILD_SYMBOL](graph)
    const json = JSON.parse(JSON.stringify(graph))
    assert.equal(json.actions.action_1.payload, undefined)
  })

  test('is automatically registered in graph', () => {
    const action = bt.defineAction(mockBuildable())
    const layout = {
      [__BATONO_INTERNAL_BUILD_SYMBOL]: (graph) => {
        action[__BATONO_INTERNAL_BUILD_SYMBOL](graph)
        return {$schema: graph.$schema, $graph: graph.$graph, type: 'mock'}
      }
    }
    const json = JSON.parse(JSON.stringify(bt.graph(layout)))
    assert.equal(Object.keys(json.actions).length, 1)
  })

  test('payload is included in action reference', () => {
    const action = bt.defineAction(mockBuildable()).withPayload({id: 42})
    const graph = bt.graph(mockBuildable())
    action[__BATONO_INTERNAL_BUILD_SYMBOL](graph)
    const json = JSON.parse(JSON.stringify(graph))
    assert.deepEqual(json.actions.action_1[0].payload, undefined) // payload ist auf der reference, nicht der definition
  })

})

describe('SequentialAction', () => {

  test('serializes items correctly', () => {
    const seq = bt.sequential(mockBuildable('request'), mockBuildable('modal'))
    const graph = bt.graph(mockBuildable())
    const result = seq[__BATONO_INTERNAL_BUILD_SYMBOL](graph)
    assert.equal(result.type, 'sequential')
    assert.equal(result.items.length, 2)
  })

  test('preserves item types', () => {
    const seq = bt.sequential(mockBuildable('request'), mockBuildable('modal'))
    const graph = bt.graph(mockBuildable())
    const result = seq[__BATONO_INTERNAL_BUILD_SYMBOL](graph)
    assert.equal(result.items[0].type, 'request')
    assert.equal(result.items[1].type, 'modal')
  })

})

describe('ParallelAction', () => {

  test('serializes items correctly', () => {
    const par = bt.parallel(mockBuildable('request'), mockBuildable('modal'))
    const graph = bt.graph(mockBuildable())
    const result = par[__BATONO_INTERNAL_BUILD_SYMBOL](graph)
    assert.equal(result.type, 'parallel')
    assert.equal(result.items.length, 2)
  })

  test('preserves item types', () => {
    const par = bt.parallel(mockBuildable('request'), mockBuildable('modal'))
    const graph = bt.graph(mockBuildable())
    const result = par[__BATONO_INTERNAL_BUILD_SYMBOL](graph)
    assert.equal(result.items[0].type, 'request')
    assert.equal(result.items[1].type, 'modal')
  })

  test('same action instance used twice is registered only once', () => {
    const action = bt.defineAction(mockBuildable())
    const layout = {
      [__BATONO_INTERNAL_BUILD_SYMBOL]: (graph) => {
        action[__BATONO_INTERNAL_BUILD_SYMBOL](graph)
        action[__BATONO_INTERNAL_BUILD_SYMBOL](graph)
        return {$schema: graph.$schema, $graph: graph.$graph, type: 'mock'}
      }
    }
    const json = JSON.parse(JSON.stringify(bt.graph(layout)))
    assert.equal(Object.keys(json.actions).length, 1)
  })
})
