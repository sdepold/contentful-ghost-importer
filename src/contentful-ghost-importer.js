'use strict';

import { importData } from './data';
import { getClient, getGhostData } from './helper';
import { ensureContentTypes } from './schema';

export function run (argv) {
  const client = getClient(argv);

  return client
    .getSpace(argv.spaceId)
    .then((space) => {
      let ghostData = getGhostData(argv);

      return ensureContentTypes(space)
        .then((contentTypes) => {
          return importData(space, ghostData, contentTypes);
        });
    });
}
