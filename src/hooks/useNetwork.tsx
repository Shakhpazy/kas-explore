import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import {
    getNetworkBlueScore,
    getNetworkCoinsupply,
    getNetworkFees,
    getNetworkHalving,
    getNetworkHashrate,
    getNetworkHashrateHistory,
    getNetworkHashrateMax,
    getNetworkHealth,
    getNetworkKaspad,
    getNetworkMarketcap,
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

export function useNetworkKaspad() {
    return useQuery({
        queryKey: ['network', 'kaspad'],
        queryFn: getNetworkKaspad,
    })
}

export function useNetworkFees() {
    return useQuery({
        queryKey: ['network', 'fees'],
        queryFn: getNetworkFees
    })
}

export function useNetworkHalving() {
    return useQuery({
        queryKey: ['network', 'halving'],
        queryFn: getNetworkHalving
    })
}

export function useNetworkHashrate() {
    return useQuery({
        queryKey: ['network', 'hashrate'],
        queryFn: getNetworkHashrate,
        refetchInterval: 2_000,
    })
}

export function useNetworkHashrateMax() {
    return useQuery({
        queryKey: ['network', 'hashrate-max'],
        queryFn: getNetworkHashrateMax
    })
}

export function useNetworkHashrateHistory() {
    return useQuery({
        queryKey: ['network', 'hashrate-history'],
        queryFn: getNetworkHashrateHistory
    })
}

export function useNetworkHealth() {
    return useQuery({
        queryKey: ['network', 'health'],
        queryFn: getNetworkHealth
    })
}

export function useNetworkMarketcap() {
    return useQuery({
        queryKey: ['network', 'marketcap'],
        queryFn: getNetworkMarketcap
    })
}