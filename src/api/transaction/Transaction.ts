import axios from 'axios'

const BASE_URL = 'https://api.kaspa.org'

type ApiRecord = Record<string, unknown>

function record(value: unknown): ApiRecord | null {
  return value && typeof value === 'object' ? (value as ApiRecord) : null
}

function field(value: unknown, ...keys: string[]) {
  const source = record(value)
  return keys.map((key) => source?.[key]).find((item) => item !== undefined)
}

function arrayField(value: unknown, ...keys: string[]) {
  const item = field(value, ...keys)
  return Array.isArray(item) ? item : []
}

function stringField(value: unknown, ...keys: string[]) {
  const item = field(value, ...keys)
  return typeof item === 'string' || typeof item === 'number' ? String(item) : null
}

function numberField(value: unknown, ...keys: string[]) {
  const parsed = Number(field(value, ...keys))
  return Number.isFinite(parsed) ? parsed : null
}

function timestampField(value: unknown, ...keys: string[]) {
  const timestamp = numberField(value, ...keys)
  if (timestamp === null) return null
  return timestamp < 10_000_000_000 ? timestamp * 1_000 : timestamp
}

export interface TransactionInput {
  index: number
  previousTransactionId: string | null
  previousIndex: number | null
  address: string | null
  amountSompi: number | null
}

export interface TransactionOutput {
  index: number
  address: string | null
  amountSompi: number | null
}

export interface TransactionInfo {
  id: string
  timestamp: number | null
  isAccepted: boolean
  acceptingBlockHash: string | null
  acceptingBlueScore: number | null
  mass: number | null
  totalOutputSompi: number | null
  feeSompi: number | null
  inputs: TransactionInput[]
  outputs: TransactionOutput[]
}

function parseInput(value: unknown, index: number): TransactionInput {
  return {
    index: numberField(value, 'index') ?? index,
    previousTransactionId: stringField(
      value,
      'previous_outpoint_hash',
      'previousOutpointHash',
    ),
    previousIndex: numberField(
      value,
      'previous_outpoint_index',
      'previousOutpointIndex',
    ),
    address: stringField(
      value,
      'previous_outpoint_address',
      'previousOutpointAddress',
    ),
    amountSompi: numberField(
      value,
      'previous_outpoint_amount',
      'previousOutpointAmount',
    ),
  }
}

function parseOutput(value: unknown, index: number): TransactionOutput {
  return {
    index: numberField(value, 'index') ?? index,
    address: stringField(
      value,
      'script_public_key_address',
      'scriptPublicKeyAddress',
    ),
    amountSompi: numberField(value, 'amount'),
  }
}

export async function getTransactionInfo(
  transactionId: string,
): Promise<TransactionInfo> {
  const { data } = await axios.get<unknown>(
    `${BASE_URL}/transactions/${encodeURIComponent(transactionId)}`,
    {
      params: { resolve_previous_outpoints: 'light' },
      timeout: 10_000,
    },
  )
  const inputs = arrayField(data, 'inputs').map(parseInput)
  const outputs = arrayField(data, 'outputs').map(parseOutput)
  const totalOutputSompi = outputs.reduce(
    (total, output) => total + (output.amountSompi ?? 0),
    0,
  )
  const allInputsResolved = inputs.every((input) => input.amountSompi !== null)
  const totalInputSompi = inputs.reduce(
    (total, input) => total + (input.amountSompi ?? 0),
    0,
  )

  return {
    id: stringField(data, 'transaction_id', 'transactionId', 'id') ?? transactionId,
    timestamp: timestampField(
      data,
      'accepting_block_time',
      'acceptingBlockTime',
      'block_time',
      'blockTime',
    ),
    isAccepted: field(data, 'is_accepted', 'isAccepted') === true,
    acceptingBlockHash: stringField(
      data,
      'accepting_block_hash',
      'acceptingBlockHash',
    ),
    acceptingBlueScore: numberField(
      data,
      'accepting_block_blue_score',
      'acceptingBlockBlueScore',
    ),
    mass: numberField(data, 'mass'),
    totalOutputSompi: outputs.length ? totalOutputSompi : null,
    feeSompi: allInputsResolved ? totalInputSompi - totalOutputSompi : null,
    inputs,
    outputs,
  }
}
