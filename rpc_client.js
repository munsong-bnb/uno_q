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
    
    // Use a codec with preset types for better performance/compatibility
    this.codec = msgpack.createCodec({ preset: true });

    this.socket = net.createConnection(this.socketPath);
    
    this.socket.on('connect', () => {
      console.log(`Connected to Arduino Bridge router at ${this.socketPath}`);
      this.emit('connected');
    });

    this.socket.on('error', (err) => {
      console.error('Socket error:', err.message);
      this.emit('error', err);
    });

    this.socket.on('close', () => {
      console.log('Connection to router closed');
      this.emit('close');
    });

    this.socket.on('data', (data) => this.handleData(data));
  }

  handleData(data) {
    console.log(data)
    try {
      // MessagePack can return a single object or array of messages
      const messages = msgpack.decode(data, { codec: this.codec });

      // We expect responses in the form: [1, msgid, error, result]
      if (Array.isArray(messages) && messages[0] === 1) {
        const [, msgid, error, result] = messages;
        const callback = this.pending.get(msgid);
        if (callback) {
          callback(error, result);
          this.pending.delete(msgid);
        }
      }
      // You could also handle notifications or other message types here in the future
    } catch (err) {
      console.error('Failed to decode MessagePack data:', err);
    }
  }

  /**
   * Call a remote method exposed by the MCU (or another client)
   * @param {string} method - e.g. "toggleLED"
   * @param {Array} params - array of arguments, e.g. [true]
   * @param {function} callback - (err, result) => {}
   */
  call(method, params = [], callback) {
    const msgid = this.msgid++;
    const request = [0, msgid, method, params];  // [type, msgid, method, params]

    try {
      const encoded = msgpack.encode(request, { codec: this.codec });
      this.pending.set(msgid, callback);
      this.socket.write(encoded);
    } catch (err) {
      console.error('Failed to encode request:', err);
      if (callback) callback(err);
    }
  }

  /**
   * Register a method so the MCU can call back into Node.js
   * @param {string} methodName
   */
  register(methodName) {
    this.call('$/register', [methodName], (err, res) => {
      if (err) {
        console.error(`Failed to register method "${methodName}":`, err);
      } else {
        console.log(`Successfully registered method: ${methodName}`);
      }
    });
  }

  close() {
    this.socket.end();
  }
}

module.exports = RPCClient;