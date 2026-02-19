// app.js
const RPCClient = require('./rpc_client');

const client = new RPCClient();

client.on('connected', () => {
  console.log('Connected – waiting for millis messages from MCU');
});

client.on('notification', (method, ...params) => {
  if (method === 'millis' || method === 'status') {
    const received = params[0] || '(empty)';
    console.log(`MCU sent: ${method} → "${received}"`);

    // Immediately reply "ok"
    client.call('reply', ['ok'], (err) => {
      if (err) {
        console.error('Failed to send "ok":', err);
      } else {
        console.log('Replied → "ok"');
      }
    });
  }
});

// Optional: log all notifications for debugging
client.on('notification:millis', (msg) => {
  console.log(`[millis] ${msg}`);
});

process.on('SIGINT', () => {
  console.log('Shutting down');
  client.close();
  process.exit(0);
});