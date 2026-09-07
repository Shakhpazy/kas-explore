import { useQuery } from '@tanstack/react-query'
import { getBlockInfo } from '@/api/block/Block'

export function useBlockInfo(hash: string) {
  return useQuery({
    queryKey: ['block', hash],
    queryFn: ({ signal }) => getBlockInfo(hash, signal),
    enabled: /^[a-f0-9]{64}$/i.test(hash),
    staleTime: 10_000,
    refetchInterval: 10_000,
    retry: 2,
  })
}
