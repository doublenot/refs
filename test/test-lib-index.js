'use strict';

const should = require('should');
// const Promise = require('bluebird');
const fs = require('fs');
const td = require('testdouble');

describe('Index Tests', () => {
  const YAML_FILE = '/tmp/file.yaml';
  const JSON_FILE = '/tmp/file.json';
  const INI_FILE = '/tmp/file.ini';
  let yamlProcessor = null;
  let jsonProcessor = null;
  let iniProcessor = null;

  beforeEach(() => {
    yamlProcessor = require('../lib/processor-yaml');
    jsonProcessor = require('../lib/processor-json');
    iniProcessor = require('../lib/processor-ini');
  });

  afterEach(() => {
    td.reset();
    try {
      fs.unlinkSync(YAML_FILE);
    } catch (e) {
      // suppress error
    }
    try {
      fs.unlinkSync(JSON_FILE);
    } catch (e) {
      // suppress error
    }
    try {
      fs.unlinkSync(INI_FILE);
    } catch (e) {
      // suppress error
    }
    yamlProcessor = null;
    jsonProcessor = null;
    iniProcessor = null;
  });

  it('should throw error and exit with no input file arguments', (done) => {
    const refs = require('../index');

    refs()
      .then(() => {
        done('Rejection failed.');
      })
      .catch((err) => {
        should(err).be.eql(new Error('TypeError: Cannot read property \'indexOf\' of undefined'));
        done();
      });
  });

  it('should throw error and exit with non-existent file path', (done) => {
    const refs = require('../index');

    refs('/tmp/does-not-exist.yaml')
      .then(() => {
        done('Rejection failed.');
      })
      .catch((err) => {
        should(err).be.eql(new Error('No such file or directory.'));
        done();
      });
  });

  it('should throw error and exit with invalid config file', (done) => {
    const refs = require('../index');

    refs('/tmp/does-not-exist')
      .then(() => {
        done('Rejection failed.');
      })
      .catch((err) => {
        should(err).be.eql(new Error('No valid config file found.'));
        done();
      });
  });

  it('should throw error and exit with invalid config file', (done) => {
    const refs = require('../index');

    refs('/tmp/does-not-exist')
      .then(() => {
        done('Rejection failed.');
      })
      .catch((err) => {
        should(err).be.eql(new Error('No valid config file found.'));
        done();
      });
  });

  it('should throw error and exit when processor.process throws an error', (done) => {
    fs.writeFileSync(JSON_FILE, '', 'utf-8');
    td.replace(jsonProcessor, 'process', () => {
      throw new Error('An error occurred.');
    });
    const refs = require('../index');

    refs(JSON_FILE)
      .then(() => {
        done('Rejection failed.');
      })
      .catch((err) => {
        should(err).be.eql(new Error('Error: An error occurred.'));
        done();
      });
  });

  it('should throw error and exit when processor.process rejects with error', (done) => {
    fs.writeFileSync(YAML_FILE, '', 'utf-8');
    td.replace(yamlProcessor, 'process', () => new Promise((resolve, reject) => reject(new Error('An error occurred.'))));
    const refs = require('../index');

    refs(YAML_FILE)
      .then(() => {
        done('Rejection failed.');
      })
      .catch((err) => {
        should(err).be.eql(new Error('An error occurred.'));
        done();
      });
  });

  it('should throw error and exit when processor.process resolves with incorrect data', (done) => {
    fs.writeFileSync(INI_FILE, '', 'utf-8');
    td.replace(iniProcessor, 'process', () => new Promise(resolve => resolve({})));
    // td.replace(yamlProcessor, 'dump', () => new Promise((resolve, reject) => reject(new Error('An error occurred.'))));
    const refs = require('../index');

    refs(INI_FILE)
      .then(() => {
        done('Rejection failed.');
      })
      .catch((err) => {
        should(err).be.eql(new Error('An error occurred while parsing JSON string.'));
        done();
      });
  });

  it('should throw error and exit when processor.dump rejects with error', (done) => {
    fs.writeFileSync(YAML_FILE, '', 'utf-8');
    td.replace(yamlProcessor, 'process', () => new Promise(resolve => resolve({ dataString: '{"test":true}' })));
    td.replace(yamlProcessor, 'dump', () => new Promise((resolve, reject) => reject(new Error('An error occurred.'))));
    const refs = require('../index');

    refs(YAML_FILE)
      .then(() => {
        done('Rejection failed.');
      })
      .catch((err) => {
        should(err).be.eql(new Error('An error occurred.'));
        done();
      });
  });

  it('should throw error and exit when processor.write rejects with error', (done) => {
    fs.writeFileSync(YAML_FILE, '', 'utf-8');
    td.replace(yamlProcessor, 'process', () => new Promise(resolve => resolve({ dataString: '{"test":true}' })));
    td.replace(yamlProcessor, 'write', () => new Promise((resolve, reject) => reject(new Error('An error occurred.'))));
    const refs = require('../index');

    refs(YAML_FILE, '/tmp/new.yaml')
      .then(() => {
        done('Rejection failed.');
      })
      .catch((err) => {
        should(err).be.eql(new Error('An error occurred.'));
        done();
      });
  });

  it('should process file correctly', (done) => {
    fs.writeFileSync(YAML_FILE, '', 'utf-8');
    td.replace(yamlProcessor, 'process', () => new Promise(resolve => resolve({ dataString: '{"test":true}' })));
    td.replace(yamlProcessor, 'dump', () => new Promise(resolve => resolve({ outputFile: YAML_FILE })));
    const refs = require('../index');

    refs(YAML_FILE)
      .then((results) => {
        should(results).be.eql({
          outputFile: YAML_FILE,
          content: null,
        });
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
