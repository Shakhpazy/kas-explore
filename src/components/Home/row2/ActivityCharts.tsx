import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Activity, ChevronDown, RefreshCw, Users } from 'lucide-react'
import { useState } from 'react'
import type {
  ActivityRange,
  NetworkActivityPoint,
} from '@/api/network/Activity'
import { useNetworkActivity } from '@/hooks/useNetworkActivity'

const number = new Intl.NumberFormat('en-US')

function formatTimestamp(timestamp: number, range: ActivityRange) {
  return new Intl.DateTimeFormat('en-US', {
    ...(range === '1D'
      ? { hour: 'numeric', hour12: true }
      : { month: 'short', day: 'numeric' }),
    timeZone: 'UTC',
  }).format(timestamp)
}

export function ActivityCharts() {
  const [transactionsRange, setTransactionsRange] =
    useState<ActivityRange>('1D')
  const [addressesRange, setAddressesRange] = useState<ActivityRange>('1D')

  const transactionsData = useNetworkActivity(transactionsRange)
  const addressesData = useNetworkActivity(addressesRange)

  const transactionsLatest = transactionsData.data?.points.at(-1)
  const addressesLatest = addressesData.data?.points.at(-1)

  return (
    <section className="">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        {/* <div>
          <p className="eyebrow mb-2">Network activity</p>
          <h2 className="m-0 text-2xl font-extrabold tracking-[-.045em]">
            Usage over time
          </h2>
        </div>
        <p className="m-0 hidden text-xs text-[var(--ink-muted)] sm:block">
          UTC hourly buckets{isFetching ? ' · Updating…' : ''}
        </p> */}
      </header>
      <div className="grid gap-5 lg:grid-cols-2">
        <ActivityChart
          title="Transactions"
          subtitle="Accepted regular transactions"
          icon={<Activity className="size-5" />}
          points={transactionsData.data?.points ?? []}
          dataKey="transactions"
          allTime={transactionsData.data?.allTimeTransactions ?? 0}
          lastHour={transactionsLatest?.transactions ?? 0}
          range={transactionsRange}
          onRangeChange={setTransactionsRange}
          isPending={transactionsData.isPending}
          isError={Boolean(transactionsData.error)}
          onRetry={() => void transactionsData.refetch()}
        />
        <ActivityChart
          title="Active addresses"
          subtitle="Addresses active within each hour"
          icon={<Users className="size-5" />}
          points={addressesData.data?.points ?? []}
          dataKey="addresses"
          allTime={addressesData.data?.allTimeAddresses ?? 0}
          lastHour={addressesLatest?.addresses ?? 0}
          range={addressesRange}
          onRangeChange={setAddressesRange}
          isPending={addressesData.isPending}
          isError={Boolean(addressesData.error)}
          onRetry={() => void addressesData.refetch()}
        />
      </div>
    </section>
  )
}

function ActivityChart({
  title,
  subtitle,
  icon,
  points,
  dataKey,
  allTime,
  lastHour,
  range,
  onRangeChange,
  isPending,
  isError,
  onRetry,
}: {
  title: string
  subtitle: string
  icon: React.ReactNode
  points: NetworkActivityPoint[]
  dataKey: 'transactions' | 'addresses'
  allTime: number
  lastHour: number
  range: ActivityRange
  onRangeChange: (range: ActivityRange) => void
  isPending: boolean
  isError: boolean
  onRetry: () => void
}) {
  if (isPending) {
    return <ActivitySkeleton />
  }

  if (isError) {
    return <ActivityError onRetry={onRetry} />
  }

  const chartId = `activity-${dataKey}`
  const values = points.map((point) => point[dataKey]).filter(Number.isFinite)
  const minimum = values.length ? Math.min(...values) : 0
  const maximum = values.length ? Math.max(...values) : 1
  const padding = Math.max((maximum - minimum) * 0.12, maximum * 0.01, 1)
  const domain: [number, number] = [
    Math.max(0, Math.floor(minimum - padding)),
    Math.ceil(maximum + padding),
  ]
  return (
    <article className="panel flex min-h-[365px] flex-col p-5 sm:p-6">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-deep)]">
            {icon}
          </span>
          <div>
            <h3 className="m-0 text-lg font-extrabold tracking-[-.04em]">
              {title}
            </h3>
            <p className="mb-0 mt-1 text-xs text-[var(--ink-muted)]">
              {subtitle}
            </p>
          </div>
        </div>
        <label className="relative shrink-0">
          <span className="sr-only">{title} time range</span>
          <select
            value={range}
            onChange={(event) =>
              onRangeChange(event.target.value as ActivityRange)
            }
            className="appearance-none rounded-lg border border-[var(--line)] bg-[var(--surface)] py-2 pl-3 pr-8 text-xs font-bold outline-none"
          >
            <option value="1D">1D</option>
            <option value="7D">7D</option>
            <option value="30D">30D</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-[var(--ink-muted)]" />
        </label>
      </header>
      <dl className="mt-7 grid grid-cols-2 divide-x divide-[var(--line)]">
        <div className="pr-4">
          <dt className="text-[11px] font-bold uppercase tracking-[.11em] text-[var(--ink-muted)]">
            All time
          </dt>
          <dd className="mt-1 text-xl font-extrabold tracking-[-.045em] tabular-nums">
            {number.format(allTime)}
          </dd>
        </div>
        <div className="pl-4">
          <dt className="text-[11px] font-bold uppercase tracking-[.11em] text-[var(--ink-muted)]">
            Last hour
          </dt>
          <dd className="mt-1 text-xl font-extrabold tracking-[-.045em] tabular-nums">
            {number.format(lastHour)}
          </dd>
        </div>
      </dl>
      <div className="mt-6 min-h-44 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={points}
            margin={{ top: 8, right: 2, left: -18, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id={`${chartId}-fill`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="var(--accent)"
                  stopOpacity={0.22}
                />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--line)"
              strokeDasharray="3 4"
            />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(timestamp) => formatTimestamp(timestamp, range)}
              tick={{ fill: 'var(--ink-muted)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              minTickGap={28}
            />
            <YAxis
              dataKey={dataKey}
              domain={domain}
              tickCount={5}
              tickFormatter={(value) => number.format(Number(value))}
              tick={{ fill: 'var(--ink-muted)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={58}
            />
            <Tooltip
              labelFormatter={(timestamp) =>
                `${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', hour12: true, timeZone: 'UTC' }).format(Number(timestamp))} UTC`
              }
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 10,
                color: 'var(--ink)',
              }}
              formatter={(value) => [number.format(Number(value)), title]}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="var(--accent)"
              strokeWidth={2.5}
              fill={`url(#${chartId}-fill)`}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="mb-0 mt-3 text-xs text-[var(--ink-muted)]">
        {range === '1D'
          ? 'Today’s completed hourly activity'
          : `Last ${range === '7D' ? '7' : '30'} days · hourly activity`}
      </p>
    </article>
  )
}

function ActivitySkeleton() {
  return (
    <div className="panel skeleton-panel min-h-[365px] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--surface-subtle)]" />
          <div className="space-y-2">
            <div className="h-5 w-28 rounded bg-[var(--surface-subtle)]" />
            <div className="h-3 w-32 rounded bg-[var(--surface-subtle)]" />
          </div>
        </div>
        <div className="h-9 w-16 rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)]" />
      </div>

      <div className="mt-7 grid grid-cols-2 gap-4">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-3 w-16 rounded bg-[var(--surface-subtle)]" />
            <div className="h-6 w-20 rounded bg-[var(--surface-subtle)]" />
          </div>
        ))}
      </div>

      <div className="mt-6 h-44 rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)]" />
    </div>
  )
}

function ActivityError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="panel grid min-h-56 place-items-center p-6 text-center">
      <div>
        <p className="m-0 text-sm font-bold">Activity data is unavailable</p>
        <p className="mt-2 text-xs text-[var(--ink-muted)]">
          The Kaspa API could not be reached.
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
