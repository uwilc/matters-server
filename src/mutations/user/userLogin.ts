import { getViewerFromUser, setCookie } from 'common/utils'
import { AuthMode, MutationToUserLoginResolver } from 'definitions'

const resolver: MutationToUserLoginResolver = async (
  root,
  { input },
  context
) => {
  const {
    dataSources: { userService, systemService },
    req,
    res,
  } = context

  const email = input.email ? input.email.toLowerCase() : null
  const archivedCallback = async () =>
    systemService.saveAgentHash(context.viewer.agentHash || '', email)
  const { token, user } = await userService.login({
    ...input,
    email,
    archivedCallback,
  })

  setCookie({ req, res, token, user })

  context.viewer = await getViewerFromUser(user)
  context.viewer.authMode = user.role as AuthMode
  context.viewer.scope = {}

  return { token, auth: true }
}

export default resolver
