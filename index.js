// app.js
const RPCClient = require('./rpc-client');  // use your existing rpc-client.js

const client = new RPCClient();

client.on('connected', () => {
  console.log('Connected – starting to poll MCU millis');

  // Poll every 3 seconds
  setInterval(async () => {
    try {
      const millis = await client.callPromise('getMillis', []);
      console.log(`MCU millis: ${millis} ms`);
    } catch (err) {
      console.error('Poll failed:', err.message || err);
    }
  }, 3000);
});

client.on('error', (err) => console.error('Client error:', err));