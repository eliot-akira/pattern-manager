
# Pattern manager

Tool for managing code patterns

## Description

`pattern-manager` provides a way to manage a folder of code patterns and their generators, which can be application-specific or shared among projects.

It searches for a folder named `.patterns` in the current working directory or one of its ancestors. The `.patterns` folder can contain a number of pattern folders.

A pattern folder should contain a `pattern.js`, which exports a function to create the pattern, and any related template files. Each pattern is responsible to creating a copy of itself, for example: get options from the command-line or user inputs; copy files and folders; and compile templates.

To simplify the scaffolding process, the pattern generator function is provided with a set of utilities: [`inquirer`](https://github.com/SBoudrias/Inquirer.js),  [`handlebars`](https://github.com/wycats/handlebars.js), [`shell`](https://github.com/shelljs/shelljs), and [`chalk`](https://github.com/chalk/chalk).

This tool is inspired by [`plop`](https://github.com/amwmedia/plop).

## Install

Global

```bash
npm install pattern-manager -g
```

Local (for use in NPM scripts)

```bash
npm install pattern-manager -D
```

## Run

```bash
pat
```

It searches for a `.patterns` folder, displays a list of patterns, and runs the selected pattern.

```bash
pat [pattern name] [...pattern options]
```

If a pattern name is specified, it runs that pattern.

## Pattern

In the `.patterns` folder, there can be one or more pattern folders. These can be nested.

- Each pattern is named after its folder
  - This includes the relative path, for example: `react/state`
- Each pattern folder contains `pattern.js` and any template files
  - Any folder that doesn't have `pattern.js` will be ignored

The job of `pattern.js` is to create a copy of the pattern to its destination. It should export a function that receives a config object.

```js
function pattern(config) {

  const { src, dest } = config

  // Create new pattern here

}

pattern.description = 'Desciption of pattern'

module.exports = pattern
```

If the function has a `description` property, it will be displayed when selecting patterns.


#### Config object

The pattern generator function is provided with a set of properties and utility methods.

- `src` - Source path: the path of the pattern folder
- `dest` - Destination path: current working folder
- `argv` - Command line arguments via [`minimist`](https://github.com/substack/minimist)
- [`inquirer`](https://github.com/SBoudrias/Inquirer.js) - Get different types of user input
- [`handlebars`](https://github.com/wycats/handlebars.js) - Compile templates
- [`shell`](https://github.com/shelljs/shelljs) - Collection of shell commands
- [`chalk`](https://github.com/chalk/chalk) - Colorful logging
- `error` - Display an error message and exit

## Basic example

The following is a basic example of `pattern.js`.

- Get app name and message using `inquirer.prompt`
- Compile a template with `handlebars.compile`
- Create app folder with `shell.mkdir`
- Write rendered template

```js
const fs = require('fs')
const path = require('path')

function pattern(config) {

  const { src, dest, inquirer, handlebars, shell, error } = config

  inquirer.prompt([{
    type: 'input',
    name: 'name',
    default: 'app',
    message: 'Name of app',
    validate: function (value) {
      if (value) return true
      return 'App name is required'
    }
  }, {
    type: 'input',
    name: 'message',
    default: 'Hello, world',
    message: 'Message to display'
  }])

  .then(({ name, message }) => {

    const srcFile = path.join(src, 'example.js')
    const template = fs.readFileSync(srcFile, 'utf8')

    const content = handlebars.compile(template)({ message })

    const destPath = path.join(dest, name)
    const destFile = path.join(destPath, 'example.js')

    shell.mkdir('-p', destPath)

    fs.writeFileSync(destFile, content)

    return destFile
  })

  .then(file => console.log(`Wrote to ${file}`))

  .catch(e => error(e.stack))
}

pattern.description = 'Basic pattern'

module.exports = pattern
```

The `example.js` template:

```js
console.log('{{message}}')
```

## Advanced example

The following is an advanced example of `pattern.js`.

- Take user input for the app name and description
- If the destination exists, display error and quit
- Copy all files in the pattern folder to its destination, using `rsync`
- Replace name and description in `package.json`
- Finally, it asks to run `npm install`

If `--dry` is passed in the command line, it will do a dry run without copying anything.

```js
const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

function pattern(config) {

  const { src, dest, argv, inquirer, error } = config

  inquirer.prompt([{
    type: 'input',
    name: 'name',
    default: 'app',
    message: 'Name of app',
    validate: function (value) {
      if (value) return true
      return 'App name is required'
    }
  }, {
    type: 'input',
    name: 'description',
    default: '',
    message: 'Description'
  }])

  .then(({ name, description }) => {

    const finalDest = path.join(dest, name)

    if (fs.existsSync(finalDest)) {
      return error(`Destination "${name}" already exists`)
    }

    // ------------ Copy pattern ------------

    spawnSync('rsync', [
      '-vrlptz'+(argv.dry ? 'n' : ''), // -n for dry run
      '--delete',
      '--exclude', '.git',
      '--exclude', '/pattern.js', // Exclude this file
      '--filter', ':- .gitignore',
      '.', // Source
      finalDest
    ], { stdio: 'inherit', cwd: __dirname })

    if (argv.dry) return

    // ------------ Search & replace ------------

    const packagePath = path.join(finalDest, 'package.json')
    let data = require(packagePath)

    data.name = name
    data.description = description

    fs.writeFileSync(packagePath, JSON.stringify(data, null, 2))

  })

  .then(() => {

    // ------------ npm install ------------

    return inquirer.prompt([{
      type: 'confirm', name: 'install', default: false, message: 'Install NPM modules?'
    }])

    .then(({ install }) => {

      if (!install || argv.dry) return

      spawnSync('npm', ['install'], { stdio: 'inherit', cwd: dest })
    })

  })

  .catch(e => error(e.stack))

}

pattern.description = 'Advanced pattern'

module.exports = pattern
```