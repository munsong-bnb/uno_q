const RPCClient = require('./rpc_client');

const client = new RPCClient();

client.on('connected', () => {
  console.log('Bridge ready – listening for MCU notifications');
});

client.on('notification', (method, ...params) => {
  const message = params[0] || '(no message)';
  console.log(`[NOTIFY] ${method}: "${message}"`);

  // Reply "ok" using boolean (matches MCU callback)
  client.call('reply', [true], (err) => {
    if (err) {
      console.error('Reply failed:', err);
    } else {
      console.log('Sent reply: true ("ok")');
    }
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  client.close();
  process.exit(0);
});