'use strict'

const test = require('tape')
const { resolver, resolve } = require('../')

test('resolver', t => {
  t.ok(typeof resolver === 'function', 'should be a function')
  t.end()
})

test('resolve', t => {
  t.ok(typeof resolve === 'function', 'should be a function')
  t.end()
})
