import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/overview')({ component: Overview })
function Overview() {
  return (
    <main className="page-wrap py-10 sm:py-16">
      <p className="eyebrow">Network overview</p>
      <h1 className="display-title mt-4 text-5xl font-extrabold sm:text-6xl">
        A clearer chain
        <br />
        starts here.
      </h1>
      <p className="mt-5 max-w-xl leading-7 text-[var(--ink-muted)]">
        Track the high-level health of the Kaspa network, then dive into
        addresses and transactions when you need the detail.
      </p>
    </main>
  )
}
