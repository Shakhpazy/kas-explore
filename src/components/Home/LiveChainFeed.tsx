import {
  ArrowLeftRight,
  Blocks,
  Check,
  DollarSign,
  Info,
  Pause,
  Play,
  ReceiptText,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useKaspaLive } from '@/hooks/useKaspaLive'
import { useKaspaMarketChart } from '@/hooks/useMarket'
import { formatKasValue, shortAddress, shortHash } from '@/lib/utils'

const PAGE_SIZE = 10

export function LiveChainFeed() {
  return (
    <section className="live-data-grid mt-5" aria-label="Live chain activity">
      <LiveTransactionsPanel />
      <LiveBlocksPanel />
    </section>
  )
}

export function LiveBlocksPanel() {
  const [blocksPaused, setBlocksPaused] = useState(false)
  const [blocksCurrency, setBlocksCurrency] = useState<'KAS' | 'USD'>('KAS')
  const live = useKaspaLive()
  const market = useKaspaMarketChart('1D')
  const blocks = useFrozenRows(live.blocks, blocksPaused)
  const [blocksPage, setBlocksPage] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(interval)
  }, [])

  const blocksPages = Math.max(1, Math.ceil(blocks.length / PAGE_SIZE))
  const activeBlocksPage = Math.min(blocksPage, blocksPages - 1)
  const refreshIn = live.lastUpdatedAt
    ? Math.max(0, Math.ceil((live.lastUpdatedAt + 10_000 - now) / 1_000))
    : null
  const refreshLabel = (paused: boolean) =>
    paused
      ? 'Updates paused'
      : live.isFetching
        ? 'Updating now'
        : refreshIn === null
          ? 'Preparing update'
          : `Updates in ${refreshIn}s`

  return (
      <LivePanel
        eyebrow="Live network data"
        title="Blocks"
        icon={<Blocks className="size-5" />}
        controls={
          <LiveControls
            paused={blocksPaused}
            currency={blocksCurrency}
            onPauseToggle={() => setBlocksPaused((current) => !current)}
            onCurrencyToggle={() =>
              setBlocksCurrency((current) =>
                current === 'KAS' ? 'USD' : 'KAS',
              )
            }
          />
        }
        refreshLabel={refreshLabel(blocksPaused)}
      >
        <div className="live-table-wrap">
          <table className="live-table blocks-table">
            <thead>
              <tr>
                <th>Hash</th>
                <th>Miner address</th>
                <th className="text-center">Txs</th>
                <th className="text-right">Total amount</th>
              </tr>
            </thead>
            <tbody>
              {blocks
                .slice(
                  activeBlocksPage * PAGE_SIZE,
                  (activeBlocksPage + 1) * PAGE_SIZE,
                )
                .map((block) => (
                  <tr key={block.hash}>
                    <td className="mono text-sm font-medium">
                      <Link to="/blocks/$block" params={{ block: block.hash }} className="live-address-link" title={block.hash}>
                        {shortHash(block.hash)}
                      </Link>
                    </td>
                    <td>
                      {block.minerAddress ? (
                        <Link
                          to="/addresses/$address"
                          params={{ address: block.minerAddress }}
                          className="live-address-link mono text-sm"
                        >
                          {shortAddress(block.minerAddress)}
                        </Link>
                      ) : (
                        <span className="mono text-sm">—</span>
                      )}
                    </td>
                    <td className="text-center text-sm tabular-nums">
                      {block.transactions}
                    </td>
                    <td className="text-right">
                      <Amount
                        value={block.totalAmount}
                        currency={blocksCurrency}
                        kasPrice={market.data?.at(-1)?.price ?? null}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <EmptyState
            show={blocks.length === 0}
            label="Reading the current BlockDAG tips…"
          />
        </div>
        <Pagination
          page={activeBlocksPage}
          pages={blocksPages}
          total={blocks.length}
          onPageChange={setBlocksPage}
        />
      </LivePanel>
  )
}

export function LiveTransactionsPanel() {
  const [paused, setPaused] = useState(false)
  const [currency, setCurrency] = useState<'KAS' | 'USD'>('KAS')
  const live = useKaspaLive()
  const market = useKaspaMarketChart('1D')
  const transactions = useFrozenRows(live.transactions, paused)
  const [page, setPage] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(interval)
  }, [])

  const pages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE))
  const activePage = Math.min(page, pages - 1)
  const refreshIn = live.lastUpdatedAt
    ? Math.max(0, Math.ceil((live.lastUpdatedAt + 10_000 - now) / 1_000))
    : null
  const refreshLabel = paused
    ? 'Updates paused'
    : live.isFetching
      ? 'Updating now'
      : refreshIn === null
        ? 'Preparing update'
        : `Updates in ${refreshIn}s`

  return (
    <LivePanel
      eyebrow="Live network data"
      title="Transactions"
      icon={<ReceiptText className="size-5" />}
      controls={
        <LiveControls
          paused={paused}
          currency={currency}
          onPauseToggle={() => setPaused((current) => !current)}
          onCurrencyToggle={() =>
            setCurrency((current) => (current === 'KAS' ? 'USD' : 'KAS'))
          }
        />
      }
      refreshLabel={refreshLabel}
    >
      <div className="live-table-wrap">
        <table className="live-table transactions-table">
          <thead>
            <tr>
              <th aria-label="Transaction state" />
              <th>Tx ID</th>
              <th>Addresses</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions
              .slice(activePage * PAGE_SIZE, (activePage + 1) * PAGE_SIZE)
              .map((transaction) => (
                <tr key={transaction.id}>
                  <td>
                    <ArrowLeftRight className="size-4 text-[var(--accent)]" />
                  </td>
                  <td className="mono text-sm font-medium">
                    <Link
                      to="/transactions/$transaction"
                      params={{ transaction: transaction.id }}
                      className="live-address-link"
                    >
                      {shortHash(transaction.id)}
                    </Link>
                  </td>
                  <td>
                    {transaction.address ? (
                      <Link
                        to="/addresses/$address"
                        params={{ address: transaction.address }}
                        className="live-address-link mono text-sm"
                      >
                        {shortAddress(transaction.address)}
                      </Link>
                    ) : (
                      <span className="mono text-sm">—</span>
                    )}
                    <Check className="ml-3 inline size-4 text-[var(--accent)]" />
                  </td>
                  <td className="text-right">
                    <Amount
                      value={transaction.amount}
                      currency={currency}
                      kasPrice={market.data?.at(-1)?.price ?? null}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <EmptyState
          show={transactions.length === 0}
          label="Reading the latest accepted transactions…"
        />
      </div>
      <Pagination
        page={activePage}
        pages={pages}
        total={transactions.length}
        onPageChange={setPage}
      />
    </LivePanel>
  )
}

function LivePanel({
  eyebrow,
  title,
  icon,
  controls,
  refreshLabel,
  children,
}: {
  eyebrow: string
  title: string
  icon: React.ReactNode
  controls: React.ReactNode
  refreshLabel: string
  children: React.ReactNode
}) {
  return (
    <article className="live-panel">
      <header className="live-panel-header">
        <div className="flex min-w-0 items-center gap-3">
          <span className="live-panel-icon">{icon}</span>
          <div>
            <p className="eyebrow m-0">{eyebrow}</p>
            <h2 className="m-0 mt-1 text-[1.35rem] font-extrabold tracking-[-.04em]">
              {title}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[var(--ink-muted)]">
          <span className="live-refresh">{refreshLabel}</span>
          {controls}
        </div>
      </header>
      {children}
    </article>
  )
}

function Pagination({
  page,
  pages,
  total,
  onPageChange,
}: {
  page: number
  pages: number
  total: number
  onPageChange: (page: number) => void
}) {
  return (
    <footer className="live-pagination">
      <span>{total} stored · max 100</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          aria-label="Previous page"
        >
          Prev
        </button>
        <span className="mono">
          {page + 1} / {pages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages - 1}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </footer>
  )
}

function LiveControls({
  paused,
  currency,
  onPauseToggle,
  onCurrencyToggle,
}: {
  paused: boolean
  currency: 'KAS' | 'USD'
  onPauseToggle: () => void
  onCurrencyToggle: () => void
}) {
  return (
    <>
      <button
        type="button"
        className="live-control"
        onClick={onCurrencyToggle}
        aria-label={`Show values in ${currency === 'KAS' ? 'USD' : 'KAS'}`}
        title={`Show values in ${currency === 'KAS' ? 'USD' : 'KAS'}`}
      >
        {currency === 'KAS' ? (
          <span className="currency-toggle-kas" aria-hidden="true" />
        ) : (
          <DollarSign className="size-4" />
        )}
      </button>
      <button
        type="button"
        className={`live-control ${paused ? 'is-active' : ''}`}
        onClick={onPauseToggle}
        aria-label={paused ? 'Resume live updates' : 'Pause live updates'}
        title={paused ? 'Resume live updates' : 'Pause live updates'}
      >
        {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
      </button>
    </>
  )
}

function Amount({
  value,
  currency,
  kasPrice,
}: {
  value: number | null
  currency: 'KAS' | 'USD'
  kasPrice: number | null
}) {
  const displayedValue =
    currency === 'USD' && value !== null && kasPrice !== null
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: value * kasPrice < 1 ? 4 : 2,
        }).format(value * kasPrice)
      : formatKasValue(value)
  return (
    <span className={`live-amount ${currency === 'KAS' ? 'kas-amount' : ''}`}>
      {displayedValue}
    </span>
  )
}

function useFrozenRows<T>(rows: T[], paused: boolean) {
  const [visibleRows, setVisibleRows] = useState(rows)

  useEffect(() => {
    if (!paused) setVisibleRows(rows)
  }, [paused, rows])

  return visibleRows
}

function EmptyState({ show, label }: { show: boolean; label: string }) {
  if (!show) return null
  return (
    <div className="grid min-h-48 place-items-center px-6 text-center text-sm text-[var(--ink-muted)]">
      <div>
        <Info className="mx-auto size-4 text-[var(--accent)]" />
        <p className="mb-0 mt-2">{label}</p>
      </div>
    </div>
  )
}
