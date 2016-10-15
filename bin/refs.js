#!/usr/bin/env node

'use strict';

const program = require('commander');
const pkgInfo = require('../package.json');
const refs = require('..');

let inputFile = null;
let outputFile = null;

program
  .version(pkgInfo.version)
  .usage('[options] <file>')
  .option('-o, --output <file>', 'The path for the output file');

program.parse(process.argv);
if (program.args[0]) {
  inputFile = program.args[0];
}
if (program.output) {
  outputFile = program.output;
}

if (inputFile) {
  refs(inputFile, outputFile)
    .then((results) => {
      let msg = `\n  done`;
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
