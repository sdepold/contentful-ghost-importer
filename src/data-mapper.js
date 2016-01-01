'use strict';

import * as _ from 'lodash';

export function mapData (ghostData) {
  return {
    authors: mapAuthors(ghostData.users),
    posts: mapPosts(ghostData),
    tags: mapTags(ghostData.tags)
  };
}

export function mapAuthors (authors) {
  return authors.map((author) => {
    return _.pick(author, ['name', 'slug', 'email', 'image']);
  });
}

export function mapPosts (ghostData) {
  let authors = ghostData.users;
  let posts = ghostData.posts;

  return posts.map((post) => {
    let body = extendEmbeddedReferences(ghostData.blogHost, post.markdown);

    return {
      title: post.title,
      slug: post.slug,
      body: body,
      publishedAt: post.published_at,
      metaTitle: post.meta_title,
      metaDescription: post.meta_description,
      author: findById(authors, post.author_id).slug,
      tags: findTagsForPost(post, ghostData),
      status: post.status
    }
  });
}

export function mapTags (tags) {
  return tags.map((tag) => {
    return _.pick(tag, ['name', 'slug']);
  });
}

function findById (entities, id) {
  return entities.find((entity) => (entity.id === id));
}

function findTagsForPost (post, ghostData) {
  let postsTags = ghostData.posts_tags.filter(
    (postsTag) => postsTag.post_id === post.id
  );

  return postsTags.map((postsTag) => {
    return findById(ghostData.tags, postsTag.tag_id).slug;
  });
}

function extendEmbeddedReferences (host, markdown) {
  // Replace all image references which do not contain a host
  return markdown.replace(/\!\[(.*?)\]\((\/.*?)\)/g, (match, title, reference) => {
    return `![${title}](${host}${reference})`
  });
}
