// rpc-client.js
const net = require('net');
const msgpack = require('msgpack-lite');
const EventEmitter = require('events');

class RPCClient extends EventEmitter {
  constructor(socketPath = '/var/run/arduino-router.sock') {
    super();
    this.socketPath = socketPath;
    this.msgid = 0;
    this.pending = new Map();
    this.codec = msgpack.createCodec({ preset: true });

    this.socket = net.createConnection(this.socketPath);

    this.socket.on('connect', () => {
      console.log(`Connected to router: ${this.socketPath}`);
      this.emit('connected');
    });

    this.socket.on('error', (err) => {
      console.error('Socket error:', err.message);
      this.emit('error', err);
    });

    this.socket.on('close', () => {
      console.log('Connection closed');
      this.emit('close');
    });

    this.socket.on('data', (data) => this.handleData(data));
  }

  handleData(data) {
    // Debug: show everything that arrives
    console.log('[RAW received]', data.length, 'bytes →', data.toString('hex'));

    try {
      let messages = msgpack.decode(data, { codec: this.codec });
      if (!Array.isArray(messages)) messages = [messages];

      console.log('[DECODED]', JSON.stringify(messages, null, 2));

      for (const msg of messages) {
        if (Array.isArray(msg)) {
          const type = msg[0];

          if (type === 1) {
            // Response: [1, msgid, error, result]
            const [, msgid, error, result] = msg;
            const cb = this.pending.get(msgid);
            if (cb) {
              cb(error, result);
              this.pending.delete(msgid);
            }
          } else if (type === 2) {
            // Notification: [2, method, params...]
            const [, method, ...params] = msg;
            this.emit('notification', method, ...params);
            this.emit(`notification:${method}`, ...params);
          }
        }
      }
    } catch (err) {
      console.error('Decode error:', err.message);
    }
  }

  call(method, params = [], callback) {
    const msgid = this.msgid++;
    const request = [0, msgid, method, params];
    const encoded = msgpack.encode(request, { codec: this.codec });
    this.pending.set(msgid, callback);
    this.socket.write(encoded);
  }

  // Promise version for cleaner async/await
  callPromise(method, params = []) {
    return new Promise((resolve, reject) => {
      this.call(method, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    }

  close() {
    this.socket.end();
  }
}

module.exports = RPCClient;