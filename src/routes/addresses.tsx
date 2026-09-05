import { createFileRoute } from '@tanstack/react-router'
import { Search, WalletCards } from 'lucide-react'

export const Route = createFileRoute('/addresses')({ component: Addresses })
function Addresses() {
  return (
    <main className="page-wrap py-10 sm:py-16">
      <p className="eyebrow">Address explorer</p>
      <h1 className="display-title mt-4 text-5xl font-extrabold sm:text-6xl">
        Follow an address.
      </h1>
      <p className="mt-5 max-w-xl leading-7 text-[var(--ink-muted)]">
        Look up a Kaspa wallet address to inspect its balance, UTXOs, and
        transaction history.
      </p>
      <form
        className="panel mt-10 flex flex-col gap-3 p-3 sm:flex-row"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="flex flex-1 items-center gap-3 px-2">
          <Search className="size-5 text-[var(--ink-muted)]" />
          <input
            aria-label="Kaspa address"
            placeholder="kaspa:…"
            className="w-full bg-transparent py-3 mono text-sm outline-none placeholder:font-sans"
          />
        </div>
        <button
          className="rounded-xl bg-[var(--ink)] px-5 py-3 text-sm font-bold text-[var(--canvas)]"
          type="submit"
        >
          Look up address
        </button>
      </form>
      <section className="panel-subtle mt-6 grid place-items-center px-6 py-16 text-center">
        <WalletCards className="size-7 text-[var(--accent)]" />
        <h2 className="mt-5 text-lg font-extrabold">Start with an address</h2>
        <p className="m-0 max-w-sm text-sm leading-6 text-[var(--ink-muted)]">
          Paste a Kaspa address above to open its on-chain activity.
        </p>
      </section>
    </main>
  )
}
