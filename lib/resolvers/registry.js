'use strict'

const debug = require('debug')('resolve-package-json:resolver:npm')
const request = require('client-request')

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
      callback(err)
      return
    }

    debug(res.statusCode, body)

    if (res.statusCode !== 200) {
      callback(new Error(`registry returned: ${res.statusCode}`))
      return
    }

    const resolved = {
      version: body.version,
      resolved: body.dist.tarball
    }

    if (body.dependencies && Object.keys(body.dependencies).length) {
      resolved.dependencies = body.dependencies
    }

    callback(null, resolved)
  }
}

module.exports = resolve
