const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')
const chalk = require('chalk')
const inquirer = require('inquirer')
const handlebars = require('handlebars')
const shell = require('shelljs')
const confirm = require('../utils/confirm')
const error = require('../utils/error')
const resolveSeries = require('../utils/resolveSeries')

module.exports = function runPatternFromFolder({ patternsPath, pattern }) {

  const patternFile = path.join(patternsPath, pattern, 'pattern.js')

  if (!fs.existsSync(patternFile)) {
    error(`pattern.js not found in pattern "${pattern}"`)
  }

  runPattern(patternFile, { patternsPath })
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

    // Shortcuts
    prompt: inquirer.prompt,
    compile: handlebars.compile,
    confirm,
    quit: () => { throw false },
    error,

    // Run command synchronously, streaming output
    command: (name, args, options = {}) =>
      spawnSync(name, args, Object.assign({
        stdio: 'inherit'
      }, options))
    ,

    writeJsonFile: (filePath, data) =>
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    ,

    // Method for a pattern to run other patterns
    runPattern: (nextFile, nextConfig = {}) =>
      runPattern(nextFile,
        Object.assign({}, patternConfig, nextConfig)
      )
  }, config)

  // Pattern can return an array of functions,
  // which will be run as a series of promises

  const promises = patternCallback(patternConfig)

  if (promises && Array.isArray(promises)) {
    resolveSeries(promises).catch(e => e && error(e.stack))
  }
}

module.exports.runPattern = runPattern