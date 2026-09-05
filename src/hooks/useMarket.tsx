import { useQuery } from '@tanstack/react-query'
import { getKaspaMarketChart } from '@/api/market/Market'
import type { MarketRange } from '@/api/market/Market'

export function useKaspaMarketChart(range: MarketRange) {
  return useQuery({
    queryKey: ['market', 'kaspa', 'usd', range],
    queryFn: () => getKaspaMarketChart(range),
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}
