import { CommentService } from '../commentService'

const commentService = new CommentService()

test('countByAuthor', async () => {
  const count = await commentService.countByAuthor(1)
  expect(count).toBe(2)
})

test('countByArticle', async () => {
  const count = await commentService.countByArticle(3)
  expect(count).toBe(2)
})

test('countByParent', async () => {
  const count = await commentService.countByParent(1)
  expect(count).toBe(1)
})

test('countUpVote', async () => {
  const count = await commentService.countUpVote(1)
  expect(count).toBe(1)
})

test('countDownVote', async () => {
  const count = await commentService.countDownVote(3)
  expect(count).toBe(0)
})

test('findByAuthor', async () => {
  const comments = await commentService.findByAuthor(1)
  expect(comments.length).toBe(2)
})

test('findByArticle', async () => {
  const comments = await commentService.findByArticle(3)
  expect(comments.length).toBe(2)
})

test('findPinnedByArticle', async () => {
  const comments = await commentService.findPinnedByArticle(3)
  expect(comments.length).toBe(1)
})

test('findByParent', async () => {
  const comments = await commentService.findByParent(1)
  expect(comments.length).toBe(1)
})

test('findUpVotes', async () => {
  const votes = await commentService.findUpVotes(1)
  expect(votes.length).toBe(1)
})

test('findDownVotes', async () => {
  const votes = await commentService.findDownVotes(3)
  expect(votes.length).toBe(0)
})