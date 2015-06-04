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

var printer = new SerialPort(argv.port, { baudrate: argv.baudrate }, false)

printer.on('open', function () {
  gcodeStreamer.output.write('Connected to printer!\n')
  gcodeStreamer.setPrompt('> ')
  gcodeStreamer.prompt()

  gcodeStreamer.on('line', function (line) {
    printer.write(line + '\n')
    gcodeStreamer.prompt()
  }).on('close', function () {
    printer.drain()
    printer.close()
  })
})

printer.on('data', function (data) {
  gcodeStreamer.output.clearLine()
  gcodeStreamer.output.cursorTo(0)
  gcodeStreamer.output.write('< ' + data.toString().replace(/echo:/g, ''))
  gcodeStreamer.prompt()
})

printer.open(function (err) {
  if (err) {
    console.log('Could not connect!', err)
    process.exit(1)
  }
})
