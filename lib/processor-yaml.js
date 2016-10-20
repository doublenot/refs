'use strict';

const yaml = require('node-yaml');
const Promise = require('bluebird');
// const path = require('path');
const extract = require('./utils/extract');
const transform = require('./utils/transform');

const options = {
  encoding: 'utf8',
  schema: yaml.schema.defaultFull,
};

function parser(data) {
  return yaml.parse(data, options);
}

function process(filePath, key) {
  return extract(filePath, parser)
    .then(dataString => transform(dataString, key, filePath, process));
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
      reject(`${err}`);
    }
  });
}

module.exports = {
  process,
  dump,
  write,
};
