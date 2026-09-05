import { useQuery } from '@tanstack/react-query'
import { getPublicNodeCount } from '@/api/network/NodeMap'

export function usePublicNodes() {
  return useQuery({
    queryKey: ['network', 'public-nodes'],
    queryFn: ({ signal }) => getPublicNodeCount(signal),
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: 1,
  })
}
