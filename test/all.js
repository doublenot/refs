'use strict';

process.env.NODE_ENV = 'test';

describe('All Tests', () => {
  before(() => {});
  after(() => {});

  require('./test-lib-cli');
  require('./test-lib-index');
  require('./test-lib-yaml-processor');
  require('./test-lib-json-processor');
  require('./test-lib-ini-processor');
});
