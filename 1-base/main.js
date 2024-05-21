// i create a few fake events with incremental ids
const events = Array.from({ length: 200_000 }, (_, i) => ({ id: i }));

const tick = performance.now();

// i do some pointless work
for (let event of events) {
  let count = 0;
  for (let i = 0; i < event.id; i++) {
    count += i;
  }
}

console.log(`Main thread done in ${performance.now() - tick}ms`);
