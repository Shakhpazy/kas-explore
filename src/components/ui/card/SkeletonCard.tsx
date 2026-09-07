export function SkeletonCard() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading network value"
      className="panel skeleton-panel p-5"
    >
      <div className="h-3 w-20 rounded bg-[var(--surface-subtle)]" />
      <div className="mt-8 h-7 w-28 rounded bg-[var(--surface-subtle)]" />
      <div className="mt-3 h-3 w-36 rounded bg-[var(--surface-subtle)]" />
    </div>
  )
}
