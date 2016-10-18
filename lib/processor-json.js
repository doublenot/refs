'use strict';

const Promise = require('bluebird');
const path = require('path');
const fs = require('fs');

function process(filePath, key) {
  return new Promise((resolve, reject) => {
    let dataString = '';
    try {
      dataString = fs.readFileSync(filePath, 'utf-8');
      const parsedData = JSON.parse(dataString);
      dataString = JSON.stringify(parsedData);
    } catch (err) {
      let returnErr = err;
      if (dataString === '') {
        returnErr = 'Empty file, nothing to process.';
      }
      return reject(returnErr);
    }

    const refMatches = dataString.match(/{"\$ref":"(.*?)"}/g);
    const baseDir = path.dirname(filePath);
    if (refMatches && refMatches.length > 0) {
      const jsonFileList = [];
      refMatches.forEach((matchKey) => {
        const jsonFile = matchKey.match(/{"\$ref":"(.*)"}/)[1];
        const refFilePath = path.resolve(`${baseDir}/${jsonFile}`);
        jsonFileList.push(process(refFilePath, matchKey));
      });
      return Promise.all(jsonFileList)
        .then((results) => {
          results.forEach((result) => {
            dataString = dataString.replace(result.key, result.dataString);
          });
          resolve({
            dataString,
            key,
          });
        });
    }
    return resolve({
      dataString,
      key,
    });
  });
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
