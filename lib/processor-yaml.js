'use strict';

const yaml = require('node-yaml');
const Promise = require('bluebird');
// const path = require('path');
// const extract = require('./utils/extract');
const transform = require('./utils/transform');

const options = {
  encoding: 'utf8',
};

function parser(filePath) {
  return yaml.read(filePath, options);
}

function process(filePath, key) {
  if (!filePath) {
    return Promise.reject(new Error('Requires a file path to process.'));
  }

  return parser(filePath).then((dataString) => transform(JSON.stringify(dataString), key, filePath, process));
}

function write(outputFile, compiled) {
  return new Promise((resolve, reject) => {
    yaml.write(outputFile, compiled, options, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          outputFile,
        });
      }
    });
  });
}

function dump(compiled) {
  return new Promise((resolve, reject) => {
    try {
      resolve({
        content: yaml.dump(compiled),
      });
    } catch (err) {
      reject(new Error(`${err}`));
    }
  });
}

module.exports = {
  process,
  dump,
  write,
};
