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

// Find .patterns folder

const patternsPath = findup('.patterns')

if (!patternsPath) {
  error('.patterns folder not found in current or ancestor folders')
}

if (!pattern) {
  tasks.list({ patternsPath, argv })
} else {
  tasks.run({ patternsPath, pattern, argv })
}
