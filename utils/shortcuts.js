const fs = require('fs')
const { spawnSync } = require('child_process')
const chalk = require('chalk')
const inquirer = require('inquirer')
const handlebars = require('handlebars')
const shell = require('shelljs')
const confirm = require('./confirm')
const error = require('./error')

module.exports = {

  inquirer,
  handlebars,
  shell,
  chalk,

  prompt: inquirer.prompt,
  compile: handlebars.compile,
  confirm,
  quit: () => { throw false },
  error,
  fileExists: fs.existsSync,

  // Run command synchronously, streaming output
  command: (name, args, options = {}) =>
    spawnSync(name, args, Object.assign({
      stdio: 'inherit'
    }, options))
  ,

  readFile: filePath => fs.readFileSync(filePath, 'utf8'),

  writeFile: fs.writeFileSync,

  writeJsonFile: (filePath, data) => fs.writeFileSync(
    filePath, JSON.stringify(data, null, 2)
  ),

  compileFile: (filePath, data, dest) => {
    const content = handlebars.compile(
      fs.readFileSync(filePath, 'utf8')
    )(data)
    if (dest) fs.writeFileSync(dest, content)
    return content
  }

}