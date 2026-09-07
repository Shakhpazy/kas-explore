import { Coins } from 'lucide-react'
import { useMemo } from 'react'
import { useNetworkCoinsupply } from '@/hooks/useNetwork'
import { useTopAddress } from '@/hooks/useTopAddress'
import {
  formatDateMedium,
  formatKasBillions,
  formatKasBillionsFromSompi,
  formatPercentFromBigInt,
} from '@/lib/utils'

const BUCKETS = [10, 100, 1_000] as const
type BucketSummary = {
  label: string
  count: number
  amountKas: bigint
  shareOfCirculating: string
}

function sumRankingAmount(
  ranking: Array<{ amountRaw: string | null }>,
  limit?: number,
) {
  return ranking.slice(0, limit).reduce((total, entry) => {
    if (!entry.amountRaw || !/^-?\d+$/.test(entry.amountRaw)) return total
    return total + BigInt(entry.amountRaw)
  }, 0n)
}

function buildSummary(
  ranking: Array<{ amountRaw: string | null }>,
  circulatingSompi: bigint | null,
): BucketSummary[] {
  const totalAmountKas = sumRankingAmount(ranking)

  return [
    ...BUCKETS.map((bucket) => {
      const amountKas = sumRankingAmount(ranking, bucket)
      return {
        label: `Top ${bucket}`,
        count: Math.min(bucket, ranking.length),
        amountKas,
        shareOfCirculating: formatPercentFromBigInt(
          amountKas * 100_000_000n,
          circulatingSompi,
        ),
      }
    }),
    {
      label: 'All tracked',
      count: ranking.length,
      amountKas: totalAmountKas,
      shareOfCirculating: formatPercentFromBigInt(
        totalAmountKas * 100_000_000n,
        circulatingSompi,
      ),
    },
  ]
}

function SummaryCard({
  label,
  value,
  detail,
  loading,
}: {
  label: string
  value: string
  detail: string
  loading?: boolean
}) {
  return (
    <article className="network-stat-cell" aria-busy={loading}>
      <div className="network-stat-label">
        <span>{label}</span>
      </div>
      {loading ? (
        <span className="metric-skeleton mt-3 h-5 w-24" />
      ) : (
        <strong className="kas-amount">{value}</strong>
      )}
      <span className="network-stat-description">{detail}</span>
    </article>
  )
}

function AddressRowDataSkeleton() {
  return (
    <section className="address-row-data mt-6" aria-hidden="true">
      <div className="network-overview">
        <div className="network-overview-header">
          <div className="flex items-center gap-3">
            <span className="live-panel-icon">
              <Coins className="size-5" />
            </span>
            <div>
              <p className="eyebrow m-0">Supply concentration</p>
              <h2 className="m-0 mt-1 text-[1.35rem] font-extrabold tracking-[-.04em]">
                Top address holdings
              </h2>
            </div>
          </div>
          <span className="address-row-data-meta">
            <span className="metric-skeleton h-3 w-28" />
          </span>
        </div>

        <div className="network-overview-body address-row-data-body">
          <div className="network-primary">
            <div className="network-stat-label">
              <Coins className="size-4" strokeWidth={1.9} />
              <span>Circulating supply</span>
            </div>
            <span className="metric-skeleton mt-4 h-9 w-36" />
            <p className="metric-skeleton mt-3 h-3 w-40" />
          </div>
          <div className="network-stat-grid address-row-data-grid">
            {Array.from({ length: 4 }, (_, index) => (
              <SummaryCard
                key={index}
                label="Loading"
                value="—"
                detail="Fetching top-address snapshot"
                loading
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function AddressRowData() {
  const topAddress = useTopAddress()
  const coinsupply = useNetworkCoinsupply()
  const ranking = topAddress.data?.ranking ?? []
  const snapshotTime = topAddress.data?.timestamp ?? null

  const circulatingSompi = useMemo(() => {
    if (coinsupply.data?.circulatingSupply === undefined) return null
    const raw = String(coinsupply.data.circulatingSupply).trim()
    return /^-?\d+$/.test(raw) ? BigInt(raw) : null
  }, [coinsupply.data?.circulatingSupply])

  const summary = useMemo(
    () => buildSummary(ranking, circulatingSompi),
    [circulatingSompi, ranking],
  )

  const trackedLabel =
    ranking.length === 0
      ? 'No ranked addresses available'
      : `${ranking.length.toLocaleString('en-US')} ranked addresses tracked`

  if (topAddress.isPending || coinsupply.isPending) {
    return <AddressRowDataSkeleton />
  }

  if (topAddress.isError || coinsupply.isError) {
    return (
      <section className="address-row-data mt-6">
        <div className="address-history-message text-[var(--danger)]">
          Top address concentration could not be loaded.
          <button
            type="button"
            onClick={() => {
              void topAddress.refetch()
              void coinsupply.refetch()
            }}
          >
            Try again
          </button>
        </div>
      </section>
    )
  }

  return (
    <section
      className="address-row-data mt-6"
      aria-labelledby="address-row-data-title"
    >
      <div className="network-overview">
        <div className="network-overview-header">
          <div className="flex items-center gap-3">
            <span className="live-panel-icon">
              <Coins className="size-5" />
            </span>
            <div>
              <p className="eyebrow m-0">Supply concentration</p>
              <h2 id="address-row-data-title">Top address holdings</h2>
            </div>
          </div>
          <div className="address-row-data-meta">
            <span>Snapshot</span>
            <strong>
              {formatDateMedium(snapshotTime, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </strong>
          </div>
        </div>

        <div className="network-overview-body address-row-data-body">
          <div className="network-primary">
            <div className="network-stat-label">
              <Coins className="size-4" strokeWidth={1.9} />
              <span>Circulating supply</span>
            </div>
            <strong className="kas-amount">
              {formatKasBillionsFromSompi(circulatingSompi, 2)}
            </strong>
            <p>{trackedLabel}</p>
          </div>

          <div className="network-stat-grid address-row-data-grid">
            {summary.map((bucket) => (
              <SummaryCard
                key={bucket.label}
                label={bucket.label}
                value={formatKasBillions(bucket.amountKas, 2)}
                detail={
                  bucket.shareOfCirculating === '—'
                    ? 'Percentage unavailable'
                    : `${bucket.shareOfCirculating} of circulating supply`
                }
              />
            ))}
          </div>
        </div>
      </div>

    </section>
  )
}
