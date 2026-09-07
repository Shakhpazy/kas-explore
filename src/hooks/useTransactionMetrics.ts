import { useEffect, useMemo, useState } from 'react'
import { useKaspaLive } from '@/hooks/useKaspaLive'
import type { LiveNetworkMetrics } from '@/api/network/Live'

const ONE_HOUR = 60 * 60 * 1_000

interface MetricsSample extends LiveNetworkMetrics {
  timestamp: number
}

function average(samples: MetricsSample[], key: keyof LiveNetworkMetrics) {
  if (samples.length === 0) return null
  return samples.reduce((total, sample) => total + sample[key], 0) / samples.length
}

export function useTransactionMetrics() {
  const live = useKaspaLive()
  const [samples, setSamples] = useState<MetricsSample[]>([])

  useEffect(() => {
    if (!live.metrics || !live.lastUpdatedAt) return

    setSamples((current) => {
      const cutoff = live.lastUpdatedAt - ONE_HOUR
      const recent = current.filter((sample) => sample.timestamp >= cutoff)
      if (recent.at(-1)?.timestamp === live.lastUpdatedAt) return recent
      return [...recent, { ...live.metrics!, timestamp: live.lastUpdatedAt }]
    })
  }, [live.lastUpdatedAt, live.metrics])

  const averages = useMemo(
    () => ({
      transactionsPerSecond: average(samples, 'transactionsPerSecond'),
      inputsPerSecond: average(samples, 'inputsPerSecond'),
      outputsPerSecond: average(samples, 'outputsPerSecond'),
      massPerSecond: average(samples, 'massPerSecond'),
      amountKasPerSecond: average(samples, 'amountKasPerSecond'),
    }),
    [samples],
  )

  return {
    current: live.metrics,
    averages,
    amountSentLastHour:
      averages.amountKasPerSecond === null
        ? null
        : averages.amountKasPerSecond * 60 * 60,
    isPending: live.status === 'connecting',
    isError: live.status === 'offline',
    refetch: live.refetch,
  }
}
