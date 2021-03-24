export enum DB_NOTICE_TYPE {
  // user
  user_new_follower = 'user_new_follower',

  // article
  article_published = 'article_published',
  article_new_appreciation = 'article_new_appreciation',
  article_new_subscriber = 'article_new_subscriber',
  article_mentioned_you = 'article_mentioned_you',
  revised_article_published = 'revised_article_published',
  revised_article_not_published = 'revised_article_not_published',
  circle_new_article = 'circle_new_article',

  // article-article
  article_new_collected = 'article_new_collected',

  // article-tag
  article_tag_has_been_added = 'article_tag_has_been_added',
  article_tag_has_been_removed = 'article_tag_has_been_removed',
  article_tag_has_been_unselected = 'article_tag_has_been_unselected',

  // tag
  tag_adoption = 'tag_adoption',
  tag_leave = 'tag_leave',
  tag_add_editor = 'tag_add_editor',
  tag_leave_editor = 'tag_leave_editor',

  // comment
  comment_pinned = 'comment_pinned',
  comment_mentioned_you = 'comment_mentioned_you',
  circle_broadcast_mentioned_you = 'circle_broadcast_mentioned_you',
  circle_discussion_mentioned_you = 'circle_discussion_mentioned_you',
  article_new_comment = 'article_new_comment',
  subscribed_article_new_comment = 'subscribed_article_new_comment',
  circle_new_broadcast = 'circle_new_broadcast',

  // comment-comment
  comment_new_reply = 'comment_new_reply',
  circle_broadcast_new_reply = 'circle_broadcast_new_reply',
  circle_discussion_new_reply = 'circle_discussion_new_reply',

  // transaction
  payment_received_donation = 'payment_received_donation',
  payment_payout = 'payment_payout',

  // circle
  circle_new_follower = 'circle_new_follower',
  circle_new_subscriber = 'circle_new_subscriber',
  circle_new_unsubscriber = 'circle_new_unsubscriber',

  // misc
  official_announcement = 'official_announcement',
}

// types act as `official_announcement`
export enum OFFICIAL_NOTICE_EXTEND_TYPE {
  user_activated = 'user_activated',
  user_banned = 'user_banned',
  user_frozen = 'user_frozen',
  user_unbanned = 'user_unbanned',
  comment_banned = 'comment_banned',
  article_banned = 'article_banned',
  article_reported = 'article_reported',
  comment_reported = 'comment_reported',
}
