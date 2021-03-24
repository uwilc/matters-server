import _get from 'lodash/get'
import _values from 'lodash/values'

import { MATERIALIZED_VIEW, VERIFICATION_CODE_STATUS } from 'common/enums'
import { fromGlobalId, toGlobalId } from 'common/utils'
import { refreshView, UserService } from 'connectors'
import { MaterializedView } from 'definitions'

import {
  defaultTestUser,
  getUserContext,
  registerUser,
  testClient,
  updateUserState,
} from './utils'

let userService: any
beforeAll(async () => {
  userService = new UserService()
  // await userService.initSearch()
})

const USER_LOGIN = /* GraphQL */ `
  mutation UserLogin($input: UserLoginInput!) {
    userLogin(input: $input) {
      auth
      token
    }
  }
`

const TOGGLE_FOLLOW_USER = /* GraphQL */ `
  mutation($input: ToggleItemInput!) {
    toggleFollowUser(input: $input) {
      id
      isFollowee
    }
  }
`

const TOGGLE_BLOCK_USER = /* GraphQL */ `
  mutation($input: ToggleItemInput!) {
    toggleBlockUser(input: $input) {
      id
      isBlocked
    }
  }
`

const UPDATE_USER_INFO_DESCRIPTION = /* GraphQL */ `
  mutation UpdateUserInfo($input: UpdateUserInfoInput!) {
    updateUserInfo(input: $input) {
      info {
        description
      }
    }
  }
`
const UPDATE_USER_INFO_AVATAR = /* GraphQL */ `
  mutation UpdateUserInfo($input: UpdateUserInfoInput!) {
    updateUserInfo(input: $input) {
      id
      avatar
    }
  }
`
const UPDATE_NOTIFICARION_SETTINGS = /* GraphQL */ `
  mutation UpdateNotificationSetting($input: UpdateNotificationSettingInput!) {
    updateNotificationSetting(input: $input) {
      settings {
        notification {
          enable
        }
      }
    }
  }
`
const GET_USER_BY_USERNAME = /* GraphQL */ `
  query($input: UserInput!) {
    user(input: $input) {
      id
      userName
    }
  }
`

const GET_VIEWER_INFO = /* GraphQL */ `
  query {
    viewer {
      uuid
      avatar
      displayName
      info {
        email
        description
        createdAt
        agreeOn
      }
    }
  }
`
const GET_VIEW_ARTICLES = /* GraphQL */ `
  query($input: ConnectionArgs!) {
    viewer {
      articles(input: $input) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`
const GET_VIEWER_SETTINGS = /* GraphQL */ `
  query {
    viewer {
      settings {
        language
        notification {
          enable
        }
      }
    }
  }
`

const GET_VIEWER_SUBSCRIPTIONS = /* GraphQL */ `
  query($input: ConnectionArgs!) {
    viewer {
      subscriptions(input: $input) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`
const GET_VIEWER_FOLLOWERS = /* GraphQL */ `
  query($input: ConnectionArgs!) {
    viewer {
      followers(input: $input) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`
const GET_VIEWER_FOLLOWEES = /* GraphQL */ `
  query($input: ConnectionArgs!) {
    viewer {
      followees(input: $input) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`
const GET_VIEWER_FOLLOWINGS = /* GraphQL */ `
  query($input: ConnectionArgs!) {
    viewer {
      following {
        circles(input: $input) {
          edges {
            node {
              id
            }
          }
        }
        tags(input: $input) {
          edges {
            node {
              id
            }
          }
        }
        users(input: $input) {
          edges {
            node {
              id
            }
          }
        }
      }
    }
  }
`
const GET_VIEWER_STATUS = /* GraphQL */ `
  query {
    viewer {
      status {
        articleCount
        commentCount
      }
    }
  }
`
const GET_VIEWER_RECOMMENDATION = (list: string) => `
query($input: ConnectionArgs!) {
  viewer {
    recommendation {
      ${list}(input: $input) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
}
`

const GET_VIEWER_RECOMMENDATION_TAGS = `
query($input: RecommendInput!) {
  viewer {
    recommendation {
      tags(input: $input) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
}
`

const GET_AUTHOR_RECOMMENDATION = (list: string) => `
query($input: RecommendInput!) {
  viewer {
    recommendation {
      ${list}(input: $input) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
}
`

const GET_VIEWER_BADGES = /* GraphQL */ `
  query {
    viewer {
      info {
        badges {
          type
        }
      }
    }
  }
`

const SEND_VERIFICATION_CODE = /* GraphQL */ `
  mutation SendVerificationCode($input: SendVerificationCodeInput!) {
    sendVerificationCode(input: $input)
  }
`
const CONFIRM_VERIFICATION_CODE = /* GraphQL */ `
  mutation ConfirmVerificationCode($input: ConfirmVerificationCodeInput!) {
    confirmVerificationCode(input: $input)
  }
`

describe('register and login functionarlities', () => {
  test('register user and retrieve info', async () => {
    const email = `test-${Math.floor(Math.random() * 100)}@matters.news`
    const code = await userService.createVerificationCode({
      type: 'register',
      email,
    })
    await userService.markVerificationCodeAs({
      codeId: code.id,
      status: 'verified',
    })
    const user = {
      email,
      displayName: 'testUser',
      password: 'Abcd1234',
      codeId: code.uuid,
    }
    const registerResult = await registerUser(user)
    expect(_get(registerResult, 'data.userRegister.token')).toBeTruthy()

    const context = await getUserContext({ email: user.email })
    const { query } = await testClient({
      context,
    })
    const newUserResult = await query({
      query: GET_VIEWER_INFO,
    })
    const displayName = _get(newUserResult, 'data.viewer.displayName')
    const info = _get(newUserResult, 'data.viewer.info')
    expect(displayName).toBe(user.displayName)
    expect(info.email).toBe(user.email)
  })

  test('auth fail when password is incorrect', async () => {
    const email = 'test1@matters.news'
    const password = 'wrongPassword'
    const { mutate } = await testClient()

    const result = await mutate({
      mutation: USER_LOGIN,
      // @ts-ignore
      variables: { input: { email, password } },
    })
    expect(_get(result, 'errors.0.extensions.code')).toBe(
      'USER_PASSWORD_INVALID'
    )
  })

  test('auth success when password is correct', async () => {
    const email = 'test1@matters.news'
    const password = '12345678'

    const { mutate } = await testClient()
    const result = await mutate({
      mutation: USER_LOGIN,
      // @ts-ignore
      variables: { input: { email, password } },
    })
    expect(_get(result, 'data.userLogin.auth')).toBe(true)
  })

  test('retrive user info after login', async () => {
    const { query } = await testClient({
      isAuth: true,
    })
    const { data } = await query({
      query: GET_VIEWER_INFO,
    })
    const info = _get(data, 'viewer.info')
    expect(info.email).toEqual(defaultTestUser.email)
  })
})

describe('user query fields', () => {
  test('get user by username', async () => {
    const userName = 'test1'
    const { query } = await testClient()
    const { data } = await query({
      query: GET_USER_BY_USERNAME,
      // @ts-ignore
      variables: { input: { userName } },
    })
    expect(_get(data, 'user.userName')).toBe(userName)
  })
  test('retrive user articles', async () => {
    const { query } = await testClient({
      isAuth: true,
    })
    const result = await query({
      query: GET_VIEW_ARTICLES,
      // @ts-ignore
      variables: { input: { first: 1 } },
    })
    const { data } = result
    const articles = _get(data, 'viewer.articles.edges')
    expect(articles.length).toBeDefined()
    expect(articles[0].node.id).toBeDefined()
  })

  test('retrive UserSettings', async () => {
    const { query } = await testClient({
      isAuth: true,
    })
    const res = await query({
      query: GET_VIEWER_SETTINGS,
    })
    const { data } = res
    const settings = _get(data, 'viewer.settings')
    expect(settings).toBeDefined()
    expect(settings.notification).toBeDefined()
  })

  test('retrive subscriptions', async () => {
    const { query } = await testClient({
      isAuth: true,
    })
    const { data } = await query({
      query: GET_VIEWER_SUBSCRIPTIONS,
      // @ts-ignore
      variables: { input: {} },
    })
    const subscriptions = _get(data, 'viewer.subscriptions.edges')
    expect(subscriptions.length).toBeTruthy()
  })

  test('retrive followers', async () => {
    const { query } = await testClient({
      isAuth: true,
    })
    const { data } = await query({
      query: GET_VIEWER_FOLLOWERS,
      // @ts-ignore
      variables: { input: {} },
    })
    const followers = _get(data, 'viewer.followers.edges')
    expect(followers).toBeDefined()
  })

  test('retrive followees', async () => {
    const { query } = await testClient({
      isAuth: true,
    })
    const { data } = await query({
      query: GET_VIEWER_FOLLOWEES,
      // @ts-ignore
      variables: { input: {} },
    })
    const followees = _get(data, 'viewer.followees.edges')
    expect(followees.length).toBeTruthy()
  })

  test('retrive following', async () => {
    const { query } = await testClient({
      isAuth: true,
    })
    const { data } = await query({
      query: GET_VIEWER_FOLLOWINGS,
      // @ts-ignore
      variables: { input: {} },
    })
    const circles = _get(data, 'viewer.following.circles.edges')
    const users = _get(data, 'viewer.following.users.edges')
    const tags = _get(data, 'viewer.following.tags.edges')
    expect(circles.length).toBe(0)
    expect(users.length).toBeTruthy()
    expect(tags.length).toBeTruthy()
  })

  test('retrive UserStatus', async () => {
    const { query } = await testClient({
      isAuth: true,
    })
    const { data } = await query({
      query: GET_VIEWER_STATUS,
    })
    const status = _get(data, 'viewer.status')
    expect(status).toBeDefined()
  })
})

describe('mutations on User object', () => {
  test('follow a user with `toggleFollowUser`', async () => {
    const followeeId = toGlobalId({ type: 'User', id: '4' })
    const { mutate } = await testClient({ isAuth: true })
    const result = await mutate({
      mutation: TOGGLE_FOLLOW_USER,
      // @ts-ignore
      variables: {
        input: {
          id: followeeId,
          enabled: true,
        },
      },
    })
    expect(_get(result.data, 'toggleFollowUser.isFollowee')).toBe(true)
  })

  test('unfollow a user with `toggleFollowUser`', async () => {
    const followeeId = toGlobalId({ type: 'User', id: '4' })
    const { mutate } = await testClient({ isAuth: true })
    const { data } = await mutate({
      mutation: TOGGLE_FOLLOW_USER,
      // @ts-ignore
      variables: {
        input: {
          id: followeeId,
          enabled: false,
        },
      },
    })
    expect(_get(data, 'toggleFollowUser.isFollowee')).toBe(false)
  })

  test('block a user with `toggleBlockUser`', async () => {
    const blockUserId = toGlobalId({ type: 'User', id: '2' })
    const { mutate } = await testClient({ isAuth: true })
    const result = await mutate({
      mutation: TOGGLE_BLOCK_USER,
      // @ts-ignore
      variables: {
        input: {
          id: blockUserId,
          enabled: true,
        },
      },
    })
    expect(_get(result.data, 'toggleBlockUser.isBlocked')).toBe(true)
  })

  test('block a user with `toggleBlockUser`', async () => {
    const blockUserId = toGlobalId({ type: 'User', id: '2' })
    const { mutate } = await testClient({ isAuth: true })
    const result = await mutate({
      mutation: TOGGLE_BLOCK_USER,
      // @ts-ignore
      variables: {
        input: {
          id: blockUserId,
          enabled: false,
        },
      },
    })
    expect(_get(result.data, 'toggleBlockUser.isBlocked')).toBe(false)
  })

  test('updateUserInfoDescription', async () => {
    const description = 'foo bar'
    const { mutate } = await testClient({
      isAuth: true,
    })
    const { data } = await mutate({
      mutation: UPDATE_USER_INFO_DESCRIPTION,
      // @ts-ignore
      variables: { input: { description } },
    })
    const info = _get(data, 'updateUserInfo.info')
    expect(info.description).toEqual(description)
  })

  test('updateUserInfoAvatar', async () => {
    const avatarAssetUUID = '00000000-0000-0000-0000-000000000001'
    const { mutate } = await testClient({
      isAuth: true,
    })
    const { data } = await mutate({
      mutation: UPDATE_USER_INFO_AVATAR,
      // @ts-ignore
      variables: { input: { avatar: avatarAssetUUID } },
    })
    const avatar = _get(data, 'updateUserInfo.avatar')
    expect(avatar).toEqual(expect.stringContaining('path/to/file.jpg'))
  })

  test('updateNotificationSetting', async () => {
    const { mutate } = await testClient({
      isAuth: true,
    })
    const { data } = await mutate({
      mutation: UPDATE_NOTIFICARION_SETTINGS,
      // @ts-ignore
      variables: { input: { type: 'enable', enabled: false } },
    })
    const enable = _get(
      data,
      'updateNotificationSetting.settings.notification.enable'
    )
    expect(enable).toBe(false)
  })
})

describe('user recommendations', () => {
  test('retrive articles from hottest, icymi, topics, followeeArticles, newest and valued', async () => {
    await Promise.all(
      _values(MATERIALIZED_VIEW).map((view) =>
        refreshView(view as MaterializedView)
      )
    )

    const lists = [
      'hottest',
      'icymi',
      'topics',
      'followeeArticles',
      'newest',
      'valued',
    ]
    for (const list of lists) {
      const { query: queryNew } = await testClient({
        isAuth: true,
      })

      const result = await queryNew({
        query: GET_VIEWER_RECOMMENDATION(list),
        // @ts-ignore
        variables: { input: { first: 1 } },
      })
      const { data } = result
      const article = _get(data, `viewer.recommendation.${list}.edges.0.node`)
      expect(fromGlobalId(article.id).type).toBe('Article')
    }
  })

  test('retrive tags from tags', async () => {
    const { query: queryNew } = await testClient({
      isAuth: true,
    })
    const { data } = await queryNew({
      query: GET_VIEWER_RECOMMENDATION_TAGS,
      // @ts-ignore
      variables: { input: { first: 1 } },
    })
    const tag = _get(data, 'viewer.recommendation.tags.edges.0.node')
    expect(fromGlobalId(tag.id).type).toBe('Tag')
  })

  test('retrive users from authors', async () => {
    const { query: queryNew } = await testClient({
      isAuth: true,
    })
    const result = await queryNew({
      query: GET_AUTHOR_RECOMMENDATION('authors'),
      // @ts-ignore
      variables: { input: { first: 1 } },
    })
    const { data } = result
    const author = _get(data, 'viewer.recommendation.authors.edges.0.node')
    expect(fromGlobalId(author.id).type).toBe('User')
  })
})

describe('badges', () => {
  test('get user badges', async () => {
    const { query } = await testClient({
      isAuth: true,
    })
    const { data } = await query({
      query: GET_VIEWER_BADGES,
      // @ts-ignore
      variables: {},
    })
    expect(_get(data, 'viewer.info.badges.0.type')).toBe('seed')
  })
})

describe('verification code', () => {
  const email = `verification-${Math.floor(Math.random() * 100)}@test.com`
  const type = 'register'

  test('send verification code', async () => {
    // send
    const { mutate } = await testClient()
    const result = await mutate({
      mutation: SEND_VERIFICATION_CODE,
      // @ts-ignore
      variables: { input: { type, email, token: 'some-test-token' } },
    })
    expect(result && result.data && result.data.sendVerificationCode).toBe(true)

    const [code] = await userService.findVerificationCodes({ email })
    expect(code.status).toBe(VERIFICATION_CODE_STATUS.active)

    // confirm
    const { mutate: confirmMutate } = await testClient()
    const confirmedResult = await confirmMutate({
      mutation: CONFIRM_VERIFICATION_CODE,
      // @ts-ignore
      variables: { input: { type, email, code: code.code } },
    })
    expect(
      confirmedResult &&
        confirmedResult.data &&
        confirmedResult.data.confirmVerificationCode
    ).toBe(code.uuid)
    const [confirmedCode] = await userService.findVerificationCodes({ email })
    expect(confirmedCode.status).toBe(VERIFICATION_CODE_STATUS.verified)
  })
})

describe('frozen user do mutations', () => {
  // frozen user shared settings
  // const frozenUser = { isAuth: true, isFrozen: true }
  // const errorPath = 'errors.0.extensions.code'

  // make sure user state in db is correct
  beforeAll(async () => {
    await updateUserState({
      id: toGlobalId({ type: 'User', id: 8 }),
      state: 'frozen',
    })
  })
  afterAll(async () => {
    await updateUserState({
      id: toGlobalId({ type: 'User', id: 8 }),
      state: 'active',
    })
  })
})
