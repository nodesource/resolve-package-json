'use strict'

const debug = require('debug')('resolve-package-json:resolver')
const async = require('async')
const npa = require('npm-package-arg')
const registry = require('./resolvers/registry')
const git = require('./resolvers/git')
const local = require('./resolvers/local')

function resolver (dependencies, accumulator = {}, seen = new Set(), callback) {
  if (!dependencies) {
    callback(null, accumulator)
    return
  }

  const names = Object.keys(dependencies)

  async.each(names, resolveDependency, done)

  function resolveDependency (name, next) {
    const spec = dependencies[name]
    const key = `${name}@${spec}`

    if (seen.has(key)) {
      next()
      return
    }

    resolve(name, spec, (err, result) => {
      if (err) {
        next(err)
        return
      }

      if (!result) {
        next()
        return
      }

      seen.add(key)

      debug(`Resolved ${name}@${result.version}`)

      dependencies = result.dependencies
      delete result.dependencies

      if (!accumulator.dependencies) {
        accumulator.dependencies = {}
      }

      accumulator.dependencies[name] = result

      if (dependencies) {
        resolver(dependencies, accumulator.dependencies[name], seen, next)
        return
      }

      next()
    })
  }

  function done (err) {
    if (err) {
      callback(err)
      return
    }

    callback(null, accumulator)
  }
}

function resolve (name, spec, callback) {
  let result
  try {
    result = npa.resolve(name, spec)
  } catch (e) {
    callback(e)
    return
  }

  switch (result.type) {
    case 'git':
      git(result, callback)
      break
    case 'file':
    case 'directory':
      local(result, callback)
      break
    case 'remote':
      callback()
      break
    case 'tag':
    case 'range':
    case 'version':
    default:
      registry(result, callback)
  }
}

module.exports = {
  resolver: function (dependencies, callback) {
    resolver(dependencies, {}, new Set(), callback)
  },
  resolve
}
