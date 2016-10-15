'use strict';

const yaml = require('node-yaml');
const Promise = require('bluebird');
const path = require('path');

const options = {
  encoding: 'utf8',
  schema: yaml.schema.defaultFull,
};

function getYamlFile(filePath, key) {
  return new Promise((resolve, reject) => {
    yaml.read(filePath, options, (err, data) => {
      if (err) {
        return reject(err);
      }
      let dataString = JSON.stringify(data);
      const refMatches = dataString.match(/{"\$ref":"(.*?)"}/g);
      const baseDir = path.dirname(filePath);
      if (refMatches && refMatches.length > 0) {
        const yamlFileList = [];
        refMatches.forEach((matchKey) => {
          const yamlFile = matchKey.match(/{"\$ref":"(.*)"}/)[1];
          const filePath = path.resolve(`${baseDir}/${yamlFile}`);
          yamlFileList.push(getYamlFile(filePath, matchKey));
        });
        Promise.all(yamlFileList)
          .then((results) => {
            results.forEach((result) => {
              dataString = dataString.replace(result.key, result.dataString);
            });
            resolve({
              dataString,
              key,
            });
        })
      } else {
        resolve({
          dataString,
          key,
        });
      }
    });
  });
}

function refs(inputFile, outputFile) {
  return new Promise((resolve, reject) => {
    try {
      getYamlFile(path.resolve(inputFile))
        .then((yamlPkg) => {
          // console.log(yamlPkg.dataString);
          const compiled = JSON.parse(yamlPkg.dataString);
          if (outputFile) {
            const outputFilePath = path.resolve(outputFile);
            yaml.write(outputFilePath, compiled, options, () => {
              resolve({
                outputFile: outputFilePath,
                content: null,
              })
            });
          } else {
            resolve({
              outputFile: null,
              content: yaml.dump(compiled),
            });
          }
        });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = refs;
