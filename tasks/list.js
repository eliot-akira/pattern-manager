const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const inquirer = require('inquirer')
const runPattern = require('./run')

module.exports = ({ patternsFolder, argv }) => {

  // List folders in .patterns

  console.log(chalk.green('Available patterns in'), patternsFolder)

  const patterns = getAllPatternFolders(patternsFolder)
    .map(pattern => {
      // Trim pattern folder name to relative
      pattern.folder = path.relative(patternsFolder, pattern.folder)
      return pattern
    })

  choosePattern(patterns, patternsFolder)
  .then(pattern => runPattern({ patternsFolder, pattern, argv }))
}


function choosePattern(patterns, root) {
  return inquirer.prompt([{
    type: 'list',
    name: 'pattern',
    message: chalk.green('Choose a pattern'),
    choices: patterns.map(pattern => {
      return {
        name: pattern.folder+(
          pattern.description ? ' - '+pattern.description : ''
        ),
        value: pattern.folder
      }
    })
  }])
  .then(results => results.pattern)
}


const exclude = ['.git', 'node_modules']

function getAllPatternFolders(dir) {

  let results = []

  fs.readdirSync(dir).forEach(file => {

    if (exclude.indexOf(file) >= 0) return

    file = path.join(dir, file)

    const stat = fs.statSync(file)

    if (!stat || !stat.isDirectory()) return

    const patternFile = path.join(file, 'pattern.js')

    if (fs.existsSync(patternFile)) {

      // Get pattern description

      const pattern = require(patternFile)

      results.push({
        folder: file,
        description: pattern.description
      })
    }

    results = results.concat(getAllPatternFolders(file))
  })

  return results
}