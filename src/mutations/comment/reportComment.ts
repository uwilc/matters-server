import { MutationToReportCommentResolver } from 'definitions'
import { fromGlobalId } from 'common/utils'

const resolver: MutationToReportCommentResolver = async (
  root,
  { input: { id, category, description, contact, assetIds: assetUUIDs } },
  { viewer, dataSources: { commentService, systemService } }
) => {
  if (!viewer.id && !contact) {
    throw new Error('"contact" is required with anonymous user') // TODO
  }

  const { id: dbId } = fromGlobalId(id)
  const comment = await commentService.dataloader.load(dbId)
  if (!comment) {
    throw new Error('target comment does not exists') // TODO
  }

  let assetIds
  if (assetUUIDs) {
    const assets = await systemService.findAssetByUUIDs(assetUUIDs)
    if (!assets || assets.length <= 0) {
      throw new Error('Asset does not exists') // TODO
    }
    assetIds = assets.map((asset: any) => asset.id)
  }

  await commentService.report({
    commentId: comment.id,
    userId: viewer.id,
    category,
    description,
    contact,
    assetIds
  })

  return true
}

export default resolver