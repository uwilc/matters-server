import { EMAIL_TEMPLATE_ID, VERIFICATION_CODE_TYPES } from 'common/enums'
import { environment } from 'common/environment'
import { notificationQueue } from 'connectors/queue/notification'
import { LANGUAGES } from 'definitions'

import { trans } from './utils'

export const sendCircleInvitation = async ({
  code,
  circle,
  language = 'zh_hant',
  recipient,
  redirectUrl,
  sender,
  to,
}: {
  code?: string
  circle: {
    displayName: string
    freePeriod: number
    name: string
  }
  language?: LANGUAGES
  recipient: {
    displayName?: string
  }
  redirectUrl?: string
  sender: {
    displayName: string
  }
  to: string
}) => {
  const templateId = EMAIL_TEMPLATE_ID.circleInvitation[language]
  const urlHasQs = redirectUrl && redirectUrl.indexOf('?') >= 0
  const registerLink = code
    ? `${redirectUrl}${urlHasQs ? '&' : '?'}code=${code}&type=${
        VERIFICATION_CODE_TYPES.register
      }`
    : undefined
  const circleLink = code
    ? undefined
    : `${environment.siteDomain}/~${circle.name}`

  notificationQueue.sendMail({
    from: environment.emailFromAsk as string,
    templateId,
    personalizations: [
      {
        to,
        // @ts-ignore
        dynamic_template_data: {
          circle,
          circleLink,
          code,
          recipient,
          registerLink,
          sender,
          siteDomain: environment.siteDomain,
          subject: trans.circle.invitation(language, {
            sender: sender.displayName,
            circle: circle.displayName,
          }),
        },
      },
    ],
  })
}
