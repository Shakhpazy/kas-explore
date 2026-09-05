import { useEffect, useRef, useState } from 'react'
import {
  useNetworkCoinsupply,
  useNetworkHalving,
  useNetworkHashrate,
  useNetworkKaspad,
  useNetworkBlockReward,
  useNetworkBlueScore,
} from './useNetwork'

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
    Number.isFinite(circulatingSupply) &&
    Number.isFinite(maxSupply) &&
    maxSupply > 0
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
  const kaspad = useNetworkKaspad()
  const reward = useNetworkBlockReward()
  const blueScore = useNetworkBlueScore()
  const samples = useRef<Array<{ score: number; time: number }>>([])
  const [bps, setBps] = useState<number | null>(null)

  useEffect(() => {
    const score = blueScore.data?.blueScore
    const time = blueScore.dataUpdatedAt
    if (score === undefined || !time || blueScore.isError) return
    const previous = samples.current.at(-1)
    if (previous?.time === time) return
    if (previous && (score < previous.score || time - previous.time > 90_000)) {
      samples.current = []
      setBps(null)
    }
    samples.current = [
      ...samples.current.filter((sample) => time - sample.time <= 60_000),
      { score, time },
    ]
    const first = samples.current[0]
    if (time > first.time)
      setBps((score - first.score) / ((time - first.time) / 1000))
  }, [blueScore.data, blueScore.dataUpdatedAt, blueScore.isError])
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
    },
    {
      title: 'Mempool',
      content: kaspad.data
        ? Number(kaspad.data.mempoolSize).toLocaleString('en-US')
        : '—',
      description:
        kaspad.data?.isSynced === false
          ? 'API node is syncing'
          : 'Pending transactions · API node',
      isPending: kaspad.isPending,
      isError: kaspad.isError,
    },
    {
      title: 'Block reward',
      content: reward.data
        ? `${reward.data.blockreward.toLocaleString('en-US', { maximumFractionDigits: 4 })} KAS`
        : '—',
      description: 'Current subsidy per block',
      isPending: reward.isPending,
      isError: reward.isError,
    },
    {
      title: 'Live BPS (est.)',
      content: bps === null ? 'Measuring…' : bps.toFixed(2),
      description: 'Current',
      isPending: blueScore.isPending,
      isError: blueScore.isError,
    },
    {
      title: 'Network nodes',
      content: 'Unavailable',
      description: 'Network-wide count needs a node census',
      isPending: false,
      isError: false,
    },
    {
      title: 'Miners',
      content: 'Unavailable',
      description: 'No network-wide miner count source',
      isPending: false,
      isError: false,
    },
  ]

  return { cards }
}
