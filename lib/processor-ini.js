'use strict';

const Promise = require('bluebird');
const path = require('path');
const fs = require('fs');
const ini = require('ini');

function process(filePath, key) {
  return new Promise((resolve, reject) => {
    let fileData = '';
    let data = {};
    try {
      fileData = fs.readFileSync(filePath, 'utf-8');
      data = ini.parse(fileData);
    } catch (err) {
      let returnErr = err;
      if (fileData === '') {
        returnErr = 'Empty file, nothing to process.';
      }
      return reject(returnErr);
    }
    let dataString = JSON.stringify(data);
    const refMatches = dataString.match(/{"\$ref":"(.*?)"}/g);
    const baseDir = path.dirname(filePath);
    if (refMatches && refMatches.length > 0) {
      const iniFileList = [];
      refMatches.forEach((matchKey) => {
        const iniFile = matchKey.match(/{"\$ref":"(.*)"}/)[1];
        const refFilePath = path.resolve(`${baseDir}/${iniFile}`);
        iniFileList.push(process(refFilePath, matchKey));
      });
      return Promise.all(iniFileList)
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
      reject(`${err}`);
    }
  });
}

module.exports = {
  process,
  dump,
  write,
};
