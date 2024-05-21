// this is using parentPort to pass data to the worker
const { parentPort } = require('node:worker_threads');

// when the worker receives a message
parentPort.on('message', (events) => {
  for (let event of events) {
    let count = 0;
    for (let i = 0; i < event.id; i++) {
      count += i;
    }
  }

  // tell the main thread we're done
  parentPort.postMessage('done');
});
