'use strict'

const debug = require('debug')('resolve-package-json:resolver:git')
const request = require('client-request')
const semver = require('semver')
const { git } = require('../utils')

const filetemplate = hosted => {
  return hosted.filetemplate
    .replace('{auth@}', hosted.auth ? hosted.auth + '@' : '')
    .replace('{domain}', hosted.domain)
    .replace('{user}', hosted.user)
    .replace('{project}', hosted.project)
    .replace('{committish}', hosted.committish ? hosted.committish : '')
    .replace('{path}', 'package.json')
}

const httpstemplate = (hosted, committish) => {
  return hosted.httpstemplate
    .replace('git+https', 'https')
    .replace('{auth@}', hosted.auth ? hosted.auth + '@' : '')
    .replace('{domain}', hosted.domain)
    .replace('{user}', hosted.user)
    .replace('{project}', hosted.project)
    .replace('{#committish}', committish ? '#' + hosted.committish : '')
}

function resolve (result, callback) {
  debug(`Resolving ${result.name}@${result.spec}`)

  resolveHosted(result.hosted, onResolveHosted)

  function onResolveHosted (err, hosted) {
    if (err) {
      callback(err)
      return
    }

    const options = {
      url: filetemplate(hosted),
      method: 'GET',
      json: true
    }

    request(options, onRequest)

    function onRequest (err, res, body) {
      if (err) {
        callback(err)
        return
      }

      debug(res.statusCode, body)

      if (res.statusCode !== 200) {
        callback(new Error(`registry returned: ${res.statusCode}`))
      }

      const resolved = {
        version: body.version,
        resolved: httpstemplate(hosted),
        from: semver.validRange(body.version)
      }

      if (body.dependencies && Object.keys(body.dependencies).length) {
        resolved.dependencies = body.dependencies
      }

      callback(null, resolved)
    }
  }
}

function resolveHosted (hosted, callback) {
  if (!hosted.committish) {
    git(['ls-remote', httpstemplate(hosted), 'HEAD'], (err, result) => {
      if (err) {
        callback(err)
        return
      }

      hosted.committish = result.slice(0, 6)
      callback(null, hosted)
    })
  } else if (hosted.committish.startsWith('semver:')) {
    const range = hosted.committish.replace('semver:', '')
    git(['ls-remote', '--tags', httpstemplate(hosted)], (err, result) => {
      if (err) {
        callback(err)
        return
      }

      const list = result.split('\n')
      list.forEach((str) => {
        if (str.split('\t').length === 1) return

        const hash = str.split('\t')[0].slice(0, 6)
        const version = str.split('\t')[1].replace('refs/tags/', '')

        if (version.match(/\^\{\}/)) return
        if (!semver.valid(version)) return
        if (semver.satisfies(version, range)) hosted.committish = hash
      })

      callback(null, hosted)
    })
  } else {
    git(['ls-remote', '--tags', httpstemplate(hosted)], (err, result) => {
      if (err) {
        callback(err)
        return
      }

      const committish = result.split('\n')
        .filter((str, i) => {
          return str.indexOf(hosted.committish) !== -1
        }).pop()

      hosted.committish = committish
        ? committish.split('\t')[0]
        : hosted.committish

      callback(null, hosted)
    })
  }
}

module.exports = resolve
