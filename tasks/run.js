const fs = require('fs')
const path = require('path')
const error = require('../utils/error')
const resolveSeries = require('../utils/resolveSeries')
const shortcuts = require('../utils/shortcuts')

module.exports = function runPatternFromFolder({ patternsPath, pattern }) {

  const patternFile = path.join(patternsPath, pattern, 'pattern.js')

  if (!fs.existsSync(patternFile)) {
    error(`pattern.js not found in pattern "${pattern}"`)
  }

  runPattern(patternFile, { patternsPath })
}

function runPattern(patternFile, config = {}) {

  let src = ''
  let patternCallback = patternFile

  if (typeof patternFile === 'string') {
    src = path.dirname(patternFile)
    patternCallback = require(patternFile)
  }

  let patternConfig = Object.assign({
    src,
    dest: process.cwd(),
    argv: require('minimist')(process.argv.slice(2)),

    // Method for a pattern to run other patterns
    runPattern: (nextFile, nextConfig = {}) =>
      runPattern(nextFile,
        Object.assign({}, patternConfig, nextConfig)
      )

  }, shortcuts, config)

  // Pattern can return an array of functions,
  // which will be run as a series of promises

  const promises = patternCallback(patternConfig)

  if (promises && Array.isArray(promises)) {
    resolveSeries(promises).catch(e => e && error(e.stack))
  }
}

module.exports.runPattern = runPattern