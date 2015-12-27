'use strict';

import ContentfulBlogImporter from 'contentful-blog-importer';

import { getGhostData } from './helper';
import { mapData } from './data-mapper';

export function run (argv) {
  let ghostData  = getGhostData(argv);
  let mappedData = mapData(ghostData);

  return new ContentfulBlogImporter(
    argv.spaceId,
    argv.token,
    { host: argv.host }
  ).run(mappedData);
}
