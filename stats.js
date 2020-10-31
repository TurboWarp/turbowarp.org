const INTERVAL = 1000 * 60 * 60;

const counters = [];

const makeCounter = (name) => {
  const fn = () => {
    fn.count++;
  };
  fn._name = name;
  fn.count = 0;
  fn.previousCount = 0;
  counters.push(fn);
  return fn;
};

const servedFile = makeCounter('Files');
const fileNotFound = makeCounter('404');
const error = makeCounter('Error');

const print = () => {
  console.log(`*** ${new Date().toUTCString()} ***`);

  for (const counter of counters) {
    const name = counter._name;
    const count = counter.count;
    const previousCount = counter.previousCount;
    counter.previousCount = counter.count;
    const delta = count - previousCount;
    console.log(`${name}\tdelta: ${delta}\ttotal: ${count}`);
  }
};

setInterval(print, INTERVAL);

module.exports = {
  servedFile,
  fileNotFound,
  error
};
