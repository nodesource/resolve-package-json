'use strict'

const which = require('which')
const { execFile } = require('child_process')
const prefix = process.platform === 'win32' ? ['-c', 'core.longpaths=true'] : []

function git (cmds, callback) {
  const opts = { encoding: 'utf8' }
  which('git', onWhich)

  function onWhich (err, bin) {
    if (err) {
      callback(err)
      return
    }

    const args = prefix.concat(cmds)
    execFile(bin, args, opts, onExecFile)
  }

  function onExecFile (err, stdout, stderr) {
    if (err) {
      callback(err)
      return
    }

    callback(null, stdout)
  }
}

module.exports = {
  git
}
