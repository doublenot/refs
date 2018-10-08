'use strict';

const should = require('should');
const td = require('testdouble');
const { exec } = require('child_process');
const fs = require('fs');

describe('Bin Tests', () => {
  let stdoutContent = null;
  const YAML_FILE = '/tmp/file.yaml';

  beforeEach(() => {
    stdoutContent = `Usage: refs [options] <file>

Options:
  -V, --version        output the version number
  -o, --output <file>  The path for the output file
  -h, --help           output usage information
`;
  });

  afterEach(() => {
    td.reset();
    stdoutContent = null;
    try {
      fs.unlinkSync(YAML_FILE);
    } catch (e) {
      // suppress error
    }
  });

  it('should display help with no arguments', (done) => {
    exec('node ./bin/refs.js', (error, stdout, stderr) => {
      should(error).be.eql(null);
      should(stdout).be.eql(stdoutContent);
      should(stderr).be.eql('');
      done();
    });
  });

  it('should display help with \'-h\'', (done) => {
    exec('node ./bin/refs.js -h', (error, stdout, stderr) => {
      should(error).be.eql(null);
      should(stdout).be.eql(stdoutContent);
      should(stderr).be.eql('');
      done();
    });
  });

  it('should display help with \'--help\'', (done) => {
    exec('node ./bin/refs.js --help', (error, stdout, stderr) => {
      should(error).be.eql(null);
      should(stdout).be.eql(stdoutContent);
      should(stderr).be.eql('');
      done();
    });
  });

  it('should display version with \'-V\'', (done) => {
    const pkgInfo = require('../package.json');

    exec('node ./bin/refs.js -V', (error, stdout, stderr) => {
      should(error).be.eql(null);
      should(stdout).be.eql(`${pkgInfo.version}\n`);
      should(stderr).be.eql('');
      done();
    });
  });

  it('should display version with \'--version\'', (done) => {
    const pkgInfo = require('../package.json');

    exec('node ./bin/refs.js --version', (error, stdout, stderr) => {
      should(error).be.eql(null);
      should(stdout).be.eql(`${pkgInfo.version}\n`);
      should(stderr).be.eql('');
      done();
    });
  });
});
