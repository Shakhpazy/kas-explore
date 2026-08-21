import { useEffect, useState } from 'react'
import { useNetworkCoinsupply, useNetworkHalving, useNetworkHashrate } from './useNetwork'

export interface NetworkCardData {
  title: string
  content: string
  description?: string
  isPending: boolean
  isError: boolean
}

interface HalvingData {
  nextHalvingTimestamp: number
  nextHalvingAmount: string | number
  nextHalvingDate: string
}

interface HashrateData {
  hashrate: number
}

interface CoinSupplyData {
  circulatingSupply: string | number
  maxSupply: string | number
}

interface FormattedCoinSupply {
  circulatingSupply: string
  maxSupply: string
  mined: string
}

function formatSupply(value?: string | number) {
  if (!value) return 'Unavailable'

  return `${(Number(value) / 100_000_000_000_000_000).toFixed(2)} B`
}

function formatCoinSupply(value?: CoinSupplyData): FormattedCoinSupply {
  if (!value) {
    return {
      circulatingSupply: 'Unavailable',
      maxSupply: 'Unavailable',
      mined: 'Unavailable',
    }
  }

  const circulatingSupply = Number(value.circulatingSupply)
  const maxSupply = Number(value.maxSupply)
  const minedPercentage =
    Number.isFinite(circulatingSupply) && Number.isFinite(maxSupply) && maxSupply > 0
      ? `${((circulatingSupply / maxSupply) * 100).toFixed(2)}%`
      : 'Unavailable'

  return {
    circulatingSupply: formatSupply(value.circulatingSupply),
    maxSupply: formatSupply(value.maxSupply),
    mined: minedPercentage,
  }
}

function formatHalving(value: HalvingData | undefined, now: number) {
  if (!value) {
    return {
      amount: 'Data unavailable',
      countdown: 'Data unavailable',
    }
  }

  const nextHalvingTimestamp = value.nextHalvingTimestamp * 1000

  if (Number.isNaN(nextHalvingTimestamp)) {
    return {
      amount: Number(value.nextHalvingAmount).toFixed(2),
      countdown: 'Data unavailable',
    }
  }

  const remainingMinutes = Math.max(
    0,
    Math.floor((nextHalvingTimestamp - now) / 60_000),
  )
  const days = Math.floor(remainingMinutes / (60 * 24))
  const hours = Math.floor((remainingMinutes % (60 * 24)) / 60)
  const minutes = remainingMinutes % 60

  return {
    amount: Number(value.nextHalvingAmount).toFixed(2),
    countdown: `${days} days ${hours} hours ${minutes} min`,
  }
}

function formatHashrate(value?: HashrateData) {
  if (!value) return 'Unavailable'

  const hashrateInHps = Number(value.hashrate) * 1_000_000_000_000
  const units = ['H/s', 'kH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s', 'EH/s']

  if (!Number.isFinite(hashrateInHps) || hashrateInHps <= 0) {
    return 'Unavailable'
  }

  const unitIndex = Math.min(
    Math.floor(Math.log10(hashrateInHps) / 3),
    units.length - 1,
  )
  const convertedHashrate = hashrateInHps / 1_000 ** unitIndex

  return `${convertedHashrate.toFixed(2)} ${units[unitIndex]}`
}

export function useNetworkCardData() {
  const coinsupply = useNetworkCoinsupply()
  const networkHalving = useNetworkHalving()
  const [now, setNow] = useState(() => Date.now())
  const networkHashrate = useNetworkHashrate()
  const coinSupplyData = formatCoinSupply(coinsupply.data)

  
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000)

    return () => window.clearInterval(timer)
  }, [])

  const halvingData = formatHalving(networkHalving.data, now)


  const cards: NetworkCardData[] = [
    {
      title: 'Circulating',
      content: coinSupplyData.circulatingSupply,
      description: `Mined: ${coinSupplyData.mined}`,
      isPending: coinsupply.isPending,
      isError: coinsupply.isError,
    },
    {
      title: 'Next Reduction',
      content: halvingData.amount,
      description: halvingData.countdown,
      isPending: networkHalving.isPending,
      isError: networkHalving.isError,
    },
    {
      title: 'Hashrate',
      content: formatHashrate(networkHashrate.data).toLocaleString(),
      description: 'Network',
      isPending: networkHashrate.isPending,
      isError: networkHashrate.isError,
    }
  ]

  return { cards }
}