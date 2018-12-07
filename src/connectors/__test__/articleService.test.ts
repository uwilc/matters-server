import { ArticleService } from '../articleService'

const articleService = new ArticleService()

test('countByAuthor', async () => {
  const count = await articleService.countByAuthor(1)
  expect(count).toBe(2)
})

test('countAppreciation', async () => {
  const appreciation = await articleService.countAppreciation(1)
  expect(appreciation).toBe(150)
})

test('countWords', async () => {
  const count = await articleService.countWords(
    '<html><body>hello world</body></html>'
  )
  expect(count).toBe(2)
})

test('findByAuthor', async () => {
  const articles = await articleService.findByAuthor(1)
  expect(articles.length).toBe(2)
})

test('findByUpstream', async () => {
  const articles = await articleService.findByUpstream(2)
  expect(articles.length).toBe(2)
})

test('findAppreciations', async () => {
  const appreciations = await articleService.findAppreciations(1)
  expect(appreciations.length).toBe(4)
})

test('countByTag', async () => {
  const count = await articleService.countByTag('article')
  expect(count).toBe(2)
})

test('findByTag', async () => {
  const articles = await articleService.findByTag('article')
  expect(articles.length).toBe(2)
})

test('findTags', async () => {
  const tags = await articleService.findTags(1)
  expect(tags).toEqual(['test', 'article'])
})

test('findSubscriptions', async () => {
  const subs = await articleService.findSubscriptions(2)
  expect(subs.length).toEqual(2)
})

test('update', async () => {
  const article = await articleService.update(1, { publishState: 'archived' })
  expect(article.publishState).toEqual('archived')
})