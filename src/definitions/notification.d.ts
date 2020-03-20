import { TableName, User } from 'definitions'

export type DBNoticeType =
  // user
  | 'user_new_follower'
  // article
  | 'article_published'
  | 'article_new_downstream'
  | 'article_new_collected'
  | 'article_new_appreciation'
  | 'article_new_subscriber'
  | 'article_new_comment'
  | 'article_mentioned_you'
  | 'subscribed_article_new_comment'
  | 'upstream_article_archived'
  | 'downstream_article_archived'
  | 'article_tag_has_been_added'
  | 'article_tag_has_been_removed'
  | 'article_tag_has_been_unselected'
  // comment
  | 'comment_pinned'
  | 'comment_new_reply'
  | 'comment_mentioned_you'
  // official
  | 'official_announcement'

export type OfficialNoticeExtendType =
  | 'user_activated'
  | 'user_banned'
  | 'user_frozen'
  | 'comment_banned'
  | 'article_banned'
  | 'article_reported'
  | 'comment_reported'

export type NoticeEntityType =
  | 'target'
  | 'downstream'
  | 'upstream'
  | 'comment'
  | 'reply'
  | 'collection'
  | 'tag'

export type NotificationType = DBNoticeType | OfficialNoticeExtendType

export interface NotificationRequiredParams {
  event: NotificationType
  recipientId: string
}

export type NotificationEntity<
  T extends NoticeEntityType = NoticeEntityType,
  K extends TableName = TableName
> = {
  type: T
  entityTable: K
  entity: any
}

export interface NoticeUserNewFollowerParams
  extends NotificationRequiredParams {
  event: 'user_new_follower'
  recipientId: string
  actorId: string
}

export interface NoticeArticlePublishedParams
  extends NotificationRequiredParams {
  event: 'article_published'
  recipientId: string
  entities: [NotificationEntity<'target', 'article'>]
}

export interface NoticeArticleNewDownstreamParams
  extends NotificationRequiredParams {
  event: 'article_new_downstream'
  recipientId: string
  actorId: string
  entities: [
    NotificationEntity<'target', 'article'>,
    NotificationEntity<'downstream', 'article'>
  ]
}

export interface NoticeArticleNewCollectedParams
  extends NotificationRequiredParams {
  event: 'article_new_collected'
  recipientId: string
  actorId: string
  entities: [
    NotificationEntity<'target', 'article'>,
    NotificationEntity<'collection', 'article'>
  ]
}

export interface NoticeArticleNewAppreciationParams
  extends NotificationRequiredParams {
  event: 'article_new_appreciation'
  recipientId: string
  actorId: string
  entities: [NotificationEntity<'target', 'article'>]
}

export interface NoticeArticleNewSubscriberParams
  extends NotificationRequiredParams {
  event: 'article_new_subscriber'
  recipientId: string
  actorId: string
  entities: [NotificationEntity<'target', 'article'>]
}

export interface NoticeArticleNewCommentParams
  extends NotificationRequiredParams {
  event: 'article_new_comment'
  recipientId: string
  actorId: string
  entities: [
    NotificationEntity<'target', 'article'>,
    NotificationEntity<'comment', 'comment'>
  ]
}

export interface NoticeArticleMentionedYouParams
  extends NotificationRequiredParams {
  event: 'article_mentioned_you'
  recipientId: string
  actorId: string
  entities: [NotificationEntity<'target', 'article'>]
}

export interface NoticeSubscribedArticleNewCommentParams
  extends NotificationRequiredParams {
  event: 'subscribed_article_new_comment'
  recipientId: string
  actorId: string
  entities: [
    NotificationEntity<'target', 'article'>,
    NotificationEntity<'comment', 'comment'>
  ]
}

export interface NoticeUpstreamArticleArchivedParams
  extends NotificationRequiredParams {
  event: 'upstream_article_archived'
  recipientId: string
  entities: [
    NotificationEntity<'target', 'article'>,
    NotificationEntity<'upstream', 'article'>
  ]
}

export interface NoticeDownstreamArticleArchivedParams
  extends NotificationRequiredParams {
  event: 'downstream_article_archived'
  recipientId: string
  entities: [
    NotificationEntity<'target', 'article'>,
    NotificationEntity<'downstream', 'article'>
  ]
}

export interface NoticeCommentPinnedParams extends NotificationRequiredParams {
  event: 'comment_pinned'
  actorId: string
  recipientId: string
  entities: [NotificationEntity<'target', 'comment'>]
}

export interface NoticeCommentNewReplyParams
  extends NotificationRequiredParams {
  event: 'comment_new_reply'
  recipientId: string
  actorId: string
  entities: [
    NotificationEntity<'target', 'comment'>,
    NotificationEntity<'reply', 'comment'>
  ]
}

export interface NoticeCommentMentionedYouParams
  extends NotificationRequiredParams {
  event: 'comment_mentioned_you'
  recipientId: string
  actorId: string
  entities: [NotificationEntity<'target', 'comment'>]
}

export interface NoticeOfficialAnnouncementParams
  extends NotificationRequiredParams {
  event: 'official_announcement'
  recipientId: string
  message: string
  data: { url: string }
}

export interface NoticeArticleTagHasBeenAddedParams
  extends NotificationRequiredParams {
  event: 'article_tag_has_been_added'
  recipientId: string
  actorId: string
  entities: [
    NotificationEntity<'target', 'article'>,
    NotificationEntity<'tag', 'tag'>
  ]
}

export interface NoticeArticleTagHasBeenRemovedParams
  extends NotificationRequiredParams {
  event: 'article_tag_has_been_removed'
  recipientId: string
  actorId: string
  entities: [
    NotificationEntity<'target', 'article'>,
    NotificationEntity<'tag', 'tag'>
  ]
}

export interface NoticeArticleTagHasBeenUnselectedParams
  extends NotificationRequiredParams {
  event: 'article_tag_has_been_unselected'
  recipientId: string
  actorId: string
  entities: [
    NotificationEntity<'target', 'article'>,
    NotificationEntity<'tag', 'tag'>
  ]
}

export interface NoticeUserActivatedParams extends NotificationRequiredParams {
  event: 'user_activated'
  recipientId: string
}

/**
 * Punish
 */
export interface NoticeUserBannedParams extends NotificationRequiredParams {
  event: 'user_banned'
  recipientId: string
}

export interface NoticeUserFrozenParams extends NotificationRequiredParams {
  event: 'user_frozen'
  recipientId: string
}

export interface NoticeCommentBannedParams extends NotificationRequiredParams {
  event: 'comment_banned'
  entities: [NotificationEntity<'target', 'comment'>]
  recipientId: string
}

export interface NoticeArticleBannedParams extends NotificationRequiredParams {
  event: 'article_banned'
  entities: [NotificationEntity<'target', 'article'>]
  recipientId: string
}

/**
 * Report
 */
export interface NoticeArticleReportedParams
  extends NotificationRequiredParams {
  event: 'article_reported'
  entities: [NotificationEntity<'target', 'article'>]
  recipientId: string
}

export interface NoticeCommentReportedParams
  extends NotificationRequiredParams {
  event: 'comment_reported'
  entities: [NotificationEntity<'target', 'comment'>]
  recipientId: string
}

export type NotificationPrarms =
  | NoticeUserNewFollowerParams
  | NoticeArticlePublishedParams
  | NoticeArticleNewDownstreamParams
  | NoticeArticleNewCollectedParams
  | NoticeArticleNewAppreciationParams
  | NoticeArticleNewSubscriberParams
  | NoticeArticleNewCommentParams
  | NoticeArticleMentionedYouParams
  | NoticeSubscribedArticleNewCommentParams
  | NoticeUpstreamArticleArchivedParams
  | NoticeDownstreamArticleArchivedParams
  | NoticeCommentPinnedParams
  | NoticeCommentNewReplyParams
  | NoticeCommentMentionedYouParams
  | NoticeOfficialAnnouncementParams
  | NoticeUserActivatedParams
  | NoticeUserBannedParams
  | NoticeUserFrozenParams
  | NoticeCommentBannedParams
  | NoticeArticleBannedParams
  | NoticeArticleReportedParams
  | NoticeCommentReportedParams
  | NoticeArticleTagHasBeenAddedParams
  | NoticeArticleTagHasBeenRemovedParams
  | NoticeArticleTagHasBeenUnselectedParams

export type NoticeUserId = string

export type NoticeEntity = {
  type: NoticeEntityType
  table: TableName
  entityId: string
}

export type NoticeEntitiesMap = { [key in NoticeEntityType]: any }
export type NoticeMessage = string
export type NoticeData = {
  url?: string
  reason?: string
}

export type NoticeDetail = {
  id: string
  uuid: string
  unread: boolean
  deleted: boolean
  updatedAt: Date
  noticeType: DBNoticeType
  message?: NoticeMessage
  data?: NoticeData
}

export type NoticeItem = NoticeDetail & {
  createdAt: Date
  type: DBNoticeType
  actors?: User[]
  entities?: NoticeEntitiesMap
}

export type PutNoticeParams = {
  type: DBNoticeType
  actorId?: NoticeUserId
  recipientId: NoticeUserId
  entities?: NotificationEntity[]
  message?: NoticeMessage | null
  data?: NoticeData | null
}
