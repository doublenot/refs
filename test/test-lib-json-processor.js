'use strict';

const should = require('should');
const fs = require('fs');
const td = require('testdouble');

describe('JSON Tests', () => {
  const JSON_FILE = '/tmp/file.json';
  const JSON_REF_FILE = '/tmp/file-refs.json';
  const JSON_MERGE_FILE = '/tmp/file-merge.json';
  const JSON_FILE_WRITE = '/tmp/file-write.json';

  beforeEach(() => {});

  afterEach(() => {
    td.reset();
    try {
      fs.unlinkSync(JSON_FILE);
    } catch (e) {
      // suppress error
    }
    try {
      fs.unlinkSync(JSON_REF_FILE);
    } catch (e) {
      // suppress error
    }
    try {
      fs.unlinkSync(JSON_MERGE_FILE);
    } catch (e) {
      // suppress error
    }
    try {
      fs.unlinkSync(JSON_FILE_WRITE);
    } catch (e) {
      // suppress error
    }
  });

  it('process: should throw error with no arguments', (done) => {
    const jsonProcessor = require('../lib/processor-json');

    jsonProcessor.process()
      .then(() => {
        done('Rejection failed.');
      })
      .catch((err) => {
        should(err).be.eql('Requires a file path to process.');
        done();
      });
  });

  it('process: should throw error when json.read return undefined', (done) => {
    fs.writeFileSync(JSON_FILE, '', 'utf-8');
    const jsonProcessor = require('../lib/processor-json');

    jsonProcessor.process(JSON_FILE)
      .then(() => {
        done('Rejection failed.');
      })
      .catch((err) => {
        should(err).be.eql('Empty file, nothing to process.');
        done();
      });
  });

  it('process: should process the file with no ref settings', (done) => {
    const jsonContent = fs.readFileSync(JSON_FILE.replace('/tmp', `${__dirname}/data`), 'utf-8');
    fs.writeFileSync(JSON_FILE, jsonContent, 'utf-8');
    const jsonProcessor = require('../lib/processor-json');

    jsonProcessor.process(JSON_FILE)
      .then((results) => {
        should(results).be.eql({
          dataString: '{"test":true}',
          key: undefined,
        });
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('process: should process the file with ref settings', (done) => {
    const jsonContent = fs.readFileSync(JSON_FILE.replace('/tmp', `${__dirname}/data`), 'utf-8');
    const jsonRefContent = fs.readFileSync(JSON_REF_FILE.replace('/tmp', `${__dirname}/data`), 'utf-8');
    fs.writeFileSync(JSON_FILE, jsonContent, 'utf-8');
    fs.writeFileSync(JSON_REF_FILE, jsonRefContent, 'utf-8');
    const jsonProcessor = require('../lib/processor-json');

    jsonProcessor.process(JSON_REF_FILE)
      .then((results) => {
        should(results).be.eql({
          dataString: '{"another":{"test":true}}',
          key: undefined,
        });
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('write: should throw error on write', (done) => {
    td.replace(fs, 'writeFile', (outputFile, data, option, cb) => cb('An error occurred.'));
    const jsonProcessor = require('../lib/processor-json');

    jsonProcessor.write(JSON_FILE_WRITE, { test: true })
      .then(() => {
        done('Rejection failed.');
      })
      .catch((err) => {
        should(err).be.eql('An error occurred.');
        done();
      });
  });

  it('write: should write to output file', (done) => {
    td.replace(fs, 'writeFile', (outputFile, data, option, cb) => cb());
    const jsonProcessor = require('../lib/processor-json');

    jsonProcessor.write(JSON_FILE_WRITE, { test: true })
      .then((results) => {
        should(results).be.eql({
          outputFile: JSON_FILE_WRITE,
        });
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('dump: should dump to output file', (done) => {
    const jsonProcessor = require('../lib/processor-json');

    jsonProcessor.dump({ test: true })
      .then((results) => {
        should(results).be.eql({
          content: JSON.stringify({ test: true }),
        });
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
