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

function normalizeTimestamp(timestamp: number) {
  // If timestamp is in seconds, convert it to milliseconds.
  return timestamp < 1_000_000_000_000
    ? timestamp * 1000
    : timestamp
}

export async function getNetworkActivity(
  range: ActivityRange,
  signal?: AbortSignal,
): Promise<NetworkActivity> {
  const now = new Date()

  const days =
    range === '1D'
      ? 1
      : range === '7D'
        ? 7
        : 30

  const from = new Date(
    now.getTime() - days * 24 * 60 * 60 * 1000,
  )

  // Always request monthly data.
  // If the range crosses into a previous month,
  // both months will automatically be requested.
  const periods = [
    ...new Set(
      [from, now].map((date) =>
        date.toISOString().slice(0, 7),
      ),
    ),
  ]

  const options = {
    signal,
    timeout: 10_000,
  }

  const [
    transactionTotalResponse,
    addressTotalResponse,
    transactionResponses,
    addressResponses,
  ] = await Promise.all([
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

  const transactionPoints = transactionResponses
    .flatMap((response) => response.data)
    .map((point) => ({
      ...point,
      timestamp: normalizeTimestamp(point.timestamp),
    }))
    .filter(
      (point) =>
        point.timestamp >= from.getTime() &&
        point.timestamp <= now.getTime(),
    )
    .sort((a, b) => a.timestamp - b.timestamp)

  const addressPoints = addressResponses
    .flatMap((response) => response.data)
    .map((point) => ({
      ...point,
      timestamp: normalizeTimestamp(point.timestamp),
    }))
    .filter(
      (point) =>
        point.timestamp >= from.getTime() &&
        point.timestamp <= now.getTime(),
    )
    .sort((a, b) => a.timestamp - b.timestamp)

  const addressesByTimestamp = new Map<number, number>()

  for (const point of addressPoints) {
    addressesByTimestamp.set(
      point.timestamp,
      point.count,
    )
  }

  const points: NetworkActivityPoint[] =
    transactionPoints.map((point) => ({
      timestamp: point.timestamp,
      transactions: point.regular,
      addresses:
        addressesByTimestamp.get(point.timestamp) ?? 0,
    }))

  return {
    allTimeTransactions:
      transactionTotalResponse.data.regular,

    allTimeAddresses:
      addressTotalResponse.data.count,

    points,
  }
}