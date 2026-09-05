import {
  Activity,
  Coins,
  Cpu,
  Gauge,
  Layers,
  Network,
  Pickaxe,
  Timer,
} from 'lucide-react'
import { Card } from '@/components/ui/card/Card'
import { useNetworkCardData } from '@/hooks/useNetworkCardData'
import { usePublicNodes } from '@/hooks/usePublicNodes'

const metrics = [
  { title: 'Circulating', label: 'Circulating supply', icon: Coins },
  { title: 'Hashrate', label: 'Network hashrate', icon: Cpu },
  { title: 'Block reward', label: 'Block reward', icon: Layers },
  { title: 'Next Reduction', label: 'Next reduction', icon: Timer },
  { title: 'Mempool', label: 'Mempool transactions', icon: Activity },
  { title: 'Live BPS (est.)', label: 'Blocks per second', icon: Gauge },
]

export function NetworkStatsCards() {
  const { cards } = useNetworkCardData()
  const nodes = usePublicNodes()
  return (
    <section className="network-panel" aria-labelledby="network-metrics-title">
      <header className="network-panel-heading">
        <div>
          <p className="eyebrow m-0 mb-2">On-chain telemetry</p>
          <h2
            id="network-metrics-title"
            className="m-0 text-lg font-extrabold tracking-[-.04em]"
          >
            Network essentials
          </h2>
        </div>
        <Network
          className="size-5 text-[var(--accent)]"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </header>
      <div className="network-metric-grid">
        {metrics.map(({ title, label, icon }) => {
          const card = cards.find((item) => item.title === title)
          if (!card) return null
          return (
            <Card
              key={title}
              title={label}
              icon1={icon}
              status={
                card.isPending ? 'loading' : card.isError ? 'error' : 'ready'
              }
              content={card.isError ? 'Unavailable' : card.content}
              description={
                card.isError
                  ? 'Temporarily unable to refresh'
                  : card.description
              }
            />
          )
        })}
      </div>
      <footer className="network-coverage">
        <p className="m-0 text-xs font-bold uppercase tracking-[.12em] text-[var(--ink-muted)]">
          Coverage
        </p>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          <span className="inline-flex items-center gap-2 text-sm">
            <Network className="size-3.5" aria-hidden="true" />
            Public nodes{' '}
            <span className="font-semibold" aria-live="polite">
              {nodes.data
                ? nodes.data.count.toLocaleString('en-US')
                : nodes.isPending
                  ? 'Loading…'
                  : 'Unavailable'}
            </span>
          </span>
          <span className="inline-flex items-center gap-2 text-sm">
            <Pickaxe className="size-3.5" aria-hidden="true" />
            Miners <span className="text-[var(--ink-muted)]">—</span>
          </span>
        </div>
        <p className="mb-0 mt-2 text-[13px] leading-5 text-[var(--ink-muted)]">
          <a
            href="https://nodes.kaspa.ws/"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            Kaspa Node Map
          </a>{' '}
          · Publicly reachable nodes only.
          {nodes.data && (
            <>
              {' '}
              Updated{' '}
              {new Date(nodes.data.updatedAt)
                .toISOString()
                .replace('T', ' ')
                .slice(0, 16)}{' '}
              UTC.
            </>
          )}
          {nodes.isError && (
            <>
              {' '}
              Unable to refresh.
              {nodes.data ? ' Showing last received count.' : ''}{' '}
              <button
                type="button"
                className="underline underline-offset-2"
                onClick={() => void nodes.refetch()}
                disabled={nodes.isFetching}
              >
                Retry
              </button>
            </>
          )}{' '}
          Network-wide miner counts remain unavailable.
        </p>
      </footer>
    </section>
  )
}
