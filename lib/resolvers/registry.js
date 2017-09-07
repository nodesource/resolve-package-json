'use strict'

const debug = require('debug')('resolve-package-json:resolver:npm')
const request = require('client-request')
const semver = require('semver')

const registry = 'https://registry.npmjs.org'

function resolve (result, callback) {
  const { name, fetchSpec } = result

  debug(`Resolving ${name}@${fetchSpec}`)

  const params = {
    url: `${registry}/${name}/${fetchSpec}`,
    method: 'GET',
    json: true
  }

  request(params, onRequest)

  function onRequest (err, res, body) {
    if (err) {
      callback()
      return
    }

    debug(res.statusCode, body)

    if (res.statusCode !== 200) {
      callback()
      return
    }

    const resolved = {
      version: body.version,
      resolved: body.dist.tarball,
      from: semver.validRange(body.version)
    }

    if (body.dependencies && Object.keys(body.dependencies).length) {
      resolved.dependencies = body.dependencies
    }

    callback(null, resolved)
  }
}

module.exports = resolve
