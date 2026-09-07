import { useQuery } from '@tanstack/react-query'
import { getTransactionInfo } from '@/api/transaction/Transaction'

export function useTransactionInfo(transactionId: string, enabled = true) {
  return useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => getTransactionInfo(transactionId),
    staleTime: 15_000,
    enabled,
    retry: 3,
    refetchOnWindowFocus: false,
  })
}
