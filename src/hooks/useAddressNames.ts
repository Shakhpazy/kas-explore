import { useQuery } from '@tanstack/react-query'
import { getAddressNames } from '#/api/address/Address'

export function useAddressNames() {
  return useQuery({
    queryKey: ['address', 'names'],
    queryFn: () => getAddressNames(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })
}
