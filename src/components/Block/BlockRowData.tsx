import { Blocks } from 'lucide-react'
import { useKaspaLive } from '@/hooks/useKaspaLive'
import { useNetworkBlueScore, useNetworkBlockReward } from '@/hooks/useNetwork'
import { formatKasValue } from '@/lib/utils'

export function BlockRowData() {
  const live = useKaspaLive()
  const score = useNetworkBlueScore()
  const reward = useNetworkBlockReward()
  const cells = [
    {
      label: 'DAA score',
      value: live.daaScore,
      pending: live.status === 'connecting',
      detail: 'Difficulty adjustment score',
    },
    {
      label: 'Blue score',
      value: score.data?.blueScore.toLocaleString(),
      pending: score.isPending,
      detail: 'Virtual chain',
    },
    {
      label: 'Block reward',
      value: reward.data ? formatKasValue(reward.data.blockreward) : null,
      pending: reward.isPending,
      detail: 'Current reward',
      kas: true,
    },
    {
      label: 'Recent blocks',
      value: live.blocks.length.toString(),
      pending: live.status === 'connecting',
      detail: 'Up to 100 stored locally',
    },
  ]
  return (
    <section
      className="network-overview mt-6"
      aria-label="Block network overview"
    >
      <header className="network-overview-header">
        <div className="flex items-center gap-3">
          <span className="live-panel-icon">
            <Blocks className="size-5" />
          </span>
          <div>
            <p className="eyebrow m-0">Network overview</p>
            <h2>Block activity</h2>
          </div>
        </div>
      </header>
      <div className="network-overview-body">
        <div className="network-primary">
          <div className="network-stat-label">
            <Blocks className="size-4" />
            <span>Block count</span>
          </div>
          {live.status === 'connecting' ? (
            <span className="metric-skeleton mt-4 h-9 w-36" />
          ) : (
            <strong>
              {live.blockCount ? Number(live.blockCount).toLocaleString() : '—'}
            </strong>
          )}
          <p>Reporting node</p>
        </div>
        <div className="network-stat-grid">
          {cells.map((cell) => (
            <article
              key={cell.label}
              className="network-stat-cell"
              aria-busy={cell.pending}
            >
              <div className="network-stat-label">{cell.label}</div>
              {cell.pending ? (
                <span className="metric-skeleton mt-3 h-5 w-24" />
              ) : (
                <strong className={cell.kas ? 'kas-amount' : undefined}>
                  {cell.value ?? '—'}
                </strong>
              )}
              <span className="network-stat-description">{cell.detail}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
