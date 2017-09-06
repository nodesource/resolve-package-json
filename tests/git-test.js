'use strict'

const test = require('tape')
const { resolver } = require('../')

test('git resolver - unshort@julianduque/node-unshort', t => {
  resolver({ unshort: 'julianduque/node-unshort' }, (err, result) => {
    t.error(err, 'it should not fail')
    t.ok(result.dependencies, 'should have a dependencies field')
    t.ok(result.dependencies.unshort, 'unshort should be a dependency')
    t.equal(result.dependencies.unshort.version, '1.0.0', 'version should be equal')
    t.equal(result.dependencies.unshort.resolved, 'https://github.com/julianduque/node-unshort.git', 'resolved should be equal')
    t.end()
  })
})

test('git resolver - repo not found', t => {
  resolver({ anunknownthing: 'arepo/doesntexist' }, (err, result) => {
    t.error(!err, 'it should fail')
    t.end()
  })
})
