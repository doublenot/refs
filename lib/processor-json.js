'use strict';

const Promise = require('bluebird');
// const path = require('path');
const fs = require('fs');
const extract = require('./utils/extract');
const transform = require('./utils/transform');

function process(filePath, key) {
  return extract(filePath, JSON.parse)
    .then(dataString => transform(dataString, key, filePath, process));
}

function write(outputFile, compiled) {
  return new Promise((resolve, reject) => {
    fs.writeFile(outputFile, compiled, 'utf-8', (err) => {
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
  return new Promise((resolve) => {
    resolve({
      content: JSON.stringify(compiled),
    });
  });
}

module.exports = {
  process,
  dump,
  write,
};
