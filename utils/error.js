const chalk = require('chalk')

module.exports = function error(...args) {
	console.error(chalk.red('Error'), ...args)
  process.exit(1)
}
