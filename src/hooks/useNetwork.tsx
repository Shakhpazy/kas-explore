import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import {
  getNetworkBlueScore,
  getNetworkBlockReward,
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
    refetchInterval: 10_000,
    staleTime: 5_000,
  })
}

export function useNetworkKaspad() {
  return useQuery({
    queryKey: ['network', 'kaspad'],
    queryFn: getNetworkKaspad,
    refetchInterval: 1_000,
    staleTime: 500,
  })
}

export function useNetworkFees() {
  return useQuery({
    queryKey: ['network', 'fees'],
    queryFn: getNetworkFees,
  })
}

export function useNetworkBlockReward() {
  return useQuery({
    queryKey: ['network', 'blockreward'],
    queryFn: getNetworkBlockReward,
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}

export function useNetworkHalving() {
  return useQuery({
    queryKey: ['network', 'halving'],
    queryFn: getNetworkHalving,
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
    queryFn: getNetworkHashrateMax,
  })
}

export function useNetworkHashrateHistory() {
  return useQuery({
    queryKey: ['network', 'hashrate-history'],
    queryFn: getNetworkHashrateHistory,
  })
}

export function useNetworkHealth() {
  return useQuery({
    queryKey: ['network', 'health'],
    queryFn: getNetworkHealth,
  })
}

export function useNetworkMarketcap() {
  return useQuery({
    queryKey: ['network', 'marketcap'],
    queryFn: getNetworkMarketcap,
  })
}
