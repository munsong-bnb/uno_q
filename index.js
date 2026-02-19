const msgpack = require('msgpack-lite');
const net = require('net');

// The Uno Q internal router usually listens on a specific port or socket
const BRIDGE_PORT = 5001; // Default port for the router service
const BRIDGE_HOST = '127.0.0.1';

const client = net.createConnection({ port: BRIDGE_PORT, host: BRIDGE_HOST }, () => {
    console.log('Connected to Arduino Bridge Router');
});

// Function to call the MCU 'toggleLED'
function setLed(state) {
    // RPC Request: [type, msgid, method, params]
    const packet = msgpack.encode([0, 1, "toggleLED", [state]]);
    client.write(packet);
}

// Handle incoming notifications from the MCU
client.on('data', (data) => {
    const decoded = msgpack.decode(data);
    // Structure: [type (2 = notify), method, params]
    if (decoded[0] === 2) {
        console.log(`Notification from MCU: ${decoded[1]} - Data: ${decoded[2]}`);
    }
});

// Example: Blink every second from Node.js
let ledState = false;
setInterval(() => {
    ledState = !ledState;
    setLed(ledState);
}, 1000);