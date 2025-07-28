const { TextEncoder, TextDecoder } = require('util');

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

if (typeof global.fetch === 'undefined') {
  // eslint-disable-next-line no-undef
  global.fetch = jest.fn();
}

