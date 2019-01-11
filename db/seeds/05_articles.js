const table = 'article'

exports.seed = function(knex, Promise) {
  return knex(table)
    .del()
    .then(function() {
      return knex(table).insert([
        {
          uuid: '00000000-0000-0000-0000-000000000001',
          author_id: 1,
          draft_id: 1,
          title: 'test article 1',
          slug: 'test-article-1',
          summary: 'Some text',
          word_count: '1000',
          data_hash: 'some-ipfs-data-hash-1',
          media_hash: 'some-ipfs-media-hash-1',
          content: '<div>some html string</div>',
          state: 'active'
        },
        {
          uuid: '00000000-0000-0000-0000-000000000002',
          author_id: 2,
          draft_id: 2,
          upstream_id: 1,
          title: 'test article 2',
          slug: 'test-article-2',
          summary: 'Some text',
          word_count: '1000',
          data_hash: 'some-ipfs-data-hash-2',
          media_hash: 'some-ipfs-media-hash-2',
          content: '<div>some html string</div>',
          state: 'active'
        },
        {
          uuid: '00000000-0000-0000-0000-000000000003',
          author_id: 3,
          draft_id: 3,
          upstream_id: 2,
          title: 'test article 3',
          slug: 'test-article-3',
          summary: 'Some text',
          word_count: '1000',
          data_hash: 'some-ipfs-data-hash-3',
          media_hash: 'some-ipfs-media-hash-3',
          content: '<div>some html string</div>',
          state: 'active'
        },
        {
          uuid: '00000000-0000-0000-0000-000000000004',
          author_id: 1,
          upstream_id: 2,
          title: 'test article 4',
          slug: 'test-article-4',
          summary: 'Some text',
          word_count: '1000',
          data_hash: 'some-ipfs-data-hash-4',
          media_hash: 'some-ipfs-media-hash-4',
          content: '<div>some html string</div>',
          state: 'active'
        }
      ])
    })
}