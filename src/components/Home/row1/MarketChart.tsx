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
import { ChartNoAxesCombined, ChevronDown, Info, RefreshCw } from 'lucide-react'
import type { KaspaMarketPoint, MarketRange } from '@/api/market/Market'
import { useKaspaMarketChart } from '@/hooks/useMarket'

function formatCurrency(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits,
  }).format(value)
}

function formatCompactCurrency(value: number | null) {
  if (value === null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatTimestamp(timestamp: number, range: MarketRange) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    ...(range === '1D' ? { hour: 'numeric' } : {}),
  }).format(timestamp)
}

function priceChange(points: KaspaMarketPoint[]) {
  if (points.length < 2) return null
  const first = points[0]?.price
  const last = points.at(-1)?.price
  if (!first || last === undefined) return null
  return ((last - first) / first) * 100
}

export function MarketChart() {
  const [range, setRange] = useState<MarketRange>('7D')
  const {
    data: marketData,
    error,
    isPending,
    isFetching,
    refetch,
  } = useKaspaMarketChart(range)
  const latest = marketData?.at(-1)
  const change = marketData ? priceChange(marketData) : null
  const prices =
    marketData?.map((point) => point.price).filter(Number.isFinite) ?? []
  const minimum = prices.length ? Math.min(...prices) : 0
  const maximum = prices.length ? Math.max(...prices) : 1
  // Pad by the observed swing; keep a usable axis for constant prices too.
  const padding = Math.max((maximum - minimum) * 0.1, maximum * 0.0001, 1e-10)
  const priceDomain: [number, number] = [
    Math.max(0, minimum - padding),
    maximum + padding,
  ]
  const tickDecimals = Math.min(
    12,
    Math.max(
      2,
      Math.ceil(-Math.log10((priceDomain[1] - priceDomain[0]) / 4)) + 1,
    ),
  )

  return (
    <section className="panel flex min-h-[370px] flex-col p-5 sm:p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ChartNoAxesCombined className="size-5 text-[var(--accent)]" />
            <h2 className="m-0 text-lg font-extrabold tracking-[-.04em]">
              Market
            </h2>
          </div>
          <p className="mt-1 text-xs text-[var(--ink-muted)]">
            KAS / USD · CoinGecko
          </p>
        </div>
        <label className="relative">
          <span className="sr-only">Chart time range</span>
          <select
            value={range}
            onChange={(event) => setRange(event.target.value as MarketRange)}
            className="appearance-none rounded-lg border border-[var(--line)] bg-[var(--surface)] py-2 pl-3 pr-8 text-xs font-bold outline-none"
          >
            <option value="1D">1D</option>
            <option value="7D">7D</option>
            <option value="30D">30D</option>
            <option value="1Y">1Y</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-[var(--ink-muted)]" />
        </label>
      </header>

      {isPending ? (
        <MarketSkeleton />
      ) : error || !marketData.length ? (
        <MarketError onRetry={() => void refetch()} />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4">
            <Metric
              label="Price"
              value={formatCurrency(latest?.price ?? 0, 5)}
              change={change}
            />
            <Metric
              label="Market cap"
              value={formatCompactCurrency(latest?.marketCap ?? null)}
            />
            <Metric
              label="24h volume"
              value={formatCompactCurrency(latest?.volume ?? null)}
            />
            <Metric label="Data points" value={String(marketData.length)} />
          </div>
          <div className="mt-6 h-44 min-h-[176px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={marketData}
                margin={{ top: 8, right: 2, left: -18, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="market-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--accent)"
                      stopOpacity={0.24}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--accent)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="var(--line)"
                  strokeDasharray="3 4"
                />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(timestamp) =>
                    formatTimestamp(timestamp, range)
                  }
                  tick={{ fill: 'var(--ink-muted)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={28}
                />
                <YAxis
                  dataKey="price"
                  domain={priceDomain}
                  tickCount={5}
                  tickFormatter={(value) =>
                    `$${Number(value).toFixed(tickDecimals)}`
                  }
                  tick={{ fill: 'var(--ink-muted)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={Math.max(62, 26 + tickDecimals * 6)}
                />
                <Tooltip
                  labelFormatter={(timestamp) =>
                    formatTimestamp(Number(timestamp), range)
                  }
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: 10,
                    color: 'var(--ink)',
                  }}
                  formatter={(value) => [
                    formatCurrency(Number(value), 5),
                    'Price',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                  fill="url(#market-fill)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mb-0 mt-3 flex items-center gap-1.5 text-xs text-[var(--ink-muted)]">
            <Info className="size-3.5" />
            Real KAS/USD market data · refreshes every minute
            {isFetching ? ' · Updating…' : ''}
          </p>
        </>
      )}
    </section>
  )
}

function Metric({
  label,
  value,
  change,
}: {
  label: string
  value: string
  change?: number | null
}) {
  return (
    <div>
      <p className="m-0 text-[10px] font-bold uppercase tracking-[.1em] text-[var(--ink-muted)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-extrabold tracking-[-.03em]">
        {value}
        {change !== null && change !== undefined ? (
          <span
            className={
              change >= 0
                ? 'ml-1.5 text-[10px] text-[var(--accent-deep)]'
                : 'ml-1.5 text-[10px] text-[var(--danger)]'
            }
          >
            {change >= 0 ? '+' : ''}
            {change.toFixed(2)}%
          </span>
        ) : null}
      </p>
    </div>
  )
}

function MarketSkeleton() {
  return (
    <div className="skeleton-panel min-h-[370px]">

      <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-3 w-16 rounded bg-[var(--surface-subtle)]" />
            <div className="h-5 w-20 rounded bg-[var(--surface-subtle)]" />
          </div>
        ))}
      </div>

      <div className="mt-6 h-100 rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)]" />
    </div>
  )
}

function MarketError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="grid flex-1 place-items-center py-10 text-center">
      <div>
        <p className="m-0 text-sm font-bold">Market data is unavailable</p>
        <p className="mt-2 text-xs text-[var(--ink-muted)]">
          The price provider could not be reached.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-bold hover:bg-[var(--surface-subtle)]"
        >
          <RefreshCw className="size-3.5" />
          Try again
        </button>
      </div>
    </div>
  )
}
