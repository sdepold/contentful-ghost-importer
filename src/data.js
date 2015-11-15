'use strict';

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

      return space
        .createEntry(entityContentType, dataMapper(entityData))
        .catch(console.log)
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
