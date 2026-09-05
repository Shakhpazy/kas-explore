import { createFileRoute } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { Row1 } from '../components/Home/row1/Row1'
import { ActivityCharts } from '../components/Home/row2/ActivityCharts'

export const Route = createFileRoute('/')({ component: App })
function App() {
  return (
    <main className="page-wrap px-0 py-10 sm:py-16">
      <section className="reveal flex justify-center">
        <form
          className="panel flex items-center gap-3 p-2"
          onSubmit={(event) => event.preventDefault()}
        >
          <Search className="ml-2 size-5 text-[var(--ink-muted)]" />
          <input
            aria-label="Search address, transaction or block"
            placeholder="Search address, transaction, block…"
            className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-[var(--ink-muted)]"
          />
          <button
            className="rounded-xl bg-[var(--ink)] px-4 py-3 text-sm font-bold text-[var(--canvas)] hover:scale-[1.02]"
            type="submit"
          >
            Explore
          </button>
        </form>
      </section>
      <section className="reveal reveal-delay">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="eyebrow mb-2">Network pulse</p>
            <h2 className="m-0 text-2xl font-extrabold tracking-[-.04em]">
              Live essentials
            </h2>
          </div>
          <span className="hidden items-center gap-2 text-xs font-bold text-[var(--accent-deep)] sm:flex">
            <span className="size-2 rounded-full bg-[var(--accent)]" />
            Live API data
          </span>
        </div>
        <Row1 />
      </section>
      <ActivityCharts />
    </main>
  )
}
