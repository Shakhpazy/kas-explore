import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import {
    getNetworkBlueScore,
    getNetworkCoinsupply,
} from '@/api/network/Network'

export function useNetworkCoinsupply() {
    return useQuery({
        queryKey: ['network', 'coinsupply'],
        queryFn: getNetworkCoinsupply,
    })
}

export function useSuspenseNetworkCoinsupply() {
    return useSuspenseQuery({
        queryKey: ['network', 'coinsupply'],
        queryFn: getNetworkCoinsupply,
    })
}

export function useNetworkBlueScore() {
    return useQuery({
        queryKey: ['network', 'blue-score'],
        queryFn: getNetworkBlueScore,
    })
}
