'use strict';

import { importAsset } from './asset';

export function importData (space, data, contentTypes) {
  return space.getEntries().then((entries) => {
    return Promise.all([
      importUsers(entries, space, data, contentTypes.user),
      importTags(entries, space, data, contentTypes.tag),
      importPosts(entries, space, data, contentTypes.post)
    ]);
  });
}

function importUsers (entries, space, data, userContentType) {
  return importEntities(...arguments, 'user', (user) => {
    return {
      sys: { id: user.slug },
      fields: {
        name: { 'en-US': user.name },
        slug: { 'en-US': user.slug },
        email: { 'en-US': user.email },
        image: { 'en-US': user.image }
      }
    };
  });
}

function importTags (entries, space, data, contentTypes) {
  return importEntities(...arguments, 'tag', (tag) => {
    return {
      sys: { id: tag.slug },
      fields: {
        name: { 'en-US': tag.name },
        slug: { 'en-US': tag.slug }
      }
    };
  });
}

function importPosts (entries, space, data, contentTypes) {
  return importEntities(...arguments, 'post', (post) => {
    return replaceImagesInPost(...arguments, post)
      .then(function (post) {
        return {
          sys: { id: post.slug },
          fields: {
            title: { 'en-US': post.title },
            slug: { 'en-US': post.slug },
            body: { 'en-US': post.markdown },
            publishedAt: { 'en-US': post.published_at },
            metaTitle: { 'en-US': post.meta_title },
            metaDescription: { 'en-US': post.meta_description },
            author: {
              'en-US': {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: findUserById(data.users, post.author_id).slug
                }
              }
            }
          }
        };
      });
  });
}

function replaceImagesInPost (entries, space, data, contentTypes, post) {
  let matches = post.markdown.match(/!\[.*?\]\(.+?\)/g) || [];

  return Promise.all(matches.map((match, index) => {
    let fragments = match.match(/!\[(.*)\]\((.*)\)/);
    let title     = fragments[1] || `image-${index}`;
    let url       = (
      fragments[2].indexOf('http') === 0 ? fragments[2] : `${data.blogHost}${fragments[2]}`
    );

    return importAsset(space, post, title, url).then((asset) => {
      return [fragments[2], asset];
    }, (err) => {
      console.log(err);
      return [fragments[2], null];
    });
  })).then((assetMap) => {
    assetMap.forEach((map) => {
      let oldPath = map[0];
      let asset   = map[1];

      if (asset) {
        post.markdown = post.markdown.replace(oldPath, asset.fields.file['en-US'].url);
      }
    });

    return post;
  });
}

function findUserById (users, id) {
  return users.find((user) => (user.id === id));
}

function importEntities (entries, space, entities, entityContentType, entityName, dataMapper) {
  return Promise.all(
    entities[`${entityName}s`].map((entityData) => {
      let entity = entries.find((entry) => entry.sys.id === entityData.slug);

      if (entity) {
        console.log(`- The ${entityName} "${entityData.slug}" already exists`);
        return entity;
      }

      let mappedData = dataMapper(entityData);
      let promise    = (mappedData instanceof Promise) ? mappedData : Promise.resolve(mappedData);

      return promise
        .then((mappedData) => {
          return space.createEntry(entityContentType, mappedData);
        })
        .then((entity) => {
          console.log(`- Created ${entityName} "${entityData.slug}"`);

          if (!entityData.status || (entityData.status === 'published')) {
            return space.publishEntry(entity).then((entity) => {
              console.log(`- Published ${entityName} "${entityData.slug}"`);
              return entity;
            });
          }
        });
    })
  );
}
