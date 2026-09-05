import { createFileRoute } from '@tanstack/react-router'
import { ArrowRightLeft, Search } from 'lucide-react'

export const Route = createFileRoute('/transactions')({
  component: Transactions,
})
function Transactions() {
  return (
    <main className="page-wrap py-10 sm:py-16">
      <p className="eyebrow">Transaction explorer</p>
      <h1 className="display-title mt-4 text-5xl font-extrabold sm:text-6xl">
        Trace every move.
      </h1>
      <p className="mt-5 max-w-xl leading-7 text-[var(--ink-muted)]">
        Use a transaction ID to verify its status, fees, inputs, and outputs on
        the Kaspa network.
      </p>
      <form
        className="panel mt-10 flex flex-col gap-3 p-3 sm:flex-row"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="flex flex-1 items-center gap-3 px-2">
          <Search className="size-5 text-[var(--ink-muted)]" />
          <input
            aria-label="Transaction ID"
            placeholder="Transaction ID"
            className="w-full bg-transparent py-3 mono text-sm outline-none placeholder:font-sans"
          />
        </div>
        <button
          className="rounded-xl bg-[var(--ink)] px-5 py-3 text-sm font-bold text-[var(--canvas)]"
          type="submit"
        >
          Find transaction
        </button>
      </form>
      <section className="panel-subtle mt-6 grid place-items-center px-6 py-16 text-center">
        <ArrowRightLeft className="size-7 text-[var(--accent)]" />
        <h2 className="mt-5 text-lg font-extrabold">
          Transaction detail, without clutter
        </h2>
        <p className="m-0 max-w-sm text-sm leading-6 text-[var(--ink-muted)]">
          Enter a transaction ID above to inspect its confirmed on-chain record.
        </p>
      </section>
    </main>
  )
}
