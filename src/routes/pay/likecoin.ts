import { invalidateFQC } from '@matters/apollo-response-cache'
import bodyParser from 'body-parser'
import { Router } from 'express'
import NP from 'number-precision'

import { DB_NOTICE_TYPE, NODE_TYPES, TRANSACTION_STATE } from 'common/enums'
import { environment } from 'common/environment'
import logger from 'common/logger'
import { numRound } from 'common/utils'
import {
  CacheService,
  NotificationService,
  PaymentService,
  UserService,
} from 'connectors'

const likecoinRouter = Router()

const invalidateCache = async ({
  id,
  typeId,
  userService,
}: {
  id: string
  typeId: string
  userService: InstanceType<typeof UserService>
}) => {
  if (typeId) {
    const cache = new CacheService()
    const result = await userService.baseFindEntityTypeTable(typeId)
    const type = NODE_TYPES[(result?.table as keyof typeof NODE_TYPES) || '']
    if (type) {
      await invalidateFQC({
        node: { type, id },
        redis: cache.redis,
      })
    }
  }
}

likecoinRouter.use(bodyParser.json())

likecoinRouter.get('/', async (req, res) => {
  const successRedirect = `${environment.siteDomain}/pay/likecoin/success`
  const failureRedirect = `${environment.siteDomain}/pay/likecoin/failure`

  const paymentService = new PaymentService()

  try {
    const { tx_hash, state, success } = req.query

    if (!tx_hash) {
      throw new Error('callback has no "tx_hash"')
    }

    if (!state) {
      throw new Error('callback has no "state"')
    }

    if (!success) {
      throw new Error('callback has no "success"')
    }

    // get pending transaction
    const tx = (
      await paymentService.findTransactions({
        providerTxId: tx_hash,
      })
    )[0]

    if (!tx) {
      throw new Error('could not found tx id passing from like pay')
    }
  } catch (error) {
    logger.error(error)
    return res.redirect(failureRedirect)
  }

  return res.redirect(successRedirect)
})

/**
 * Basic Auth for Like Pay Webhook Events
 */
likecoinRouter.use(async (req, res, next) => {
  const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
  const secret = Buffer.from(b64auth, 'base64').toString()

  if (secret === environment.likecoinPayWebhookSecret) {
    next()
  } else {
    // deny webhook call
    res.set('WWW-Authenticate', 'Basic realm="incorrect webhook credential"')
    res.status(401).send('401 Unauthorized')
  }
})

/**
 * Handling Incoming Like Pay Webhook Events
 *
 * @see {@url https://docs.like.co/developer/like-pay/web-widget/webhook}
 */
likecoinRouter.post('/', async (req, res, next) => {
  const userService = new UserService()
  const paymentService = new PaymentService()
  const notificationService = new NotificationService()
  let txHash = ''

  try {
    const { tx, metadata } = req.body
    if (!tx || !tx.txHash) {
      throw new Error('callback has no "tx"')
    }
    txHash = tx.txHash

    if (!metadata) {
      throw new Error('callback has no "metadata"')
    }

    const trans = (
      await paymentService.findTransactions({
        providerTxId: tx.txHash,
      })
    )[0]

    if (!trans) {
      throw new Error(`counld not find tx hash`)
    }

    // check like chain tx state
    // 1 like is 10^9 nanolike
    const rate = Math.pow(10, 9)
    const cosmosData = await userService.likecoin.getCosmosTxData({
      hash: tx.txHash,
    })
    const cosmosAmount = NP.divide(cosmosData.amount, rate)
    const cosmosState =
      tx.status === 'success'
        ? TRANSACTION_STATE.succeeded
        : tx.status === 'failed'
        ? TRANSACTION_STATE.failed
        : tx.status === 'timeout'
        ? TRANSACTION_STATE.failed
        : TRANSACTION_STATE.pending

    const updateParams: Record<string, any> = {
      id: trans.id,
      provider_tx_id: tx.txHash,
      state: cosmosState,
      updatedAt: new Date(),
    }

    // correct amount if it changed via LikePay
    if (trans.amount !== cosmosAmount) {
      updateParams.amount = cosmosAmount
    }

    // update transaction
    const updatedTx = await paymentService.baseUpdate(trans.id, updateParams)

    if (cosmosState === TRANSACTION_STATE.failed) {
      invalidateCache({
        id: updatedTx.targetId,
        typeId: updatedTx.targetType,
        userService,
      })
      throw new Error(`like pay failure`)
    }

    // notification
    const sender = await userService.baseFindById(updatedTx.senderId)
    const recipient = await userService.baseFindById(updatedTx.recipientId)

    // to sender
    notificationService.mail.sendPayment({
      to: sender.email,
      recipient: {
        displayName: sender.displayName,
        userName: sender.userName,
      },
      type: 'donated',
      tx: {
        recipient,
        sender,
        amount: numRound(updatedTx.amount),
        currency: updatedTx.currency,
      },
    })
    // to recipient
    notificationService.trigger({
      event: DB_NOTICE_TYPE.payment_received_donation,
      actorId: sender.id,
      recipientId: recipient.id,
      entities: [
        {
          type: 'target',
          entityTable: 'transaction',
          entity: updatedTx,
        },
      ],
    })
    notificationService.mail.sendPayment({
      to: recipient.email,
      recipient: {
        displayName: recipient.displayName,
        userName: recipient.userName,
      },
      type: 'receivedDonationLikeCoin',
      tx: {
        recipient,
        sender,
        amount: numRound(updatedTx.amount),
        currency: updatedTx.currency,
      },
    })

    // manaully invalidate cache
    invalidateCache({
      id: updatedTx.targetId,
      typeId: updatedTx.targetType,
      userService,
    })

    res.json({ received: true })
  } catch (error) {
    const errMsg = `webhook err: ${error}, tx hash: ${txHash}`
    logger.error(errMsg)
    next(errMsg)
  }
})

export default likecoinRouter
