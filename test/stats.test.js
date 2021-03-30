const stats = require('../src/stats');

// Many user agent samples are from https://developers.whatismybrowser.com/

beforeEach(() => {
  stats.reset();
});

const mockRequestWithHeaders = headers => {
  stats.handleRequest({
    headers
  });
};

const mockRequestWithAddress = address => {
  stats.handleRequest({
    headers: {},
    ip: address
  });
};

const mockRequestsWithAgents = agents => agents.forEach((agent) => {
  stats.handleRequest({
    headers: {
      'user-agent': agent
    }
  });
});

test('windows', () => {
  const agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.119 Safari/537.36'
  ];
  mockRequestsWithAgents(agents);
  expect(stats.getData().os.windows).toBe(agents.length);
});

test('macOS', () => {
  const agents = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15',
  ];
  mockRequestsWithAgents(agents);
  expect(stats.getData().os.macos).toBe(agents.length);
});

test('linux', () => {
  const agents = [
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36',
    'Mozilla/5.0 (X11; Linux i586; rv:31.0) Gecko/20100101 Firefox/31.0'
  ];
  mockRequestsWithAgents(agents);
  expect(stats.getData().os.linux).toBe(agents.length);
});

test('chrome OS', () => {
  const agents = [
    'Mozilla/5.0 (X11; CrOS x86_64 13421.53.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.77 Safari/537.36'
  ];
  mockRequestsWithAgents(agents);
  expect(stats.getData().os.chromeos).toBe(agents.length);
});

test('android', () => {
  const agents = [
    'Mozilla/5.0 (Linux; Android 9; SM-G950F Build/PPR1.180610.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.157 Mobile Safari/537.36',
  ];
  mockRequestsWithAgents(agents);
  expect(stats.getData().os.android).toBe(agents.length);
});

test('ios', () => {
  const agents = [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
  ];
  mockRequestsWithAgents(agents);
  expect(stats.getData().os.ios).toBe(agents.length);
});

test('chrome', () => {
  const agents = [
    'Mozilla/5.0 (X11; CrOS x86_64 13421.53.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.77 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
  ];
  mockRequestsWithAgents(agents);
  expect(stats.getData().browser.chrome).toBe(agents.length);
});

test('firefox', () => {
  const agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0'
  ];
  mockRequestsWithAgents(agents);
  expect(stats.getData().browser.firefox).toBe(agents.length);
});

test('safari', () => {
  const agents = [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Safari/605.1.15'
  ];
  mockRequestsWithAgents(agents);
  expect(stats.getData().browser.safari).toBe(agents.length);
});

test('other', () => {
  const agents = [
    '',
    '????',
    'sdoilgkjhegrolihjkjloikgrefs',
    '[]23098409*_)(#@*$)(*#R n'
  ];
  mockRequestsWithAgents(agents);
  expect(stats.getData().os.other).toBe(agents.length);
  expect(stats.getData().browser.other).toBe(agents.length);
});

test('none', () => {
  mockRequestWithHeaders({});
  expect(stats.getData().os.none).toBe(1);
  expect(stats.getData().browser.none).toBe(1);
});

test('total requests', () => {
  stats.handleServedFile('/');
  expect(stats.getData().requests.total).toBe(1);
  stats.handleServedFile('/');
  expect(stats.getData().requests.total).toBe(2);
});

test('404', () => {
  stats.handleNotFound();
  expect(stats.getData().requests.notFound).toBe(1);
});

test('paths', () => {
  stats.handleServedFile('/index.html');
  expect(stats.getData().paths.get('/index.html')).toBe(1);
  stats.handleServedFile('/index.html');
  expect(stats.getData().paths.get('/index.html')).toBe(2);
});

test('uniques', () => {
  mockRequestWithAddress('123.123.123.123');
  expect(stats.getData().uniques.size).toBe(1);
  mockRequestWithAddress('123.123.123.123');
  mockRequestWithAddress('123.123.123.123');
  mockRequestWithAddress('123.123.123.123');
  expect(stats.getData().uniques.size).toBe(1);
  mockRequestWithAddress('123.123.123.124');
  expect(stats.getData().uniques.size).toBe(2);
});
