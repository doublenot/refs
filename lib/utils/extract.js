'use strict';

const Promise = require('bluebird');
const fs = require('fs');


function extract(filePath, parser) {
  return new Promise((resolve, reject) => {
    if (!filePath || filePath === undefined) {
      return reject(new Error('Requires a file path to process.'));
    }
    let fileData = '';
    let data = {};
    try {
      fileData = fs.readFileSync(filePath, 'utf-8');
      if (fileData === '') {
        throw new Error('Empty file, nothing to process.');
      }
      data = parser(fileData);
    } catch (err) {
      return reject(err);
    }
    return resolve(JSON.stringify(data));
  });
}

module.exports = extract;
