export function DetailSkeleton({ kind = 'transaction', cells = 6 }: {
  kind?: 'address' | 'transaction'
  cells?: number
}) {
  return (
    <div className={`${kind}-overview`} role="status" aria-label="Loading details" aria-busy="true">
      <div className={kind === 'address' ? 'address-balance' : 'transaction-total'}>
        <span className="metric-skeleton h-3 w-24" />
        <span className="metric-skeleton my-3 h-8 w-48" />
        <span className="metric-skeleton h-3 w-32" />
      </div>
      <dl className={`${kind}-stat-grid`}>
        {Array.from({ length: cells }, (_, index) => (
          <div key={index} aria-hidden="true">
            <dt><span className="metric-skeleton h-3 w-24" /></dt>
            <dd><span className="metric-skeleton h-5 w-32" /></dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
