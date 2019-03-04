'use strict';

const Promise = require('bluebird');
const path = require('path');

function transform(dataStr, key, filePath, process) {
  return new Promise((resolve, reject) => {
    let dataString = dataStr;
    const refMatches = dataString.match(/{"\$ref":"(?!#)(.*?)"}/g);
    const baseDir = path.dirname(filePath);
    if (refMatches && refMatches.length > 0) {
      const refFileList = [];
      refMatches.forEach((matchKey) => {
        const refFile = matchKey.match(/{"\$ref":"(.*)"}/)[1];
        const refFilePath = path.resolve(`${baseDir}/${refFile}`);
        refFileList.push(process(refFilePath, matchKey));
      });
      return Promise.all(refFileList)
        .then((results) => {
          const mergeMatches = dataString.match(/{"\$merge":\[(.*?)\]}/g);
          if (mergeMatches && mergeMatches.length > 0) {
            mergeMatches.forEach((mergeMatchKey) => {
              const localMatches = [];
              const localRefMatches = mergeMatchKey.match(/{"\$ref":"(.*?)"}/g);
              if (!localRefMatches || localRefMatches.length === 0) {
                reject(new Error('Malformed merge setting, please check the input file.'));
                return;
              }
              localRefMatches.forEach((refMatchKey) => {
                const j = results.length;
                for (let i = 0; i < j; i += 1) {
                  const result = results[i];
                  if (result.key === refMatchKey) {
                    const end = (result.dataString.length - 2);
                    localMatches.push(result.dataString.substr(1, end));
                    break;
                  }
                }
              });
              const localMatchesStr = `{${localMatches.join(',')}}`;
              dataString = dataString.replace(mergeMatchKey, localMatchesStr);
            });
          } else {
            results.forEach((result) => {
              dataString = dataString.replace(result.key, result.dataString);
            });
          }
          return resolve({
            dataString,
            key,
          });
        });
    }
    const mergeMatches = dataString.match(/{"\$merge":\[(.*?)\]}/g);
    if (mergeMatches && mergeMatches.length > 0) {
      return reject(new Error('Malformed merge setting, please check the input file.'));
    }
    return resolve({
      dataString,
      key,
    });
  });
}

module.exports = transform;
