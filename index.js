process.env.UV_THREADPOOL_SIZE = 1024;

const { listen, connect, routines } = require('kalm');
const ipc = require('@kalm/ipc');
const tcp = require('@kalm/tcp');
const udp = require('@kalm/udp');
const ws = require('@kalm/ws');

const actions = { echo: listen, write: connect, tail: connect };
const transports = { ipc, tcp, udp, ws };

const meow = require('meow');

let instance;

const cli = meow(`
    Usage
      $ kalm-cli <action> <transport> <channel> <payload>
 
    Options
      action ['echo', 'listen', 'tail']
      transport ['ipc', 'tcp', 'udp', 'ws']
      channel <string> (Optional) The target channels for a write operation or to echo on listen operations, comma-seperated
      payload <string> (Optional) Send a payload on write operation

      --port, -p  <number> The port to bind to (default: 3000)
      --host, -h  <string> The address to connect to (default: 0.0.0.0)
      --binary, -b Wether to send and receive packets with no transformations (default: false)
      --debug, -d Prints the kalm troubleshooting logs (default: false)
      --routine, -r <string> The routine to use (default: dynamic)
      --tickHertz, -h <number> The tick rate for the routine, where applicable (default: 30)
      --timeout, -t <number> The socket timeout (default: 5m)
`, {
  flags: {
    port: {
      type: 'number',
      alias: 'p',
    },
    host: {
      type: 'string',
      alias: 'h',
    },
    binary: {
      type: 'boolean',
      alias: 'b',
    },
    debug: {
      type: 'boolean',
      alias: 'd',
    },
    routine: {
      type: 'string',
      alias: 'r',
    },
    tickHertz: {
      type: 'number',
      alias: 'h',
    },
    timeout: {
      type: 'number',
      alias: 't',
    },
  },
});

function init(action, transport, options, channel = '/', payload = null) {
  // Validate options
  if (!(action in actions)) throw new Error(`Invalid action ${action}, expected one of ${Object.keys(actions)}`);
  if (!(transport in transports)) throw new Error(`Invalid transport ${transport}, expected one of ${Object.keys(transports)}`);

  if (options.routine && !(options.routine in routines)) throw new Error(`Invalid routine ${options.routine}, expected one of ${Object.keys(routines)}`);

  if (options.debug) process.env.NODE_DEBUG += 'kalm';

  const kalmOptions = {
    json: !options.binary,
    transport: transports[transport]({ socketTimeout: options.timeout || 300000 }),
  };

  if (options.host) kalmOptions.host = options.host;
  if (options.port) kalmOptions.port = options.port;
  if (options.routine) kalmOptions.routine = routines[options.routine](options.tick || 30);

  const client = actions[action](kalmOptions);

  if (action === 'echo') {
    // Echo
    client.on('connection', socket => {
      channel.split(',').forEach(c => socket.subscribe(c, body => client.broadcast(channel, body)));
    });
  }

  // Send
  if (action === 'write' && payload !== null) {
    Promise.all(channel.split(',').map(c => new Promise(resolve => {
      client.on(`${c}.queueRun`, result => {
        process.nextTick(() => {
          console.log('--', result);
          resolve();
        });
      });
      client.write(channel, payload);
    })))
      .then(() => setTimeout(() => process.exit(), 10));
  }

  // Tail
  if (action === 'tail') {
    channel.split(',').forEach(c => client.subscribe(c, body => console.log(body)));
    client.on('disconnect', () => process.exit());
  }

  return client;
}

module.exports = init;

if (!module.parent) {
  console.log('running!');
  instance = init(cli.input[0], cli.input[1], cli.flags, cli.input[2], cli.input[3]);
  instance.on('error', err => console.error(err));
}
