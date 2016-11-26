const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const inquirer = require('inquirer')
const handlebars = require('handlebars')
const shell = require('shelljs')
const error = require('../utils/error')

module.exports = function runPattern({ patternsFolder, pattern, argv }) {

  const patternPath = path.join(patternsFolder, pattern)
  const patternFile = path.join(patternPath, 'pattern.js')

  if (!fs.existsSync(patternFile)) {
    error(`pattern.js not found in pattern "${pattern}"`)
  }

  runPatternFile(patternFile, {
    argv,
    src: patternPath,
    dest: process.cwd()
  })
}


function runPatternFile(patternFile, config) {

  let patternConfig = Object.assign({
    inquirer,
    handlebars,
    shell,
    chalk, error,
    // Method for a pattern to run other patterns
    runPatternFile: (nextFile, nextConfig = {}) =>
      runPatternFile(nextFile,
        Object.assign({}, patternConfig, nextConfig)
      )
  }, config)

  require(patternFile)(patternConfig)
}