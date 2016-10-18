'use strict';

const yaml = require('node-yaml');
const Promise = require('bluebird');
const path = require('path');

const options = {
  encoding: 'utf8',
  schema: yaml.schema.defaultFull,
};

function process(filePath, key) {
  return new Promise((resolve, reject) => {
    yaml.read(filePath, options, (err, data) => {
      let returnErr = err;
      if (!err && data === undefined) {
        returnErr = 'Empty file, nothing to process.';
      }
      if (returnErr) {
        return reject(returnErr);
      }
      let dataString = JSON.stringify(data);
      const refMatches = dataString.match(/{"\$ref":"(.*?)"}/g);
      const baseDir = path.dirname(filePath);
      if (refMatches && refMatches.length > 0) {
        const yamlFileList = [];
        refMatches.forEach((matchKey) => {
          const yamlFile = matchKey.match(/{"\$ref":"(.*)"}/)[1];
          const refFilePath = path.resolve(`${baseDir}/${yamlFile}`);
          yamlFileList.push(process(refFilePath, matchKey));
        });
        return Promise.all(yamlFileList)
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
  });
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
