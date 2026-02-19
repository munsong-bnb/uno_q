const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const port = new SerialPort({ path: '/dev/ttyHS1', baudRate: 115200 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

parser.on('data', (data) => {
    try {
        // Try to parse as JSON if it looks like it
        if (data.startsWith('{')) {
            const json = JSON.parse(data);
            console.log("Sensor Data:", json);
        } else {
            console.log("MCU String:", data);
        }
    } catch (e) {
        console.log("Raw MCU Data:", data);
    }
});

// Function to send structured commands
function sendCommand(cmd, value) {
    const payload = JSON.stringify({ command: cmd, val: value });
    port.write(payload + '\n');
}

// Example: Send a 'hey' command every 5 seconds
setInterval(() => sendCommand("greeting", "hey"), 5000);





















// const msgpack = require('msgpack-lite');
// const net = require('net');

// const client = net.createConnection({ path: '/run/arduino-router.sock' }, () => {
//     console.log('Connected to Arduino Bridge via Unix Socket');
// });

// // Function to call the MCU 'toggleLED'
// function setLed(state) {
//     // RPC Request: [type, msgid, method, params]
//     const packet = msgpack.encode([0, 1, "toggleLED", [state]]);
//     client.write(packet);
// }

// // Handle incoming notifications from the MCU
// client.on('data', (data) => {
//     const decoded = msgpack.decode(data);
//     // Structure: [type (2 = notify), method, params]
//     if (decoded[0] === 2) {
//         console.log(`Notification from MCU: ${decoded[1]} - Data: ${decoded[2]}`);
//     }
// });

// // Example: Blink every second from Node.js
// let ledState = false;
// setInterval(() => {
//     ledState = !ledState;
//     setLed(ledState);
// }, 1000);