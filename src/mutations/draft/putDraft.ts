import _ from 'lodash'
import * as cheerio from 'cheerio'
import { v4 } from 'uuid'

import { ItemData, MutationToPutDraftResolver } from 'definitions'
import { fromGlobalId, stripHtml, makeSummary, sanitize } from 'common/utils'
import {
  DraftNotFoundError,
  ForbiddenError,
  AssetNotFoundError,
  AuthenticationError,
  ArticleNotFoundError
} from 'common/errors'
import { PUBLISH_STATE, ARTICLE_STATE } from 'common/enums'

const resolver: MutationToPutDraftResolver = async (
  root,
  { input },
  { viewer, dataSources: { draftService, systemService, articleService } }
) => {
  const {
    id,
    title,
    content,
    tags,
    coverAssetId: coverAssetUUID,
    collection: collectionGlobalIds
  } = input
  if (!viewer.id) {
    throw new AuthenticationError('visitor has no permission')
  }

  // check for asset existence
  let coverAssetId
  if (coverAssetUUID) {
    const asset = await systemService.findAssetByUUID(coverAssetUUID)
    if (!asset || asset.type !== 'embed' || asset.authorId !== viewer.id) {
      throw new AssetNotFoundError('Asset does not exists')
    }
    coverAssetId = asset.id
  }

  // check for collection existence
  // add to dbId array if ok
  let collection = null
  if (collectionGlobalIds && collectionGlobalIds.length > 0) {
    collection = await Promise.all(
      collectionGlobalIds.map(async articleGlobalId => {
        if (!articleGlobalId) {
          throw new ArticleNotFoundError(
            `Cannot find article ${articleGlobalId}`
          )
        }
        const { id: articleId } = fromGlobalId(articleGlobalId)
        const article = await articleService.baseFindById(articleId)
        if (!article) {
          throw new ArticleNotFoundError(
            `Cannot find article ${articleGlobalId}`
          )
        } else if (article.state !== ARTICLE_STATE.active) {
          throw new ForbiddenError(
            `Article ${article.title} cannot be collected.`
          )
        } else {
          return articleId
        }
      })
    )
  }

  // assemble data
  const data: ItemData = _.omitBy(
    {
      authorId: id ? undefined : viewer.id,
      title,
      summary: content && makeSummary(content),
      content: content && sanitize(content),
      tags,
      cover: coverAssetId,
      collection
    },
    _.isNil
  )

  // Update
  if (id) {
    const { id: dbId } = fromGlobalId(id)
    const draft = await draftService.dataloader.load(dbId)

    // check for draft existence
    if (!draft) {
      throw new DraftNotFoundError('target draft does not exist')
    }

    // check for permission
    if (draft.authorId != viewer.id) {
      throw new ForbiddenError('viewer has no permission')
    }

    // check for draft state
    if (
      draft.publishState === PUBLISH_STATE.pending ||
      draft.publishState === PUBLISH_STATE.published
    ) {
      throw new ForbiddenError(
        'current publishState is not allow to be updated'
      )
    }

    // update
    return await draftService.baseUpdate(dbId, {
      updatedAt: new Date(),
      ...data
    })
  }

  // Create
  else {
    const draft = await draftService.baseCreate({ uuid: v4(), ...data })
    return draft
  }
}

export default resolver
