'use strict';

import * as contentful from 'contentful-management';

export function getClient (argv) {
  return contentful.createClient({
    accessToken: argv.token,
    host: argv.host
  });
}

export function getGhostData (argv) {
  var ghostDataPath = argv._[0];

  return require(ghostDataPath).db[0].data;
}
