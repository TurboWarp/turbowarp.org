const INTERVAL = 1000;

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

const servedFile = makeCounter('Serve File');
const fileNotFound = makeCounter('404');
const error = makeCounter('Error');

const print = () => {
  console.log(`*** ${new Date().toUTCString()} ***`);

  for (const counter of counters) {
    const name = counter._name;
    const total = counter.count;
    const previousCount = counter.previousCount;
    const delta = total - previousCount;
    counter.previousCount = counter.count;

    const nameText = name.padEnd(16);
    const deltaText = `delta: ${delta}`.padEnd(16);
    const totalText = `total: ${total}`.padEnd(16);
    console.log(`${nameText}${deltaText}${totalText}`);
  }
};

setInterval(print, INTERVAL);

module.exports = {
  servedFile,
  fileNotFound,
  error
};
