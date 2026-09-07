import axios from 'axios'

// Block hashes and transaction IDs both contain 64 hexadecimal characters.
export async function resolveHash(hash: string): Promise<'block' | 'transaction'> {
  const [block, transaction] = await Promise.allSettled([
    axios.get<{ verboseData?: { hash?: string } }>(
      `https://api.kaspa.org/blocks/${hash}`,
      { params: { includeTransactions: false }, timeout: 10_000 },
    ),
    axios.get<{ transaction_id?: string }>(
      `https://api.kaspa.org/transactions/${hash}`,
      { timeout: 10_000 },
    ),
  ])

  if (block.status === 'fulfilled' && block.value.data.verboseData?.hash === hash) return 'block'
  if (transaction.status === 'fulfilled' && transaction.value.data.transaction_id === hash) return 'transaction'

  const notFound = (result: PromiseSettledResult<unknown>) =>
    result.status === 'rejected' && axios.isAxiosError(result.reason) && result.reason.response?.status === 404

  throw new Error(
    notFound(block) && notFound(transaction)
      ? 'No block or transaction found for this hash.'
      : 'Unable to look up this hash right now. Please try again.',
  )
}
