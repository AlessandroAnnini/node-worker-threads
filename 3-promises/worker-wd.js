// this is using workerData to pass data to the worker
const { workerData, parentPort } = require('node:worker_threads');
const { setTimeout } = require('node:timers/promises');

async function main() {
  for (let event of workerData) {
    let count = 0;
    for (let i = 0; i < event.id; i++) {
      count += i;
    }
  }

  // sleep for 1 second before sending the message
  // await setTimeout(100);

  parentPort.postMessage('done');
}

main();
