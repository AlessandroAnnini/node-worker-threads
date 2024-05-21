const { availableParallelism } = require('os');
const path = require('node:path');
const { Worker } = require('node:worker_threads'); // https://nodejs.org/api/worker_threads.html

////////////////////////
// DECLARATIONS       //
////////////////////////

const defaultConcurrentWorkers = availableParallelism();
console.log(`Using ${defaultConcurrentWorkers} async workers with Promises`);

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
  const chunks = chunkify(events, concurrentWorkers);
  const promises = [];

  chunks.forEach((chunk, i) => {
    const worker = new Worker(workerFilename, { workerData: chunk });

    const promise = new Promise((resolve, reject) => {
      worker.on('message', (message) => {
        // console.log(`Worker ${i} done: ${message}`);
      });

      worker.on('error', (err) => {
        console.error(`Worker ${i} encountered an error: ${err.message}`);
        reject(err);
      });

      worker.on('exit', (code) => {
        if (code !== 0) {
          console.error(`Worker ${i} stopped with exit code ${code}`);
          reject(new Error(`Exit with code ${code}`));
        } else {
          resolve();
        }
      });
    });

    promises.push(promise);
  });

  // this returns when all the promises are resolved
  return Promise.all(promises);
}

///////////////////////
// START             //
///////////////////////

const tick = performance.now();
run(events, defaultConcurrentWorkers)
  .then(() => {
    console.log(`Workers done in ${performance.now() - tick}ms`);
  })
  .catch((error) => {
    console.error('An error occurred:', error);
  });
