import {
  Activity,
  Coins,
  Cpu,
  Gauge,
  Layers,
  Network,
  Timer,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useNetworkCardData } from '@/hooks/useNetworkCardData'
import { usePublicNodes } from '@/hooks/usePublicNodes'

const DEFAULT_BPS = 10

const metrics = [
  { title: 'Live BPS (est.)', label: 'Blocks / sec', icon: Gauge },
  { title: 'Blue score', label: 'Blue score', icon: Layers },
  { title: 'Mempool', label: 'Mempool', icon: Activity },
  { title: 'Hashrate', label: 'Hashrate', icon: Cpu },
  { title: 'Node status', label: 'Node status', icon: Network },
  { title: 'Circulating', label: 'Circulating', icon: Coins },
  { title: 'Block reward', label: 'Block reward', icon: Layers },
  { title: 'Next Reduction', label: 'Next reduction', icon: Timer },
]

function MetricCell({
  label,
  icon: Icon,
  value,
  description,
  status,
}: {
  label: string
  icon: LucideIcon
  value: string
  description?: string
  status: 'ready' | 'loading' | 'error'
}) {
  return (
    <article className="network-stat-cell" aria-busy={status === 'loading'}>
      <div className="network-stat-label">
        <Icon className="size-3.5" strokeWidth={1.9} />
        <span>{label}</span>
      </div>
      {status === 'loading' ? (
        <span className="metric-skeleton mt-3 h-5 w-20" />
      ) : (
        <strong className={status === 'error' ? 'text-[var(--ink-muted)]' : ''}>
          {status === 'error' ? 'Unavailable' : value}
        </strong>
      )}
      <span className="network-stat-description">
        {status === 'error' ? 'Temporarily unable to refresh' : description}
      </span>
    </article>
  )
}

export function NetworkStatsCards() {
  const { cards } = useNetworkCardData()
  const nodes = usePublicNodes()
  const metricData = [
    ...cards,
    {
      title: 'Nodes',
      content: nodes.data ? nodes.data.count.toLocaleString('en-US') : '—',
      description: 'Public nodes',
      isPending: nodes.isPending,
      isError: nodes.isError,
    },
  ]
  const primary = metricData.find((metric) => metric.title === 'Live BPS (est.)')
  const primaryValue =
    primary?.isError
      ? '—'
      : primary?.isPending || primary?.content === 'Measuring…'
        ? DEFAULT_BPS.toString()
        : primary?.content ?? DEFAULT_BPS.toString()
  const supportingMetrics = metrics
    .filter((metric) => metric.title !== 'Live BPS (est.)')
    .map((metric) => ({
      ...metric,
      data: metricData.find((item) => item.title === metric.title),
    }))
  supportingMetrics.push({
    title: 'Nodes',
    label: 'Nodes',
    icon: Network,
    data: metricData.find((item) => item.title === 'Nodes'),
  })

  return (
    <section className="network-overview" aria-label="Network metrics">
      <header className="network-overview-header">
        <div className="flex items-center gap-3">
          <span className="live-panel-icon"><Network className="size-5" /></span>
          <div>
            <p className="eyebrow m-0">Network overview</p>
            <h2>Chain health</h2>
          </div>
        </div>
        <span className="network-live-indicator">
          <i /> Live
        </span>
      </header>
      <div className="network-overview-body">
        <div className="network-primary">
          <div className="network-stat-label">
            <Gauge className="size-4" strokeWidth={1.9} />
            <span>Blocks per second</span>
          </div>
          <strong>{primaryValue}</strong>
          <p>{primary?.isError ? 'Updating network reading' : primary?.description ?? 'Blocks / sec'}</p>
        </div>
        <div className="network-stat-grid">
          {supportingMetrics.map(({ title, label, icon, data }) => (
            <MetricCell
              key={title}
              label={label}
              icon={icon}
              value={data?.content ?? '—'}
              description={data?.description}
              status={data?.isPending ? 'loading' : data?.isError ? 'error' : 'ready'}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
