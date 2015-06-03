var SerialPort = require('serialport').SerialPort

var printerPort = new SerialPort('/dev/tty.usbmodem1411', {
  baudrate: 57600
})

printerPort.on('open', function () {
  console.log('Connected!')
  printerPort.on('data', function (data) {
    console.log('Printer: ' + data)
    printerPort.close()
  })

  console.log('Sending: M501')
  printerPort.write('M501\n', function (err, results) {
    console.log('err ' + err)
    console.log('results ' + results)
  })
})
