export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--line)] px-4 py-8">
      <div className="page-wrap flex flex-col gap-2 text-xs text-[var(--ink-muted)] sm:flex-row sm:items-center sm:justify-between">
        <span>Kasplore · an independent Kaspa network explorer</span>
        <span className="mono">Built for a faster chain.</span>
      </div>
    </footer>
  )
}
