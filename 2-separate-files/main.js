const { availableParallelism } = require('os');
const path = require('node:path');
const { Worker } = require('node:worker_threads'); // https://nodejs.org/api/worker_threads.html

////////////////////////
// DECLARATIONS       //
////////////////////////

const defaultConcurrentWorkers = availableParallelism();
console.log(`Using ${defaultConcurrentWorkers} workers`);

const workerFilename = path.resolve(__dirname, 'worker-wd.js');

// create an array of fake events
const events = Array.from({ length: 200_000 }, (_, i) => ({ id: i }));

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

function run(events, concurrentWorkers) {
  // split the events into chunks
  const chunks = chunkify(events, concurrentWorkers);

  let completeWorkers = 0;

  chunks.forEach((chunk, i) => {
    // create a worker for each chunk
    // const worker = new Worker(workerFilename);
    // alternatively, i can send workerData in the constructor
    const worker = new Worker(workerFilename, { workerData: chunk });
    // this way i don't need to use worker.postMessage(chunk);

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

    // send the chunk to the worker (already done in the constructor)
    // worker.postMessage(chunk);
  });
}

///////////////////////
// START             //
///////////////////////

const tick = performance.now();
run(events, defaultConcurrentWorkers);
