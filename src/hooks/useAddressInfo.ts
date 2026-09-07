import { useQuery } from '@tanstack/react-query'
import { getAddressInfo } from '@/api/address/Address'

export function useAddressInfo(address: string) {
  return useQuery({
    queryKey: ['address', address],
    queryFn: () => getAddressInfo(address),
    staleTime: 15_000,
  })
}
