'use strict'

const path = require('path')
const semver = require('semver')

function resolve (result, callback) {
  let { fetchSpec } = result
  let spec = fetchSpec.replace('file:', '')

  if (spec[0] === '~') {
    spec = path.join(process.env.HOME, spec.slice(1))
  }
  spec = path.resolve(spec)

  const pkgJSON = spec.indexOf('package.json') !== -1 ? spec : path.join(spec, 'package.json')
  try {
    const pkg = require(pkgJSON)

    const resolved = {
      version: pkg.version,
      resolved: spec,
      from: semver.validRange(pkg.version)
    }

    if (pkg.dependencies && Object.keys(pkg.dependencies).length) {
      resolved.dependencies = pkg.dependencies
    }

    callback(null, resolved)
  } catch (e) {
    callback(e)
  }
}

module.exports = resolve
