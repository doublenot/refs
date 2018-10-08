#!/usr/bin/env node
/* eslint no-console: 0 */

'use strict';

const program = require('commander');
const pkgInfo = require('../package.json');
const refs = require('../index');

let inputFile = null;
let outputFile = null;

program
  .version(pkgInfo.version)
  .usage('[options] <file>')
  .option('-o, --output <file>', 'The path for the output file');

program.parse(process.argv);
const [firstArg] = program.args;
if (firstArg) {
  inputFile = firstArg;
}
if (program.output) {
  outputFile = program.output;
}

if (inputFile) {
  refs(inputFile, outputFile)
    .then((results) => {
      let msg = '\n  done';
      if (results.outputFile) {
        msg = `\n  done, file written: ${results.outputFile}`;
      }
      console.log(msg);
      process.exit(0);
    })
    .catch((err) => {
      console.error(`\n  ${err}`);
      process.exit(1);
    });
} else {
  program.help();
  process.exit(1);
}
