#!/usr/bin/env node

var fs = require('fs')
var readline = require('readline')
var SerialPort = require('serialport').SerialPort

var argv = require('yargs')
  .usage('Usage: $0 [options] [filename]')
  .alias('p', 'port')
  .nargs('p', 1)
  .default('p', '/dev/tty.usbmodem1411')
  .describe('p', 'Serial port path')
  .alias('b', 'baudrate')
  .nargs('b', 1)
  .default('b', 57600)
  .describe('b', 'Serial port baudrate')
  .help('h')
  .alias('h', 'help')
  .argv

var file = argv._[0]

var printer = new SerialPort(argv.port, { baudrate: argv.baudrate }, false)

printer.on('open', function () {
  console.log('Connected to printer!')
})

printer.on('data', function (data) {
  console.log('< ', data)
})

printer.open(function (err) {
  console.log('Could not connect!', err)
  process.exit(1)
})

var gcodeStreamer
if (file) {
  fs.open(file, function (err, data) {
    if (err) {
      console.log(err)
      process.exit(1)
    }

    gcodeStreamer = readline.createInterface({
      input: data,
      output: process.stdout
    })
  })
  printer.drain()
} else {
  gcodeStreamer = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
}

gcodeStreamer.setPrompt('> ')
gcodeStreamer.prompt()

gcodeStreamer.on('line', function (line) {
  printer.write(line)
  gcodeStreamer.prompt()
}).on('close', function () {
  printer.drain()
  printer.close()
})
