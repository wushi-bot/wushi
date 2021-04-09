import chalk from 'chalk'

function getTimestamp () {
  const date = new Date()
  let hours = date.getHours().toString()
  let minutes = date.getMinutes().toString()
  let seconds = date.getSeconds().toString()

  if (hours.length === 1) {
    hours = '0' + hours
  }

  if (minutes.length === 1) {
    minutes = '0' + minutes
  }

  if (seconds.length === 1) {
    seconds = '0' + seconds
  }

  const timestamp = hours + ':' + minutes + ':' + seconds

  return timestamp
}

class Logger {
  async log (type, string) {
    if (type === 'info') {
      console.log(`[${chalk.gray(getTimestamp())}] ${chalk.green('[INFO]')} ${chalk.yellow('-')} ${string}`)
    } else if (type === 'error') {
      console.log(`[${chalk.gray(getTimestamp())}] ${chalk.red('[ERROR]')} ${chalk.yellow('-')} ${string}`)
    } else if (type === 'runner') {
      console.log(`[${chalk.gray(getTimestamp())}] ${chalk.magenta('[RUNNING]')} ${chalk.yellow('-')} ${string}`)
    }
  }
}

module.exports.Logger = Logger