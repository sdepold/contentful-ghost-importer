'use strict';

export function getGhostData (argv) {
  let ghostDataPath = argv._[0];
  let result = require(ghostDataPath).db[0].data;

  result.blogHost = argv.blogHost;

  return result;
}
