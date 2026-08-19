import { createFileRoute } from '@tanstack/react-router'
import { MarketChart } from '../components/MarketChart'
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

      <section className="mt-8 p-6 sm:p-8">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2">
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
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
          <div className="min-w-0">
            <MarketChart />
          </div>
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
