import axios from 'axios'
import type { LiveBlock, LiveTransaction } from '@/lib/kaspa-live'

const BASE_URL = 'https://api.kaspa.org'
const BLOCK_LIMIT = 6

type ApiRecord = Record<string, unknown>

export interface LiveNetworkMetrics {
  transactionsPerSecond: number
  inputsPerSecond: number
  outputsPerSecond: number
  massPerSecond: number
  amountKasPerSecond: number
}

interface LiveNetworkData {
  blockCount: string | null
  daaScore: string | null
  blocks: LiveBlock[]
  transactions: LiveTransaction[]
  metrics: LiveNetworkMetrics
}

const NETWORK_BLOCKS_PER_SECOND = 10

function record(value: unknown): ApiRecord | null {
  return value && typeof value === 'object' ? (value as ApiRecord) : null
}

function string(value: unknown): string | null {
  return typeof value === 'string' || typeof value === 'number'
    ? String(value)
    : null
}

function field(source: ApiRecord | null, ...keys: string[]) {
  return keys.map((key) => source?.[key]).find((item) => item !== undefined)
}

function kasAmount(value: unknown) {
  const sompi = Number(value)
  return Number.isFinite(sompi) ? sompi / 100_000_000 : null
}

function outputAddress(output: unknown) {
  const recordOutput = record(output)
  const verbose = record(field(recordOutput, 'verboseData', 'verbose_data'))
  return string(
    field(
      recordOutput,
      'scriptPublicKeyAddress',
      'script_public_key_address',
    ) ?? field(verbose, 'scriptPublicKeyAddress', 'script_public_key_address'),
  )
}

function parseBlock(
  hash: string,
  data: unknown,
): {
  block: LiveBlock
  transactions: LiveTransaction[]
  metrics: Omit<LiveNetworkMetrics, `${string}PerSecond`> & {
    transactions: number
    inputs: number
    outputs: number
    mass: number
    amountKas: number
  }
} {
  const response = record(data)
  const block = record(field(response, 'block')) ?? response
  const header = record(field(block, 'header'))
  const rawTimestamp = Number(field(header, 'timestamp'))
  const transactions = field(block, 'transactions')
  const items = Array.isArray(transactions) ? transactions : []
  const coinbaseOutputs = field(record(items[0]), 'outputs')
  const timestamp = Number.isFinite(rawTimestamp)
    ? rawTimestamp < 10_000_000_000
      ? rawTimestamp * 1_000
      : rawTimestamp
    : null

  const liveTransactions: LiveTransaction[] = items
    .map((item): LiveTransaction | null => {
      const transaction = record(item)
      const verbose = record(field(transaction, 'verboseData', 'verbose_data'))
      const outputs = field(transaction, 'outputs')
      const firstOutput = Array.isArray(outputs) ? outputs[0] : undefined
      const amount = Array.isArray(outputs)
        ? outputs.reduce<number>(
            (total, output) =>
              total + (kasAmount(field(record(output), 'amount')) ?? 0),
            0,
          )
        : null
      const id = string(
        field(transaction, 'id', 'transactionId', 'transaction_id') ??
          field(verbose, 'transactionId', 'transaction_id'),
      )
      return id
        ? {
            id,
            acceptingBlockHash: hash,
            observedAt: Date.now(),
            address: outputAddress(firstOutput),
            amount,
          }
        : null
    })
    .filter(
      (transaction): transaction is LiveTransaction => transaction !== null,
    )

  const regularTransactions = items.slice(1)
  const metrics = regularTransactions.reduce(
    (total, item) => {
      const transaction = record(item)
      const inputs = field(transaction, 'inputs')
      const outputs = field(transaction, 'outputs')
      const mass = Number(
        field(transaction, 'storageMass', 'storage_mass', 'mass'),
      )

      total.transactions += 1
      total.inputs += Array.isArray(inputs) ? inputs.length : 0
      total.outputs += Array.isArray(outputs) ? outputs.length : 0
      total.mass += Number.isFinite(mass) ? mass : 0
      total.amountKas += Array.isArray(outputs)
        ? outputs.reduce(
            (amount, output) =>
              amount + (kasAmount(field(record(output), 'amount')) ?? 0),
            0,
          )
        : 0
      return total
    },
    { transactions: 0, inputs: 0, outputs: 0, mass: 0, amountKas: 0 },
  )

  return {
    block: {
      hash,
      daaScore: string(field(header, 'daaScore', 'daa_score')) ?? '—',
      timestamp,
      transactions: items.length,
      minerAddress: outputAddress(
        Array.isArray(coinbaseOutputs) ? coinbaseOutputs[0] : undefined,
      ),
      totalAmount: items.reduce((total, item) => {
        const outputs = field(record(item), 'outputs')
        return (
          total +
          (Array.isArray(outputs)
            ? outputs.reduce(
                (amount, output) =>
                  amount + (kasAmount(field(record(output), 'amount')) ?? 0),
                0,
              )
            : 0)
        )
      }, 0),
    } satisfies LiveBlock,
    transactions: liveTransactions,
    metrics,
  }
}

export async function getLiveNetworkData(): Promise<LiveNetworkData> {
  const { data: dag } = await axios.get(`${BASE_URL}/info/blockdag`, {
    timeout: 10_000,
  })
  const dagInfo = record(dag)
  const tipHashes = field(dagInfo, 'tipHashes', 'tip_hashes')
  const hashes = (Array.isArray(tipHashes) ? tipHashes : [])
    .map(string)
    .filter((hash): hash is string => Boolean(hash))
    .slice(0, BLOCK_LIMIT)
  const blockResults = await Promise.allSettled(
    hashes.map(async (hash) => {
      const { data } = await axios.get(`${BASE_URL}/blocks/${hash}`, {
        timeout: 10_000,
      })
      return parseBlock(hash, data)
    }),
  )
  const blocks = blockResults
    .filter(
      (result): result is PromiseFulfilledResult<ReturnType<typeof parseBlock>> =>
        result.status === 'fulfilled',
    )
    .map((result) => result.value)

  if (blocks.length === 0) {
    throw new Error('No current BlockDAG tips could be loaded.')
  }

  const totals = blocks.reduce(
    (total, entry) => {
      total.transactions += entry.metrics.transactions
      total.inputs += entry.metrics.inputs
      total.outputs += entry.metrics.outputs
      total.mass += entry.metrics.mass
      total.amountKas += entry.metrics.amountKas
      return total
    },
    { transactions: 0, inputs: 0, outputs: 0, mass: 0, amountKas: 0 },
  )
  const sampledBlocks = Math.max(1, blocks.length)
  const rateMultiplier = NETWORK_BLOCKS_PER_SECOND / sampledBlocks

  return {
    blockCount: string(field(dagInfo, 'blockCount', 'block_count')),
    daaScore: string(field(dagInfo, 'virtualDaaScore', 'virtual_daa_score')),
    blocks: blocks
      .map((entry) => entry.block)
      .sort((left, right) => (right.timestamp ?? 0) - (left.timestamp ?? 0)),
    transactions: blocks.flatMap((entry) => entry.transactions).slice(0, 10),
    metrics: {
      transactionsPerSecond: totals.transactions * rateMultiplier,
      inputsPerSecond: totals.inputs * rateMultiplier,
      outputsPerSecond: totals.outputs * rateMultiplier,
      massPerSecond: totals.mass * rateMultiplier,
      amountKasPerSecond: totals.amountKas * rateMultiplier,
    },
  }
}
