const net = require('net');
const msgpack = require('msgpack-lite');

const SOCKET_PATH = '/run/arduino-router.sock';

const client = net.createConnection({ path: SOCKET_PATH }, () => {
    console.log('Connected to Uno Q Router');
});

client.on('data', (buffer) => {
    const decoder = msgpack.createDecodeStream();
    
    decoder.on("data", (decoded) => {
        // Log what we got from MCU
        if (decoded[0] === 2 && decoded[1] === "mcu_greeting") {
            console.log(`MCU says: ${decoded[2]}`);

            // BUILD THE REPLY CAREFULLY
            const type = 0;             // 0 = Request
            const msgId = Math.floor(Math.random() * 1000);
            const method = "printToSerial";
            const params = ["hey"];     // Parameters MUST be in an array
            
            // The whole packet MUST be an array: [0, id, "name", ["args"]]
            const packet = [type, msgId, method, params];
            const encodedPacket = msgpack.encode(packet);
            
            client.write(encodedPacket);
            console.log("Sent 'hey' back to MCU.");
        }
    });

    decoder.write(buffer);
});

client.on('error', (err) => console.error("Socket Error:", err));





















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