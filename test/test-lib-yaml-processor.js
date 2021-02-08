'use strict';

const should = require('should');
const fs = require('fs');
const td = require('testdouble');

describe('YAML Tests', () => {
  const YAML_FILE = '/tmp/file.yaml';
  const YAML_REF_FILE = '/tmp/file-refs.yaml';
  const YAML_MERGE_FILE = '/tmp/file-merge.yaml';
  const YAML_FILE_WRITE = '/tmp/file-write.yaml';

  beforeEach(() => {});

  afterEach(() => {
    td.reset();
    try {
      fs.unlinkSync(YAML_FILE);
    } catch (e) {
      // suppress error
    }
    try {
      fs.unlinkSync(YAML_REF_FILE);
    } catch (e) {
      // suppress error
    }
    try {
      fs.unlinkSync(YAML_MERGE_FILE);
    } catch (e) {
      // suppress error
    }
    try {
      fs.unlinkSync(YAML_FILE_WRITE);
    } catch (e) {
      // suppress error
    }
  });

  it('process: should throw error with no arguments', (done) => {
    const yamlProcessor = require('../lib/processor-yaml');

    yamlProcessor
      .process()
      .then(() => {
        done('Rejection failed.');
      })
      .catch((err) => {
        should(err).be.eql(new Error('Requires a file path to process.'));
        done();
      });
  });

  it('process: should throw error when yaml.read return undefined', (done) => {
    fs.writeFileSync(YAML_FILE, '', 'utf-8');
    const yamlProcessor = require('../lib/processor-yaml');

    yamlProcessor
      .process(YAML_FILE)
      .then(() => {
        done('Rejection failed.');
      })
      .catch((err) => {
        should(err).be.eql(new Error('Empty file, nothing to process.'));
        done();
      });
  });

  it('process: should process the file with no ref settings', (done) => {
    const yamlContent = fs.readFileSync(YAML_FILE.replace('/tmp', `${__dirname}/data`), 'utf-8');
    fs.writeFileSync(YAML_FILE, yamlContent, 'utf-8');
    const yamlProcessor = require('../lib/processor-yaml');

    yamlProcessor
      .process(YAML_FILE)
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
    const yamlContent = fs.readFileSync(YAML_FILE.replace('/tmp', `${__dirname}/data`), 'utf-8');
    const yamlRefContent = fs.readFileSync(YAML_REF_FILE.replace('/tmp', `${__dirname}/data`), 'utf-8');
    fs.writeFileSync(YAML_FILE, yamlContent, 'utf-8');
    fs.writeFileSync(YAML_REF_FILE, yamlRefContent, 'utf-8');
    const yamlProcessor = require('../lib/processor-yaml');

    yamlProcessor
      .process(YAML_REF_FILE)
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

  it('process: should throw error the file with malformed merge settings', (done) => {
    fs.writeFileSync(YAML_MERGE_FILE, '$merge:\n  - one: true\n  - two: true\n', 'utf-8');
    const yamlProcessor = require('../lib/processor-yaml');

    yamlProcessor
      .process(YAML_MERGE_FILE)
      .then(() => {
        done('Rejection failed.');
      })
      .catch((err) => {
        should(err).be.eql(new Error('Malformed merge setting, please check the input file.'));
        done();
      });
  });

  it('process: should throw error the file with malformed merge settings with ref settings', (done) => {
    const yamlContent = fs.readFileSync(YAML_FILE.replace('/tmp', `${__dirname}/data`), 'utf-8');
    const yamlRefContent = fs.readFileSync(YAML_REF_FILE.replace('/tmp', `${__dirname}/data`), 'utf-8');
    const yamlMergeContent = fs.readFileSync(YAML_MERGE_FILE.replace('/tmp', `${__dirname}/data`), 'utf-8');
    fs.writeFileSync(YAML_FILE, yamlContent, 'utf-8');
    fs.writeFileSync(YAML_REF_FILE, yamlRefContent, 'utf-8');
    fs.writeFileSync(
      YAML_MERGE_FILE,
      `${yamlMergeContent}\nanother:\n  $merge:\n    - one: true\n    - two: true\n`,
      'utf-8',
    );
    const yamlProcessor = require('../lib/processor-yaml');

    yamlProcessor
      .process(YAML_MERGE_FILE)
      .then(() => {
        done('Rejection failed.');
      })
      .catch((err) => {
        should(err).be.eql(new Error('Malformed merge setting, please check the input file.'));
        done();
      });
  });

  it('process: should process the file with merge settings', (done) => {
    const yamlContent = fs.readFileSync(YAML_FILE.replace('/tmp', `${__dirname}/data`), 'utf-8');
    const yamlRefContent = fs.readFileSync(YAML_REF_FILE.replace('/tmp', `${__dirname}/data`), 'utf-8');
    const yamlMergeContent = fs.readFileSync(YAML_MERGE_FILE.replace('/tmp', `${__dirname}/data`), 'utf-8');
    fs.writeFileSync(YAML_FILE, yamlContent, 'utf-8');
    fs.writeFileSync(YAML_REF_FILE, yamlRefContent, 'utf-8');
    fs.writeFileSync(YAML_MERGE_FILE, yamlMergeContent, 'utf-8');
    const yamlProcessor = require('../lib/processor-yaml');

    yamlProcessor
      .process(YAML_MERGE_FILE)
      .then((results) => {
        should(results).be.eql({
          dataString: '{"test":{"test":true,"another":{"test":true}}}',
          key: undefined,
        });
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('write: should throw error on write', (done) => {
    td.replace('node-yaml', {
      write: (outputFile, compiled, options, cb) => cb(new Error('An error occurred.')),
    });
    const yamlProcessor = require('../lib/processor-yaml');

    yamlProcessor
      .write(YAML_FILE_WRITE, { test: true })
      .then(() => {
        done('Rejection failed.');
      })
      .catch((err) => {
        should(err).be.eql(new Error('An error occurred.'));
        done();
      });
  });

  it('write: should write to output file', (done) => {
    td.replace('node-yaml', {
      write: (outputFile, compiled, options, cb) => cb(),
    });
    const yamlProcessor = require('../lib/processor-yaml');

    yamlProcessor
      .write(YAML_FILE_WRITE, { test: true })
      .then((results) => {
        should(results).be.eql({
          outputFile: YAML_FILE_WRITE,
        });
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('dump: should throw error on dump', (done) => {
    td.replace('node-yaml', {
      dump: () => {
        throw new Error('An error occurred.');
      },
    });
    const yamlProcessor = require('../lib/processor-yaml');

    yamlProcessor
      .dump({ test: true })
      .then(() => {
        done('Rejection failed.');
      })
      .catch((err) => {
        should(err).be.eql(new Error('Error: An error occurred.'));
        done();
      });
  });

  it('dump: should dump to output file', (done) => {
    td.replace('node-yaml', {
      dump: (compiled) => JSON.stringify(compiled),
    });
    const yamlProcessor = require('../lib/processor-yaml');

    yamlProcessor
      .dump({ test: true })
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
