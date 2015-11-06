'use strict';

export function ensureContentTypes (space) {
  return space.getContentTypes().then((contentTypes) => {
    return Promise.all([
      ensureUser(space, contentTypes),
      ensureTag(space, contentTypes),
      ensurePost(space, contentTypes)
    ]);
  }).then((contentTypes) => {
    return {
      user: contentTypes[0],
      tag: contentTypes[1],
      post: contentTypes[2]
    };
  });
}

function ensureUser (space, contentTypes) {
  let fields = [
    { id: 'name', name: 'Name', type: 'Symbol' },
    { id: 'slug', name: 'Slug', type: 'Symbol' },
    { id: 'email', name: 'Email', type: 'Symbol' },
    { id: 'image', name: 'Image', type: 'Symbol' }
  ];

  return ensureEntity(space, contentTypes, 'User', fields);
}

function ensureTag (space, contentTypes) {
  let fields = [
    { id: 'name', name: 'Name', type: 'Symbol' },
    { id: 'slug', name: 'Slug', type: 'Symbol' }
  ];

  return ensureEntity(space, contentTypes, 'Tag', fields);
}

function ensurePost (space, contentTypes) {
  let fields = [
    { id: 'title', name: 'Title', type: 'Symbol' },
    { id: 'slug', name: 'Slug', type: 'Symbol' },
    { id: 'body', name: 'Body', type: 'Text' },
    { id: 'metaTitle', name: 'Meta Title', type: 'Symbol' },
    { id: 'metaDescription', name: 'Meta Description', type: 'Symbol' },
    { id: 'author', name: 'Author', type: 'Link', linkType: 'Entry' }
  ];

  return ensureEntity(space, contentTypes, 'Post', fields);
}

function ensureEntity (space, contentTypes, entityName, entityFields) {
  let contentType = contentTypes.find((contentType) => contentType.name === entityName);

  if (contentType) {
    console.log(`- The content type "${entityName}" already exists`);
    return contentType;
  }

  return space.createContentType({
    sys: { id: entityName.toLowerCase() },
    name: entityName,
    fields: entityFields,
    displayField: entityFields[0].id
  }).then((contentType) => {
    console.log(`- Created the content type "${entityName}"`);
    return space.publishContentType(contentType);
  }).then((contentType) => {
    console.log(`- Published the content type "${entityName}"`);
    return contentType;
  });
}
