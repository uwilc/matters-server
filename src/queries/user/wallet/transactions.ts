import { CacheScope } from 'apollo-cache-control'

import {
  CACHE_TTL,
  TRANSACTION_PURPOSE,
  TRANSACTION_STATE,
  TransactionRemarkText,
} from 'common/enums'
import { connectionFromArray, cursorToIndex, fromGlobalId } from 'common/utils'
import { WalletToTransactionsResolver } from 'definitions'

const resolver: WalletToTransactionsResolver = async (
  { id: userId },
  { input },
  { dataSources: { paymentService }, viewer },
  { cacheControl }
) => {
  const { first, after, id, states } = input

  let txId
  if (id) {
    txId = fromGlobalId(id).id
  }

  const offset = after ? cursorToIndex(after) + 1 : 0
  const totalCount = await paymentService.totalTransactionCount({
    userId,
    id: txId,
    states: states as any,
    excludeCanceledLIKE: true,
    notIn: ['purpose', [TRANSACTION_PURPOSE.subscription]],
  })

  // no-cache for single transaction query, used by client polling
  if (txId) {
    cacheControl.setCacheHint({
      maxAge: CACHE_TTL.INSTANT,
      scope: CacheScope.Private,
    })
  }

  const transactions = await paymentService.findTransactions({
    userId,
    id: txId,
    states: states as any,
    excludeCanceledLIKE: true,
    notIn: ['purpose', [TRANSACTION_PURPOSE.subscription]],
    limit: first,
    offset,
  })

  // get message text
  const getTxMessage = (tx: { [key: string]: string }) => {
    if (!tx.remark) {
      return ''
    }

    // only return message for failed tx for now
    if (tx.purpose === TRANSACTION_STATE.failed) {
      const text = TransactionRemarkText[viewer.language]

      // known error code or unknown error code
      if (Object.keys(text).includes(tx.remark)) {
        return text[tx.remark as keyof typeof text]
      } else {
        return text.unknow_error
      }
    }
  }

  return connectionFromArray(
    transactions.map((tx) => ({
      ...tx,
      amount: tx.delta,
      message: getTxMessage(tx),
    })),
    input,
    totalCount
  )
}

export default resolver
