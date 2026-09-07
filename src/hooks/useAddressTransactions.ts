import { useInfiniteQuery } from '@tanstack/react-query'
import { getAddressTransactions } from '@/api/address/Address'

export function useAddressTransactions(address: string) {
  return useInfiniteQuery({
    queryKey: ['address', address, 'transactions'],
    queryFn: ({ pageParam }) => getAddressTransactions(address, pageParam),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => lastPage.nextBefore ?? undefined,
    staleTime: 15_000,
  })
}
