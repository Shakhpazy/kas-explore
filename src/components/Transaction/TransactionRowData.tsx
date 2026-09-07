import {
  ArrowLeftRight,
  ArrowRightFromLine,
  ArrowRightToLine,
  Gauge,
  ReceiptText,
  WalletCards,
} from 'lucide-react'
import { useTransactionMetrics } from '@/hooks/useTransactionMetrics'
import { formatKasValue } from '@/lib/utils'

function compact(value: number | null, digits = 1) {
  if (value === null || !Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: digits,
  }).format(value)
}

function decimal(value: number | null, digits = 1) {
  if (value === null || !Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

function MetricCell({
  icon,
  label,
  value,
  detail,
  kas = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  detail: string
  kas?: boolean
}) {
  return (
    <article className="network-stat-cell">
      <div className="network-stat-label">
        {icon}
        <span>{label}</span>
      </div>
      <strong className={kas ? 'kas-amount' : undefined}>{value}</strong>
      <span className="network-stat-description">{detail}</span>
    </article>
  )
}

function MetricsSkeleton() {
  return (
    <section className="network-overview mt-6" aria-hidden="true">
      <div className="network-overview-header">
        <span className="metric-skeleton h-8 w-44" />
      </div>
      <div className="network-overview-body">
        <div className="network-primary">
          <span className="metric-skeleton h-3 w-24" />
          <span className="metric-skeleton mt-4 h-9 w-20" />
          <span className="metric-skeleton mt-3 h-3 w-28" />
        </div>
        <div className="network-stat-grid">
          {Array.from({ length: 4 }, (_, index) => (
            <article className="network-stat-cell" key={index}>
              <span className="metric-skeleton h-3 w-20" />
              <span className="metric-skeleton mt-3 h-5 w-16" />
              <span className="metric-skeleton mt-2 h-3 w-24" />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function TransactionRowData() {
  const metrics = useTransactionMetrics()

  if (metrics.isPending) return <MetricsSkeleton />

  if (metrics.isError || !metrics.current) {
    return (
      <section className="address-history-message mt-6 text-[var(--danger)]">
        Transaction metrics could not be loaded.
        <button type="button" onClick={() => void metrics.refetch()}>
          Try again
        </button>
      </section>
    )
  }

  return (
    <section className="network-overview mt-6" aria-label="Transaction network metrics">
      <header className="network-overview-header">
        <div className="flex items-center gap-3">
          <span className="live-panel-icon"><ReceiptText className="size-5" /></span>
          <div>
            <p className="eyebrow m-0">Live network data</p>
            <h2>Transaction activity</h2>
          </div>
        </div>
        <span className="network-live-indicator"><i /> Live</span>
      </header>
      <div className="network-overview-body">
        <div className="network-primary">
          <div className="network-stat-label">
            <ArrowLeftRight className="size-4" strokeWidth={1.9} />
            <span>TPS</span>
          </div>
          <strong>{decimal(metrics.current.transactionsPerSecond)}</strong>
          <p>1h avg: {decimal(metrics.averages.transactionsPerSecond)}</p>
        </div>
        <div className="network-stat-grid">
          <MetricCell
            icon={<ArrowRightToLine className="size-3.5" strokeWidth={1.9} />}
            label="Inputs/s"
            value={compact(metrics.current.inputsPerSecond, 1)}
            detail={`1h avg: ${compact(metrics.averages.inputsPerSecond, 1)}`}
          />
          <MetricCell
            icon={<ArrowRightFromLine className="size-3.5" strokeWidth={1.9} />}
            label="Outputs/s"
            value={compact(metrics.current.outputsPerSecond, 1)}
            detail={`1h avg: ${compact(metrics.averages.outputsPerSecond, 1)}`}
          />
          <MetricCell
            icon={<Gauge className="size-3.5" strokeWidth={1.9} />}
            label="Mass/s"
            value={compact(metrics.current.massPerSecond, 1)}
            detail={`1h avg: ${compact(metrics.averages.massPerSecond, 1)}`}
          />
          <MetricCell
            icon={<WalletCards className="size-3.5" strokeWidth={1.9} />}
            label="Amount sent"
            value={formatKasValue(metrics.amountSentLastHour, 1)}
            detail="Last hour"
            kas
          />
        </div>
      </div>
    </section>
  )
}
