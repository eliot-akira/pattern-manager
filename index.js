const fs = require('fs')
const path = require('path')
const findup = require('findup-sync')
const argv = require('minimist')(process.argv.slice(2))

const tasks = {
  list: require('./tasks/list'),
  run: require('./tasks/run')
}
const error = require('./utils/error')

const pattern = argv._[0]

// ------------ Find .patterns folder ------------

const patternsFolder = findup('.patterns')

if (!patternsFolder) {
  error('.patterns folder not found in current or ancestor folders')
}

// ------------ No pattern specified ------------

if (!pattern) {

  tasks.list({ patternsFolder, argv })

} else {

// ------------ Run pattern ------------

  tasks.run({ patternsFolder, pattern, argv })

}
