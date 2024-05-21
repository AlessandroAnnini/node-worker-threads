const { availableParallelism } = require('os');
const {
  Worker,
  parentPort,
  isMainThread,
  workerData,
} = require('node:worker_threads'); // https://nodejs.org/api/worker_threads.html

///////////////////////
// HELPER FUNCTIONS  //
///////////////////////

// this function splits an array into n chunks
function chunkify(array, n) {
  const chunks = [];
  const size = Math.ceil(array.length / n);
  for (let i = 0; i < n; i++) {
    chunks.push(array.slice(i * size, (i + 1) * size));
  }
  return chunks;
}

function run(events, concurrentWorkers, tick) {
  // split the events into chunks
  const chunks = chunkify(events, concurrentWorkers);

  let completeWorkers = 0;

  chunks.forEach((chunk, i) => {
    // create a worker for each chunk
    const worker = new Worker(__filename, { workerData: chunk });

    worker.on('message', (message) => {
      // console.log(`Worker ${i} done: ${message}`);

      completeWorkers += 1;
      if (completeWorkers === concurrentWorkers) {
        console.log(
          `Workers done in ${
            performance.now() - tick
          }ms using ${concurrentWorkers} workers`
        );
      }
    });

    worker.on('error', (err) => {
      console.error(`Worker ${i} encountered an error: ${err.message}`);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker ${i} stopped with exit code ${code}`);
      }
    });

    // send the chunk to the worker
    worker.postMessage(chunk);
  });
}

if (isMainThread) {
  ///////////////////////
  // DECLARATIONS      //
  ///////////////////////
  const defaultConcurrentWorkers = availableParallelism();
  console.log(`Using ${defaultConcurrentWorkers} workers`);

  // create an array of fake events
  const events = Array.from({ length: 200_000 }, (_, i) => ({ id: i }));

  ///////////////////////
  // START             //
  ///////////////////////
  const tick = performance.now();
  run(events, defaultConcurrentWorkers, tick);
} else {
  ///////////////////////
  // WORKER CODE       //
  ///////////////////////

  for (let event of workerData) {
    let count = 0;
    for (let i = 0; i < event.id; i++) {
      count += i;
    }
  }

  parentPort.postMessage('done');
}
