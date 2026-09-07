import { createFileRoute } from '@tanstack/react-router'
import { Row1 } from '../components/Home/row1/Row1'
import { ActivityCharts } from '../components/Home/row2/ActivityCharts'
import { LiveChainFeed } from '../components/Home/LiveChainFeed'

export const Route = createFileRoute('/')({ component: App })
function App() {
  return (
    <main className="page-wrap px-0 py-10 sm:py-16">
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
      <section className="reveal home-reveal-second">
        <ActivityCharts />
      </section>
      <section className="reveal home-reveal-third">
        <LiveChainFeed />
      </section>
    </main>
  )
}
