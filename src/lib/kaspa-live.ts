export type KaspaLiveStatus = 'connecting' | 'live' | 'offline'

export interface LiveBlock {
  hash: string
  daaScore: string
  timestamp: number | null
  transactions: number | null
  minerAddress: string | null
  totalAmount: number | null
}

export interface LiveTransaction {
  id: string
  acceptingBlockHash: string | null
  observedAt: number
  address: string | null
  amount: number | null
}
