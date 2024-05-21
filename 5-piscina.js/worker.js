const { setTimeout } = require('node:timers/promises');

module.exports = async (events) => {
  for (let event of events) {
    let count = 0;
    for (let i = 0; i < event.id; i++) {
      count += i;
    }
  }
  // await setTimeout(100);
  return 'done';
};
