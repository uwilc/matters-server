import { Resolver } from 'src/definitions'
import { USER_ACTION } from 'src/common/enums'

const resolver: Resolver = ({ id }, _, { actionService }) => {
  return actionService.countActionByTarget(USER_ACTION.follow, id)
}

export default resolver