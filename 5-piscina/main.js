const { availableParallelism } = require('os');
const path = require('path');
const Piscina = require('piscina'); // https://github.com/piscinajs/piscina

////////////////////////
// DECLARATIONS       //
////////////////////////

const defaultConcurrentWorkers = availableParallelism();
console.log(`Using ${defaultConcurrentWorkers} workers with Piscina `);

const piscina = new Piscina({
  filename: path.resolve(__dirname, 'worker.js'),
});

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
    piscina
      .run(chunk)
      .then((message) => {
        // console.log(`Worker ${i} done: ${message}`);

        completeWorkers += 1;
        if (completeWorkers === concurrentWorkers) {
          console.log(
            `Workers done in ${
              performance.now() - tick
            }ms using ${concurrentWorkers} workers`
          );
        }
      })
      .catch((err) => {
        console.error(`Worker ${i} encountered an error: ${err.message}`);
      });
  });
}

///////////////////////
// START             //
///////////////////////

const tick = performance.now();
run(events, defaultConcurrentWorkers);
