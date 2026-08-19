import { createFileRoute } from '@tanstack/react-router'
import { Card } from '../components/ui/card/Card'
import {
  Activity,
  ArrowLeftRight,
  Box,
  CircleDollarSign,
  Coins,
  Info,
  Network,
  Pickaxe,
  Timer,
} from 'lucide-react'

const mockCards = [
  { title: 'TPS', icon1: ArrowLeftRight, icon2: Info, content: '10.7', description: '1h avg: 10.8' },
  { title: 'Nodes', icon1: Network, icon2: Info, content: '582', description: 'Public nodes' },
  { title: 'BPS', icon1: Box, icon2: Info, content: '10.2', description: '1h avg: 10.0' },
  { title: 'Miners', icon1: Pickaxe, icon2: Info, content: '212', description: 'Recently seen' },
  { title: 'Hashrate', icon1: Activity, icon2: Info, content: '317.7 PH/s', description: 'Network' },
  { title: 'Circulating', icon1: Coins, icon2: Info, content: '27.65B', description: 'Mined: 96.32%' },
  { title: 'Block reward', icon1: CircleDollarSign, icon2: Info, content: '𐤊 2.31', description: 'Current' },
  { title: 'Next reduction', icon1: Timer, icon2: Info, content: '𐤊 2.12', description: '16 days, 11 hr, 25 min' },
]

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />
        <p className="island-kicker mb-3">TanStack Start Base Template</p>
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          Start simple, ship quickly.
        </h1>
        <p className="mb-8 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          This base starter intentionally keeps things light: two routes, clean
          structure, and the essentials you need to build from scratch.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="/about"
            className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
          >
            About This Starter
          </a>
          <a
            href="https://tanstack.com/router"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[rgba(23,58,64,0.2)] bg-white/50 px-5 py-2.5 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5 hover:border-[rgba(23,58,64,0.35)]"
          >
            Router Guide
          </a>
        </div>
      </section>

      <section className="mt-8 p-6 sm:p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockCards.map((card) => (
            <Card
              key={card.title}
              title={card.title}
              icon1={card.icon1}
              icon2={card.icon2}
              content={card.content}
              description={card.description}
            />
          ))}
        </div>
      </section>

      <section className="island-shell mt-8 rounded-2xl p-6">
        <p className="island-kicker mb-2">Quick Start</p>
        <ul className="m-0 list-disc space-y-2 pl-5 text-sm text-[var(--sea-ink-soft)]">
          <li>
            Edit <code>src/routes/index.tsx</code> to customize the home page.
          </li>
          <li>
            Update <code>src/components/Header.tsx</code> and{' '}
            <code>src/components/Footer.tsx</code> for brand links.
          </li>
          <li>
            Add routes in <code>src/routes</code> and tweak visual tokens in{' '}
            <code>src/styles.css</code>.
          </li>
        </ul>
      </section>
    </main>
  )
}
