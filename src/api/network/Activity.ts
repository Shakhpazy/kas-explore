import axios from 'axios'

const BASE_URL = 'https://api.kaspa.org'

interface TransactionCountResponse {
  timestamp: number
  dateTime: string
  coinbase: number
  regular: number
}

interface ActiveAddressCountResponse {
  timestamp: number
  dateTime: string
  count: number
}

export interface NetworkActivityPoint {
  timestamp: number
  transactions: number
  addresses: number
}

export interface NetworkActivity {
  allTimeTransactions: number
  allTimeAddresses: number
  points: NetworkActivityPoint[]
}

export type ActivityRange = '1D' | '7D' | '30D'

export async function getNetworkActivity(
  range: ActivityRange,
  signal?: AbortSignal,
) {
  const now = new Date()
  const days = range === '1D' ? 1 : range === '7D' ? 7 : 30
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const day = now.toISOString().slice(0, 10)
  const periods =
    range === '1D'
      ? [day]
      : [...new Set([from, now].map((date) => date.toISOString().slice(0, 7)))]
  const options = { signal, timeout: 10_000 }
  const [transactionTotal, addressTotal, transactions, addresses] =
    await Promise.all([
      axios.get<TransactionCountResponse>(
        `${BASE_URL}/transactions/count/`,
        options,
      ),
      axios.get<ActiveAddressCountResponse>(
        `${BASE_URL}/addresses/active/count/`,
        options,
      ),
      Promise.all(
        periods.map((period) =>
          axios.get<TransactionCountResponse[]>(
            `${BASE_URL}/transactions/count/${period}`,
            options,
          ),
        ),
      ),
      Promise.all(
        periods.map((period) =>
          axios.get<ActiveAddressCountResponse[]>(
            `${BASE_URL}/addresses/active/count/${period}`,
            options,
          ),
        ),
      ),
    ])

  const addressesByTimestamp = new Map(
    addresses
      .flatMap((response) => response.data)
      .filter((point) => point.timestamp >= from.getTime())
      .map((point) => [point.timestamp, point.count]),
  )

  return {
    allTimeTransactions: transactionTotal.data.regular,
    allTimeAddresses: addressTotal.data.count,
    points: transactions
      .flatMap((response) => response.data)
      .filter((point) => point.timestamp >= from.getTime())
      .map((point) => ({
        timestamp: point.timestamp,
        transactions: point.regular,
        addresses: addressesByTimestamp.get(point.timestamp) ?? 0,
      })),
  } satisfies NetworkActivity
}
