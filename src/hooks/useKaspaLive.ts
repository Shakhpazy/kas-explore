import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getLiveNetworkData } from '@/api/network/Live'
import type { LiveBlock, LiveTransaction } from '@/lib/kaspa-live'

const MAX_HISTORY = 100

function mergeLatest<T>(
  latest: T[],
  history: T[],
  getKey: (item: T) => string,
) {
  const seen = new Set<string>()
  return [...latest, ...history]
    .filter((item) => {
      const key = getKey(item)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, MAX_HISTORY)
}

export function useKaspaLive({ paused = false }: { paused?: boolean } = {}) {
  const [blocks, setBlocks] = useState<LiveBlock[]>([])
  const [transactions, setTransactions] = useState<LiveTransaction[]>([])
  const query = useQuery({
    queryKey: ['network', 'live-chain'],
    queryFn: getLiveNetworkData,
    staleTime: 8_000,
    refetchInterval: paused ? false : 10_000,
    retry: true,
    retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 10_000),
  })

  useEffect(() => {
    if (!query.data) return
    setBlocks((history) =>
      mergeLatest(query.data.blocks, history, (block) => block.hash),
    )
    setTransactions((history) =>
      mergeLatest(
        query.data.transactions,
        history,
        (transaction) => transaction.id,
      ),
    )
  }, [query.data])

  return {
    status: query.isFetching && !query.data
      ? ('connecting' as const)
      : query.isError
        ? ('offline' as const)
      : query.isSuccess
        ? ('live' as const)
        : ('connecting' as const),
    blockCount: query.data?.blockCount ?? null,
    daaScore: query.data?.daaScore ?? null,
    blocks,
    transactions,
    lastUpdatedAt: query.dataUpdatedAt,
    isFetching: query.isFetching,
    metrics: query.data?.metrics ?? null,
    refetch: query.refetch,
    paused,
  }
}
