import { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartNoAxesCombined, ChevronDown, Info } from 'lucide-react'

type TimeRange = '1D' | '7D' | '30D'

const marketData = [
  { date: '2026-08-12', price: 0.0264 },
  { date: '2026-08-12', price: 0.0262 },
  { date: '2026-08-13', price: 0.0260 },
  { date: '2026-08-13', price: 0.0261 },
  { date: '2026-08-14', price: 0.0255 },
  { date: '2026-08-14', price: 0.0252 },
  { date: '2026-08-15', price: 0.0259 },
  { date: '2026-08-15', price: 0.0263 },
  { date: '2026-08-16', price: 0.0273 },
  { date: '2026-08-16', price: 0.0264 },
  { date: '2026-08-17', price: 0.0261 },
  { date: '2026-08-18', price: 0.0257 },
  { date: '2026-08-18', price: 0.0258 },
]

function formatDate(date: string) {
  return date.slice(5)
}

export function MarketChart() {
  const [range, setRange] = useState<TimeRange>('7D')

  return (
    <section className="island-shell flex h-full flex-col overflow-hidden rounded-2xl p-4 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <ChartNoAxesCombined className="size-6 text-[var(--lagoon-deep)]" aria-hidden="true" />
          <h2 className="text-lg font-bold text-[var(--sea-ink)]">Market</h2>
        </div>
        <label className="relative">
          <span className="sr-only">Chart time range</span>
          <select
            value={range}
            onChange={(event) => setRange(event.target.value as TimeRange)}
            className="appearance-none rounded-md border border-border bg-card py-2 pl-3 pr-8 text-sm font-semibold text-[var(--lagoon-deep)] outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="1D">1D</option>
            <option value="7D">7D</option>
            <option value="30D">30D</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        </label>
      </header>

      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
        <div>
          <p className="m-0 text-muted-foreground">Price (USD)</p>
          <p className="m-0 font-bold text-foreground">$ 0.025 <span className="ml-1 rounded bg-red-500/15 px-1.5 py-0.5 text-xs text-red-500">-2.1%</span></p>
        </div>
        <div>
          <p className="m-0 text-muted-foreground">Market Cap</p>
          <p className="m-0 font-bold text-foreground">$ 701.04M</p>
        </div>
        <div>
          <p className="m-0 text-muted-foreground">Rank (CoinMarketCap)</p>
          <p className="m-0 font-bold text-foreground">#64</p>
        </div>
        <div>
          <p className="m-0 text-muted-foreground">Fully Diluted</p>
          <p className="m-0 font-bold text-foreground">$ 727.84M</p>
        </div>
      </div>

      <div className="mt-5 min-h-64 w-full min-w-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={marketData} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="market-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--lagoon)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--lagoon)" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="2 4" />
            <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: 'var(--sea-ink-soft)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0.025, 0.0275]} tickFormatter={(value) => value.toFixed(3)} tick={{ fill: 'var(--sea-ink-soft)', fontSize: 11 }} axisLine={false} tickLine={false} width={42} />
            <Tooltip
              contentStyle={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--foreground)' }}
              labelStyle={{ color: 'var(--sea-ink-soft)' }}
              formatter={(value) => [`$ ${Number(value).toFixed(5)}`, 'Price']}
            />
            <Area type="monotone" dataKey="price" stroke="var(--lagoon-deep)" strokeWidth={2.5} fill="url(#market-fill)" dot={false} activeDot={{ r: 4, fill: 'var(--lagoon-deep)' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        <Info className="size-3.5" aria-hidden="true" />
        Mock market data for the {range} range
      </p>
    </section>
  )
}