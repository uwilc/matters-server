import { makeExecutableSchema } from 'graphql-tools'
import { merge } from 'lodash'

import { ForbiddenError, AuthenticationError } from 'common/errors'
import typeDefs from './types'
import queries from './queries'
import mutations from './mutations'
import subscriptions from './subscriptions'
import {
  DeprecatedDirective,
  PrivateDirective,
  authDirectiveFactory
} from './types/directives'

const schema = makeExecutableSchema({
  typeDefs,
  schemaDirectives: {
    deprecated: DeprecatedDirective,
    authenticate: authDirectiveFactory(AuthenticationError),
    authorize: authDirectiveFactory(ForbiddenError),
    private: PrivateDirective
  },
  resolvers: merge(queries, mutations, subscriptions)
})

export default schema
