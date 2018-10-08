'use strict';

const Promise = require('bluebird');
const path = require('path');
const fs = require('fs');
const yamlProcessor = require('./processor-yaml');
const jsonProcessor = require('./processor-json');
const iniProcessor = require('./processor-ini');

function refs(inputFile, outputFile) {
  return new Promise((resolve, reject) => {
    try {
      let processor = {};
      if (inputFile.indexOf('.yaml') !== -1 || inputFile.indexOf('.yml') !== -1) {
        processor = yamlProcessor;
      } else if (inputFile.indexOf('.json') !== -1) {
        processor = jsonProcessor;
      } else if (inputFile.indexOf('.ini') !== -1) {
        processor = iniProcessor;
      } else {
        return reject(new Error('No valid config file found.'));
      }

      const inputFilePath = path.resolve(inputFile);
      try {
        fs.statSync(inputFilePath);
      } catch (err) {
        return reject(new Error('No such file or directory.'));
      }

      return processor.process(inputFilePath)
        .then((contentPkg) => {
          // console.log(contentPkg.dataString);
          try {
            const compiled = JSON.parse(contentPkg.dataString);
            if (outputFile) {
              const outputFilePath = path.resolve(outputFile);
              return processor.write(outputFilePath, compiled);
            }
            return processor.dump(compiled);
          } catch (err) {
            return reject(new Error('An error occurred while parsing JSON string.'));
          }
        })
        .then((results) => {
          resolve({
            outputFile: results.outputFile || null,
            content: results.content || null,
          });
        })
        .catch((err) => {
          reject(err);
        });
    } catch (err) {
      return reject(new Error(`${err}`));
    }
  });
}

module.exports = refs;
