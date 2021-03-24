import { DB_NOTICE_TYPE } from 'common/enums'
import {
  DBNoticeType,
  GQLArticleArticleNoticeType,
  GQLArticleArticleNoticeTypeResolver,
  GQLArticleNoticeType,
  GQLArticleNoticeTypeResolver,
  GQLArticleTagNoticeType,
  GQLArticleTagNoticeTypeResolver,
  GQLCircleNoticeType,
  GQLCircleNoticeTypeResolver,
  GQLCommentCommentNoticeType,
  GQLCommentCommentNoticeTypeResolver,
  GQLCommentNoticeType,
  GQLCommentNoticeTypeResolver,
  GQLOfficialAnnouncementNoticeTypeResolver,
  GQLTagNoticeType,
  GQLTagNoticeTypeResolver,
  GQLTransactionNoticeType,
  GQLTransactionNoticeTypeResolver,
  GQLUserNoticeType,
  GQLUserNoticeTypeResolver,
  GQLUserTypeResolver,
} from 'definitions'

import notices from './notices'

enum NOTICE_TYPE {
  UserNotice = 'UserNotice',
  ArticleNotice = 'ArticleNotice',
  ArticleArticleNotice = 'ArticleArticleNotice',
  CommentNotice = 'CommentNotice',
  CommentCommentNotice = 'CommentCommentNotice',
  ArticleTagNotice = 'ArticleTagNotice',
  TagNotice = 'TagNotice',
  TransactionNotice = 'TransactionNotice',
  CircleNotice = 'CircleNotice',
  OfficialAnnouncementNotice = 'OfficialAnnouncementNotice',
}

const notice: {
  User: GQLUserTypeResolver
  Notice: any
  UserNotice: GQLUserNoticeTypeResolver
  ArticleNotice: GQLArticleNoticeTypeResolver
  ArticleArticleNotice: GQLArticleArticleNoticeTypeResolver
  ArticleTagNotice: GQLArticleTagNoticeTypeResolver
  TagNotice: GQLTagNoticeTypeResolver
  CommentNotice: GQLCommentNoticeTypeResolver
  CommentCommentNotice: GQLCommentCommentNoticeTypeResolver
  TransactionNotice: GQLTransactionNoticeTypeResolver
  CircleNotice: GQLCircleNoticeTypeResolver
  OfficialAnnouncementNotice: GQLOfficialAnnouncementNoticeTypeResolver
} = {
  User: {
    notices,
  },
  Notice: {
    __resolveType: ({ type }: { type: DBNoticeType }) => {
      const noticeTypeMap: Record<DBNoticeType, NOTICE_TYPE> = {
        // user
        user_new_follower: NOTICE_TYPE.UserNotice,

        // article
        article_published: NOTICE_TYPE.ArticleNotice,
        article_new_appreciation: NOTICE_TYPE.ArticleNotice,
        article_new_subscriber: NOTICE_TYPE.ArticleNotice,
        article_mentioned_you: NOTICE_TYPE.ArticleNotice,
        revised_article_published: NOTICE_TYPE.ArticleNotice,
        revised_article_not_published: NOTICE_TYPE.ArticleNotice,
        circle_new_article: NOTICE_TYPE.ArticleNotice,

        // article-artilce
        article_new_collected: NOTICE_TYPE.ArticleArticleNotice,

        // article-tag
        article_tag_has_been_added: NOTICE_TYPE.ArticleTagNotice,
        article_tag_has_been_removed: NOTICE_TYPE.ArticleTagNotice,
        article_tag_has_been_unselected: NOTICE_TYPE.ArticleTagNotice,

        // tag
        tag_adoption: NOTICE_TYPE.TagNotice,
        tag_leave: NOTICE_TYPE.TagNotice,
        tag_add_editor: NOTICE_TYPE.TagNotice,
        tag_leave_editor: NOTICE_TYPE.TagNotice,

        // comment
        comment_pinned: NOTICE_TYPE.CommentNotice,
        comment_mentioned_you: NOTICE_TYPE.CommentNotice,
        circle_broadcast_mentioned_you: NOTICE_TYPE.CommentNotice,
        circle_discussion_mentioned_you: NOTICE_TYPE.CommentNotice,
        article_new_comment: NOTICE_TYPE.CommentNotice,
        subscribed_article_new_comment: NOTICE_TYPE.CommentNotice,
        circle_new_broadcast: NOTICE_TYPE.CommentNotice,

        // comment-comment
        comment_new_reply: NOTICE_TYPE.CommentCommentNotice,
        circle_broadcast_new_reply: NOTICE_TYPE.CommentCommentNotice,
        circle_discussion_new_reply: NOTICE_TYPE.CommentCommentNotice,

        // transaction
        payment_received_donation: NOTICE_TYPE.TransactionNotice,
        payment_payout: NOTICE_TYPE.TransactionNotice,

        circle_new_follower: NOTICE_TYPE.CircleNotice,
        circle_new_subscriber: NOTICE_TYPE.CircleNotice,
        circle_new_unsubscriber: NOTICE_TYPE.CircleNotice,

        // official
        official_announcement: NOTICE_TYPE.OfficialAnnouncementNotice,
      }

      return noticeTypeMap[type]
    },
  },
  UserNotice: {
    id: ({ uuid }) => uuid,
    type: ({ type }) => {
      switch (type) {
        case DB_NOTICE_TYPE.user_new_follower:
          return GQLUserNoticeType.UserNewFollower
      }
    },
    target: ({ entities, type }, _, { viewer }) => {
      if (type === DB_NOTICE_TYPE.user_new_follower) {
        return viewer
      }
      return null
    },
  },
  ArticleNotice: {
    id: ({ uuid }) => uuid,
    type: ({ type }) => {
      switch (type) {
        case DB_NOTICE_TYPE.article_published:
          return GQLArticleNoticeType.ArticlePublished
        case DB_NOTICE_TYPE.article_new_appreciation:
          return GQLArticleNoticeType.ArticleNewAppreciation
        case DB_NOTICE_TYPE.article_new_subscriber:
          return GQLArticleNoticeType.ArticleNewSubscriber
        case DB_NOTICE_TYPE.article_mentioned_you:
          return GQLArticleNoticeType.ArticleMentionedYou
        case DB_NOTICE_TYPE.revised_article_published:
          return GQLArticleNoticeType.RevisedArticlePublished
        case DB_NOTICE_TYPE.revised_article_not_published:
          return GQLArticleNoticeType.RevisedArticleNotPublished
        case DB_NOTICE_TYPE.circle_new_article:
          return GQLArticleNoticeType.CircleNewArticle
      }
    },
    target: ({ entities }, _, { dataSources: { draftService } }) =>
      draftService.dataloader.load(entities.target.draftId),
  },
  ArticleArticleNotice: {
    id: ({ uuid }) => uuid,
    type: ({ type }) => {
      switch (type) {
        case DB_NOTICE_TYPE.article_new_collected:
          return GQLArticleArticleNoticeType.ArticleNewCollected
      }
    },
    target: ({ entities }, _, { dataSources: { draftService } }) =>
      draftService.dataloader.load(entities.target.draftId),
    article: ({ entities, type }, _, { dataSources: { draftService } }) => {
      if (type === DB_NOTICE_TYPE.article_new_collected) {
        return draftService.dataloader.load(entities.collection.draftId)
      }
      return null
    },
  },
  ArticleTagNotice: {
    id: ({ uuid }) => uuid,
    type: ({ type }) => {
      switch (type) {
        case DB_NOTICE_TYPE.article_tag_has_been_added:
          return GQLArticleTagNoticeType.ArticleTagAdded
        case DB_NOTICE_TYPE.article_tag_has_been_removed:
          return GQLArticleTagNoticeType.ArticleTagRemoved
        case DB_NOTICE_TYPE.article_tag_has_been_unselected:
          return GQLArticleTagNoticeType.ArticleTagUnselected
      }
    },
    target: ({ entities }, _, { dataSources: { draftService } }) =>
      draftService.dataloader.load(entities.target.draftId),
    tag: ({ entities }) => entities.tag,
  },
  TagNotice: {
    id: ({ uuid }) => uuid,
    type: ({ type }) => {
      switch (type) {
        case DB_NOTICE_TYPE.tag_adoption:
          return GQLTagNoticeType.TagAdoption
        case DB_NOTICE_TYPE.tag_leave:
          return GQLTagNoticeType.TagLeave
        case DB_NOTICE_TYPE.tag_add_editor:
          return GQLTagNoticeType.TagAddEditor
        case DB_NOTICE_TYPE.tag_leave_editor:
          return GQLTagNoticeType.TagAddEditor
      }
    },
    target: ({ entities }) => entities.target,
  },
  CommentNotice: {
    id: ({ uuid }) => uuid,
    type: ({ type }) => {
      switch (type) {
        case DB_NOTICE_TYPE.comment_pinned:
          return GQLCommentNoticeType.CommentPinned
        case DB_NOTICE_TYPE.comment_mentioned_you:
        case DB_NOTICE_TYPE.circle_broadcast_mentioned_you:
        case DB_NOTICE_TYPE.circle_discussion_mentioned_you:
          return GQLCommentNoticeType.CommentMentionedYou
        case DB_NOTICE_TYPE.article_new_comment:
          return GQLCommentNoticeType.ArticleNewComment
        case DB_NOTICE_TYPE.subscribed_article_new_comment:
          return GQLCommentNoticeType.SubscribedArticleNewComment
        case DB_NOTICE_TYPE.circle_new_broadcast:
          return GQLCommentNoticeType.CircleNewBroadcast
      }
    },
    target: ({ entities, type }) => {
      switch (type) {
        case DB_NOTICE_TYPE.comment_pinned:
        case DB_NOTICE_TYPE.comment_mentioned_you:
        case DB_NOTICE_TYPE.circle_broadcast_mentioned_you:
        case DB_NOTICE_TYPE.circle_discussion_mentioned_you:
        case DB_NOTICE_TYPE.circle_new_broadcast:
          return entities.target
        case DB_NOTICE_TYPE.article_new_comment:
        case DB_NOTICE_TYPE.subscribed_article_new_comment:
          return entities.comment
      }
    },
  },
  CommentCommentNotice: {
    id: ({ uuid }) => uuid,
    type: ({ type }) => {
      switch (type) {
        case DB_NOTICE_TYPE.comment_new_reply:
        case DB_NOTICE_TYPE.circle_broadcast_new_reply:
        case DB_NOTICE_TYPE.circle_discussion_new_reply:
          return GQLCommentCommentNoticeType.CommentNewReply
      }
    },
    target: ({ entities }) => entities.target,
    comment: ({ entities, type }) => {
      switch (type) {
        case DB_NOTICE_TYPE.comment_new_reply:
        case DB_NOTICE_TYPE.circle_broadcast_new_reply:
        case DB_NOTICE_TYPE.circle_discussion_new_reply:
          return entities.reply
      }
    },
  },
  TransactionNotice: {
    id: ({ uuid }) => uuid,
    type: ({ type }) => {
      switch (type) {
        case DB_NOTICE_TYPE.payment_received_donation:
          return GQLTransactionNoticeType.PaymentReceivedDonation
        case DB_NOTICE_TYPE.payment_payout:
          return GQLTransactionNoticeType.PaymentPayout
      }
    },
    target: ({ entities }) => entities.target,
  },
  CircleNotice: {
    id: ({ uuid }) => uuid,
    type: ({ type }) => {
      switch (type) {
        case DB_NOTICE_TYPE.circle_new_follower:
          return GQLCircleNoticeType.CircleNewFollower
        case DB_NOTICE_TYPE.circle_new_subscriber:
          return GQLCircleNoticeType.CircleNewSubscriber
        case DB_NOTICE_TYPE.circle_new_unsubscriber:
          return GQLCircleNoticeType.CircleNewUnsubscriber
      }
    },
    target: ({ entities, type }) => {
      switch (type) {
        case DB_NOTICE_TYPE.circle_new_follower:
        case DB_NOTICE_TYPE.circle_new_subscriber:
        case DB_NOTICE_TYPE.circle_new_unsubscriber:
          return entities.target
      }
    },
  },
  OfficialAnnouncementNotice: {
    id: ({ uuid }) => uuid,
    link: ({ data }: { data: any }) => data && data.link,
  },
}

export default notice
