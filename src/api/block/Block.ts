import axios from 'axios'

export interface BlockInfo {
  header: {
    timestamp: string
    daaScore: string
    blueScore?: string
    version: number
    bits: number
    nonce: string
    blueWork: string
    hashMerkleRoot: string
    acceptedIdMerkleRoot: string
    utxoCommitment: string
    pruningPoint: string
    parents?: Array<{ parentHashes: string[] }>
  }
  verboseData: {
    hash: string
    difficulty: number
    blueScore: string
    isChainBlock: boolean
    selectedParentHash?: string
    childrenHashes?: string[]
    transactionIds?: string[]
  }
  extra?: { color?: string; minerAddress?: string; minerInfo?: string }
  transactions?: Array<{
    inputs?: unknown[]
    outputs?: Array<{
      amount: string | number
      verboseData?: { scriptPublicKeyAddress?: string }
    }>
    verboseData: { transactionId: string }
  }>
}

export async function getBlockInfo(hash: string, signal?: AbortSignal) {
  const { data } = await axios.get<Partial<BlockInfo>>(
    `https://api.kaspa.org/blocks/${encodeURIComponent(hash)}`,
    {
      params: { includeTransactions: true, includeColor: true },
      signal,
      timeout: 10_000,
    },
  )
  if (!data.header || !data.verboseData)
    throw new Error('Invalid block response')
  return { ...data, header: data.header, verboseData: data.verboseData }
}
