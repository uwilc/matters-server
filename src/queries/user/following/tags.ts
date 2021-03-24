import { TAG_ACTION } from 'common/enums'
import {
  connectionFromArray,
  connectionFromPromisedArray,
  cursorToIndex,
} from 'common/utils'
import { FollowingToTagsResolver } from 'definitions'

const resolver: FollowingToTagsResolver = async (
  { id },
  { input },
  { dataSources: { atomService, tagService } }
) => {
  if (!id) {
    return connectionFromArray([], input)
  }

  const { first: take, after } = input
  const skip = cursorToIndex(after) + 1
  const [totalCount, actions] = await Promise.all([
    atomService.count({
      table: 'action_tag',
      where: { userId: id, action: TAG_ACTION.follow },
    }),
    atomService.findMany({
      table: 'action_tag',
      select: ['target_id'],
      where: { userId: id, action: TAG_ACTION.follow },
      skip,
      take,
    }),
  ])

  return connectionFromPromisedArray(
    tagService.dataloader.loadMany(actions.map(({ targetId }) => targetId)),
    input,
    totalCount
  )
}

export default resolver
