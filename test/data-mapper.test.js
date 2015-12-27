'use strict';

import { expect } from 'chai';
import * as sinon from 'sinon';
import * as dataMapper from '../src/data-mapper';
import { getGhostData } from '../src/helper';

let ghostSnapshot = getGhostData({
  _: [__dirname + '/fixtures/ghost-snapshot.json'],
  blogHost: 'http://blog.depold.com'
});

describe('data-mapper', () => {
  describe('mapAuthors', () => {
    it('maps the authors', () => {
      expect(
        dataMapper.mapAuthors(ghostSnapshot.users)
      ).to.eql([{
        email: 'sascha@depold.com',
        image: '//www.gravatar.com/avatar/f30479a06db175157387334e03766420?d=404&s=250',
        name: 'Sascha Depold',
        slug: 'sascha-depold'
      }])
    });
  });

  describe('mapTags', () => {
    it('maps the tags', () => {
      expect(
        dataMapper.mapTags(ghostSnapshot.tags)
      ).to.eql([{
        name: 'content management',
        slug: 'content-management'
      },
      {
        name: 'ruby',
        slug: 'ruby'
      },
      {
        name: 'service',
        slug: 'service'
      }])
    });
  });

  describe('mapPosts', () => {
    it('maps the posts', () => {
      let mappedPosts = dataMapper.mapPosts(ghostSnapshot);
      let mappedPost = mappedPosts[0];

      expect(mappedPosts.length).to.equal(1);

      expect(mappedPost.author).to.equal('sascha-depold');
      expect(mappedPost.body)
        .to.contain('Lately I was playing with the content management service')
        .and.to.contain('![The post listing page](http://blog.depold.com/content/images/2014');
      expect(mappedPost.metaDescription).to.equal(null);
      expect(mappedPost.metaTitle).to.equal(null);
      expect(mappedPost.publishedAt).to.equal('2014-08-19T15:45:03.000Z');
      expect(mappedPost.slug).to.equal('contentful-ruby-apps');
      expect(mappedPost.tags).to.eql(['content-management', 'ruby', 'service']);
      expect(mappedPost.title).to.equal('Contentful ruby apps');
    });
  });
});
