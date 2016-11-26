const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const inquirer = require('inquirer')
const handlebars = require('handlebars')
const shell = require('shelljs')
const error = require('../utils/error')

module.exports = function runPatternFromFolder({ patternsFolder, pattern }) {

  const patternPath = path.join(patternsFolder, pattern)
  const patternFile = path.join(patternPath, 'pattern.js')

  if (!fs.existsSync(patternFile)) {
    error(`pattern.js not found in pattern "${pattern}"`)
  }

  runPattern(patternFile)
}

function runPattern(patternFile, config = {}) {

  let src = '', patternCallback

  if (typeof patternFile === 'string') {
    src = path.dirname(patternFile)
    patternCallback = require(patternFile)
  } else {
    patternCallback = patternFile
  }

  let patternConfig = Object.assign({
    src,
    dest: process.cwd(),
    argv: require('minimist')(process.argv.slice(2)),
    inquirer,
    handlebars,
    shell,
    chalk,
    error,

    // Method for a pattern to run other patterns
    runPattern: (nextFile, nextConfig = {}) =>
      runPattern(nextFile,
        Object.assign({}, patternConfig, nextConfig)
      )
  }, config)

  patternCallback(patternConfig)
}

module.exports.runPattern = runPattern