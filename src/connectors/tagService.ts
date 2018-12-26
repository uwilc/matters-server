// external
import DataLoader from 'dataloader'
// internal
import { GQLSearchInput } from 'definitions'
import { BaseService } from './baseService'
import { BATCH_SIZE } from 'common/enums'

export class TagService extends BaseService {
  constructor() {
    super('tag')
    this.dataloader = new DataLoader(this.baseFindByIds)
  }

  create = async ({
    content
  }: {
    content: string
  }): Promise<{ id: string; content: string }> => {
    const [tag] = await this.findByContent(content)
    if (tag) {
      return tag
    }
    return await this.baseCreate({
      content
    })
  }

  search = async ({ key, limit = 10, offset = 0 }: GQLSearchInput) => {
    const tags = await this.knex(this.table).where(
      'content',
      'like',
      `%${key}%`
    )

    return tags.map((tag: { [key: string]: string }) => ({
      node: { ...tag, __type: 'Tag' },
      match: key
    }))
  }

  createArticleTag = async ({
    articleId,
    tagId
  }: {
    articleId: string
    tagId: string
  }) => this.knex('article_tag').insert({ articleId, tagId })

  findByContent = async (content: string) =>
    this.knex(this.table)
      .select()
      .where({ content })

  recommendTags = async ({ offset = 0, limit = 5 }) =>
    await this.knex
      .select()
      .from(this.table)
      .orderBy('id', 'desc')
      .offset(offset)
      .limit(limit)

  /**
   * Count tags by a given tag text.
   */
  countArticles = async ({ id: tagId }: { id: string }): Promise<number> => {
    const result = await this.knex('article_tag')
      .countDistinct('article_id')
      .where({ tagId })
      .first()
    return parseInt(result.count, 10)
  }

  findArticleIds = async ({
    id: tagId,
    offset = 0,
    limit = BATCH_SIZE
  }: {
    id: string
    offset?: number
    limit?: number
  }) => {
    const result = await this.knex
      .select('article_id')
      .from('article_tag')
      .where({ tagId })
      .offset(offset)
      .limit(limit)

    return result.map(({ articleId }: { articleId: string }) => articleId)
  }
}
