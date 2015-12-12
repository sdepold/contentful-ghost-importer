'use strict';

let mime     = require('mime');
let parseUrl = require('url').parse;
let questor  = require('questor');
let retry    = require('retry');
let slug     = require('slug');

export function importAsset (space, post, title, url) {
  let id = `${post.slug}-${slug(title)}`.toLowerCase();

  return remoteResourceExists(url).then(function () {
    return space.getAsset(id).then(function (asset) {
      console.log(`- The asset "${id}" already exists`);
      return asset;
    }, function () {
      let urlPath  = parseUrl(url).pathname;
      let mimeType = mime.lookup(urlPath);

      return space.createAsset({
        sys: { id: id },
        fields: {
          title: { 'en-US': title },
          file: {
            'en-US': {
              upload: url,
              contentType: mimeType,
              fileName: `${id}.${mime.extension(mimeType)}`
            }
          }
        }
      }).then(function (asset) {
        console.log(`- Created asset "${id}"`);
        return asset;
      });
    }).then(function (asset) {
      if (isProcessedAsset(asset)) {
        console.log(`- The asset "${id}" is already processed`);
        return asset;
      } else {
        return processAsset(space, asset).then(function (asset) {
          console.log(`- Processed asset "${id}"`);
          return asset;
        });
      }
    }).then(function (asset) {
      return space.publishAsset(asset).then(function (asset) {
        console.log(`- Published asset "${id}"`);
        return asset;
      });
    });
  });
}

function remoteResourceExists (url) {
  return questor(url, { method: 'HEAD' });
}

function isProcessedAsset (asset) {
  return !!asset.fields.file['en-US'].url;
}

function processAsset (space, asset) {
  return space.processAssetFile(asset, 'en-US').then(function () {
    return waitForAssetProcessing(space, asset.sys.id);
  });
}

function waitForAssetProcessing (space, assetId) {
  return new Promise((resolve, reject) => {
    let operation = retry.operation();

    operation.attempt(() => {
      space.getAsset(assetId).then((asset) => {
        if (isProcessedAsset(asset)) {
          return resolve(asset);
        }

        let err = new Error('Asset not yet processed!');

        if (!operation.retry(err)) {
          reject(err);
        }
      });
    });
  });
}
