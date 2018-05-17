'use strict'

const debug = require('debug')('resolve-package-json:resolver:npm')
const request = require('client-request')
const semver = require('semver')

const registry = 'https://registry.npmjs.org'

function resolve (result, callback) {
  const { name, fetchSpec } = result

  debug(`Resolving ${name}@${fetchSpec}`)

  const params = {
    url: `${registry}/${name}`,
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

    body = findBestVersionForSpec(body, fetchSpec)
    if (body == null) return callback()

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

// given a packument and semver range, find and return the embedded package
// body for the best version that matches
function findBestVersionForSpec (packument, semverRange) {
  // if they provided a bogus semver range, just treat as '*'
  if (!semver.validRange(semverRange)) semverRange = '*'

  // first resolve the semver range via dist-tags (eg, to handle 'latest')
  const distTags = packument['dist-tags']
  if (distTags != null) {
    const tagged = distTags[semverRange]
    if (tagged != null) semverRange = tagged
  }

  // if it's a valid semver, then there should be a version for it
  const versions = packument.versions || {}
  if (semver.valid(semverRange)) {
    if (versions[semverRange] != null) return versions[semverRange]
  }

  // get all the valid version numbers, sort by semver in descending order
  const versionNames = Object.keys(versions)
    .filter(versionName => semver.valid(versionName)) // might be crap in there
    .sort(semver.rcompare)

  // find the first version that satisfies
  for (let versionName of versionNames) {
    if (semver.satisfies(versionName, semverRange)) return versions[versionName]
  }

  return null
}

module.exports = resolve
