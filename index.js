const net = require('net');
const msgpack = require('msgpack-lite');

// The Uno Q internal router socket path
const SOCKET_PATH = '/run/arduino-router.sock';

const client = net.createConnection({ path: SOCKET_PATH }, () => {
    console.log('Connected to Bridge Socket');
});

client.on('data', (buffer) => {
    try {
        const decoded = msgpack.decode(buffer);
        
        // MessagePack-RPC Notification Format: [Type(2), MethodName, ParamsArray]
        if (decoded[0] === 2) {
            const methodName = decoded[1];
            const params = decoded[2];

            if (methodName === "mcu_greeting") {
                console.log(`Received from MCU: ${params[0]}`);

                // Now send "hey" back to the MCU
                // RPC Request Format: [Type(0), MsgID, MethodName, ParamsArray]
                const msgId = Math.floor(Math.random() * 1000);
                const response = msgpack.encode([0, msgId, "printToSerial", ["hey"]]);
                
                client.write(response);
                console.log("Sent 'hey' back to MCU.");
            }
        }
    } catch (err) {
        // Sometimes partial packets arrive; we ignore decoding errors in this simple demo
    }
});

client.on('error', (err) => {
    console.error("Socket Error:", err.message);
});





















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