'use strict';

const Promise = require('bluebird');
const fs = require('fs');
const ini = require('ini');
const extract = require('./utils/extract');
const transform = require('./utils/transform');

function process(filePath, key) {
  return extract(filePath, ini.parse)
    .then((dataString) => {
      if (dataString.indexOf('$merge') !== -1) {
        return Promise.reject(new Error('INI config does not support $merge settings.'));
      }
      return transform(dataString, key, filePath, process);
    });
}

function write(outputFile, compiled) {
  return new Promise((resolve, reject) => {
    fs.writeFile(outputFile, ini.stringify(compiled), 'utf-8', (err) => {
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
        content: ini.stringify(compiled),
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
