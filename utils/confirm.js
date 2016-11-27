const inquirer = require('inquirer')

module.exports = function confirm(args = {}, defaultValue = true) {

  if (typeof args === 'string') args = { message: args }

  const promptArgs = Object.assign({
    type: 'confirm',
    name: 'confirmed',
    default: defaultValue,
    message: 'Ready?'
  }, args)

  return inquirer.prompt([promptArgs]).then(result => result.confirmed)
}
