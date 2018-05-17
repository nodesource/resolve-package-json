'use strict'

const test = require('tape')
const { resolver } = require('../')

const fixture = require('./fixtures/debug-3.0.1.json')

test('registry resolver - debug@3.0.1', t => {
  resolver({ debug: '3.0.1' }, (err, result) => {
    t.error(err, 'it should not fail')
    t.deepEqual(result, fixture, 'result should be equal')
    t.end()
  })
})

test('registry resolver - debug@>=3.0.1 <=3.0.1', t => {
  resolver({ debug: '>=3.0.1 <=3.0.1' }, (err, result) => {
    t.error(err, 'it should not fail')
    t.deepEqual(result, fixture, 'result should be equal')
    t.end()
  })
})

test('registry resolver - package not found', t => {
  resolver({ anunknownthing: '*' }, (err, result) => {
    t.error(err, 'it should not fail')
    t.deepEqual(result, {}, 'result should be empty')
    t.end()
  })
})
