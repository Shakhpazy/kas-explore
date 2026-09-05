import { useQuery } from '@tanstack/react-query'
import { getNetworkActivity } from '@/api/network/Activity'
import type { ActivityRange } from '@/api/network/Activity'

export function useNetworkActivity(range: ActivityRange) {
  return useQuery({
    queryKey: ['network', 'activity', range],
    queryFn: ({ signal }) => getNetworkActivity(range, signal),
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: 1,
  })
}
