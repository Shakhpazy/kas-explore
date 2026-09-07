import axios from 'axios'

const BASE_URL = 'https://api.kaspa.org'
export const ADDRESS_TRANSACTIONS_PAGE_SIZE = 10

type ApiRecord = Record<string, unknown>

function record(value: unknown): ApiRecord | null {
  return value && typeof value === 'object' ? (value as ApiRecord) : null
}

function numberField(value: unknown, ...keys: string[]) {
  const source = record(value)
  const matchedValue = keys
    .map((key) => source?.[key])
    .find((item) => item !== undefined)
  const parsed = Number(matchedValue)
  return Number.isFinite(parsed) ? parsed : null
}

export interface AddressInfo {
  address: string
  balanceSompi: number | null
  utxoCount: number | null
  transactionCount: number | null
  firstTransactionAt: number | null
  lastTransactionAt: number | null
}

export type AddressTransactionDirection = 'received' | 'sent' | 'self'

export interface AddressTransaction {
  id: string
  timestamp: number | null
  isAccepted: boolean
  direction: AddressTransactionDirection
  amountSompi: number | null
  feeSompi: number | null
  inputCount: number
  outputCount: number
}

export interface AddressTransactionsPage {
  transactions: AddressTransaction[]
  nextBefore: number | null
}

export interface TopAddressEntry {
  rank: number | null
  address: string | null
  amountKas: number | null
  amountRaw: string | null
  change1dKas: number | null
  change7dKas: number | null
  change30dKas: number | null
}

export interface TopAddressSnapshot {
  timestamp: number | null
  ranking: TopAddressEntry[]
}

export interface AddressName {
  address: string
  name: string
}


function field(value: unknown, ...keys: string[]) {
  const source = record(value)
  return keys.map((key) => source?.[key]).find((item) => item !== undefined)
}

function stringField(value: unknown, ...keys: string[]) {
  const item = field(value, ...keys)
  return typeof item === 'string' || typeof item === 'number' ? String(item) : null
}

function timestampField(value: unknown, ...keys: string[]) {
  const timestamp = numberField(value, ...keys)
  if (timestamp === null) return null
  return timestamp < 10_000_000_000 ? timestamp * 1_000 : timestamp
}

function sumAddressOutputs(outputs: unknown, address: string) {
  if (!Array.isArray(outputs)) return 0
  return outputs.reduce((total, output) => {
    const outputAddress = stringField(
      output,
      'script_public_key_address',
      'scriptPublicKeyAddress',
    )
    return outputAddress === address
      ? total + (numberField(output, 'amount') ?? 0)
      : total
  }, 0)
}

function sumAddressInputs(inputs: unknown, address: string) {
  if (!Array.isArray(inputs)) return 0
  return inputs.reduce((total, input) => {
    const inputAddress = stringField(
      input,
      'previous_outpoint_address',
      'previousOutpointAddress',
    )
    return inputAddress === address
      ? total +
        (numberField(
          input,
          'previous_outpoint_amount',
          'previousOutpointAmount',
        ) ?? 0)
      : total
  }, 0)
}

function parseAddressTransaction(
  value: unknown,
  address: string,
): AddressTransaction | null {
  const id = stringField(value, 'transaction_id', 'transactionId', 'id')
  if (!id) return null

  const inputs = field(value, 'inputs')
  const outputs = field(value, 'outputs')
  const received = sumAddressOutputs(outputs, address)
  const spent = sumAddressInputs(inputs, address)
  const net = received - spent

  return {
    id,
    timestamp: timestampField(
      value,
      'block_time',
      'blockTime',
      'accepting_block_time',
      'acceptingBlockTime',
    ),
    isAccepted: field(value, 'is_accepted', 'isAccepted') !== false,
    direction: received > 0 && spent > 0 ? 'self' : net >= 0 ? 'received' : 'sent',
    amountSompi: received > 0 || spent > 0 ? Math.abs(net) : null,
    feeSompi: numberField(value, 'fee'),
    inputCount: Array.isArray(inputs) ? inputs.length : 0,
    outputCount: Array.isArray(outputs) ? outputs.length : 0,
  }
}

function transactionTimestamp(data: unknown) {
  return Array.isArray(data)
    ? timestampField(
        data[0],
        'block_time',
        'blockTime',
        'accepting_block_time',
        'acceptingBlockTime',
      )
    : null
}

function parseTopAddressEntry(value: unknown): TopAddressEntry {
  const amountKas = numberField(
    value,
    'amount',
    'balance',
    'amountSompi',
    'balanceSompi',
    'total_amount',
    'totalAmount',
  )
  const amountRaw =
    stringField(
      value,
      'amount',
      'balance',
      'amountSompi',
      'balanceSompi',
      'total_amount',
      'totalAmount',
    ) ?? (amountKas !== null ? String(amountKas) : null)

  return {
    rank: numberField(value, 'rank'),
    address: stringField(value, 'address'),
    amountKas,
    amountRaw,
    change1dKas: null,
    change7dKas: null,
    change30dKas: null,
  }
}

function parseTopAddressSnapshot(value: unknown): TopAddressSnapshot {
  return {
    timestamp: timestampField(value, 'timestamp'),
    ranking: Array.isArray(field(value, 'ranking'))
      ? (field(value, 'ranking') as unknown[]).map(parseTopAddressEntry)
      : [],
  }
}

function parseAddressName(value: unknown): AddressName | null {
  const address = stringField(value, 'address')
  const name = stringField(value, 'name')
  if (!address || !name) return null

  return { address, name }
}

async function getTopAddressSnapshot(before?: number) {
  const { data } = await axios.get<unknown>(`${BASE_URL}/addresses/top`, {
    params: {
      limit: 1,
      ...(before ? { before } : {}),
    },
    timeout: 10_000,
  })

  const snapshot = Array.isArray(data) ? data[0] : null
  return snapshot ? parseTopAddressSnapshot(snapshot) : null
}

export async function getAddressInfo(address: string): Promise<AddressInfo> {
  const encodedAddress = encodeURIComponent(address)
  const [balance, utxoCount, transactionCount, firstTransaction, lastTransaction] =
    await Promise.all([
    axios.get(`${BASE_URL}/addresses/${encodedAddress}/balance`, {
      timeout: 10_000,
    }),
    axios.get(`${BASE_URL}/addresses/${encodedAddress}/utxos/count`, {
      timeout: 10_000,
    }),
    axios.get(`${BASE_URL}/addresses/${encodedAddress}/transactions-count`, {
      timeout: 10_000,
    }),
    axios.get(`${BASE_URL}/addresses/${encodedAddress}/full-transactions-page`, {
      params: { limit: 1, after: 1 },
      timeout: 10_000,
    }),
    axios.get(`${BASE_URL}/addresses/${encodedAddress}/full-transactions-page`, {
      params: { limit: 1 },
      timeout: 10_000,
    }),
  ])

  return {
    address,
    balanceSompi: numberField(balance.data, 'balance'),
    utxoCount: numberField(utxoCount.data, 'count', 'utxoCount'),
    transactionCount: numberField(transactionCount.data, 'total', 'count'),
    firstTransactionAt: transactionTimestamp(firstTransaction.data),
    lastTransactionAt: transactionTimestamp(lastTransaction.data),
  }
}

export async function getAddressTransactions(
  address: string,
  before: number | null,
): Promise<AddressTransactionsPage> {
  const { data, headers } = await axios.get<unknown[]>(
    `${BASE_URL}/addresses/${encodeURIComponent(address)}/full-transactions-page`,
    {
      params: {
        limit: ADDRESS_TRANSACTIONS_PAGE_SIZE,
        resolve_previous_outpoints: 'light',
        ...(before ? { before } : {}),
      },
      timeout: 10_000,
    },
  )

  const nextBefore = Number(headers['x-next-page-before'])
  return {
    transactions: data
      .map((transaction) => parseAddressTransaction(transaction, address))
      .filter((transaction): transaction is AddressTransaction => transaction !== null)
      .sort((left, right) => (right.timestamp ?? 0) - (left.timestamp ?? 0)),
    nextBefore: Number.isFinite(nextBefore) && nextBefore > 0 ? nextBefore : null,
  }
}

export async function getTopAddress() {
  const now = Date.now()
  const hour = 60 * 60 * 1_000
  const alignBefore = (delta: number) =>
    Math.floor((now - delta) / hour) * hour

  const [current, oneDay, sevenDay, thirtyDay] = await Promise.all([
    getTopAddressSnapshot(),
    getTopAddressSnapshot(alignBefore(24 * hour)),
    getTopAddressSnapshot(alignBefore(7 * 24 * hour)),
    getTopAddressSnapshot(alignBefore(30 * 24 * hour)),
  ])

  const historicalByAddress = new Map<
    string,
    {
      oneDay: number | null
      sevenDay: number | null
      thirtyDay: number | null
    }
  >()

  const collectHistory = (
    snapshot: TopAddressSnapshot | null,
    key: 'oneDay' | 'sevenDay' | 'thirtyDay',
  ) => {
    if (!snapshot) return
    for (const entry of snapshot.ranking) {
      if (!entry.address) continue
      const existing = historicalByAddress.get(entry.address) ?? {
        oneDay: null,
        sevenDay: null,
        thirtyDay: null,
      }
      existing[key] = entry.amountKas
      historicalByAddress.set(entry.address, existing)
    }
  }

  collectHistory(oneDay, 'oneDay')
  collectHistory(sevenDay, 'sevenDay')
  collectHistory(thirtyDay, 'thirtyDay')

  const ranking = (current?.ranking ?? []).map((entry) => {
    const history = entry.address ? historicalByAddress.get(entry.address) : null
    const oneDayAmount: number | null = history?.oneDay ?? null
    const sevenDayAmount: number | null = history?.sevenDay ?? null
    const thirtyDayAmount: number | null = history?.thirtyDay ?? null
    return {
      ...entry,
      change1dKas:
        entry.amountKas !== null && oneDayAmount !== null
          ? entry.amountKas - oneDayAmount
          : null,
      change7dKas:
        entry.amountKas !== null && sevenDayAmount !== null
          ? entry.amountKas - sevenDayAmount
          : null,
      change30dKas:
        entry.amountKas !== null && thirtyDayAmount !== null
          ? entry.amountKas - thirtyDayAmount
          : null,
    }
  })

  return {
    timestamp: current?.timestamp ?? null,
    ranking,
  }
}

export async function getAddressNames(): Promise<AddressName[]> {
  const { data } = await axios.get<unknown>(`${BASE_URL}/addresses/names`, {
    timeout: 10_000,
  })

  if (!Array.isArray(data)) return []

  return data
    .map(parseAddressName)
    .filter((item): item is AddressName => item !== null)
}
