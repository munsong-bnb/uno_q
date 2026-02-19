// app.js
const RPCClient = require('./rpc-client');  // or './rpc-client.js' if you prefer explicit

const client = new RPCClient();  // uses default socket path

// Optional: wait for connection before doing calls
client.on('connected', () => {
  console.log('Ready to make RPC calls');

  // Example: toggle LED every 2 seconds
  setInterval(() => {
    client.call('toggleLED', [true], (err, res) => {
      if (err) console.error('Failed to turn LED on:', err);
      else console.log('LED ON →', res);
    });

    setTimeout(() => {
      client.call('toggleLED', [false], (err, res) => {
        if (err) console.error('Failed to turn LED off:', err);
        else console.log('LED OFF →', res);
      });
    }, 1000);
  }, 2000);
});

// Optional: handle errors globally
client.on('error', (err) => {
  console.error('RPC Client error:', err);
});

// Graceful shutdown (Ctrl+C)
process.on('SIGINT', () => {
  console.log('Shutting down...');
  client.close();
  process.exit(0);
});