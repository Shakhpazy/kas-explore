import { ArrowDownRight, ArrowUpRight, Medal } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { useAddressNames } from '@/hooks/useAddressNames'
import { useKaspaMarketChart } from '@/hooks/useMarket'
import { useTopAddress } from '@/hooks/useTopAddress'
import {
  formatKasValue,
  formatSignedKasValue,
  shortAddress,
} from '@/lib/utils'

const PAGE_SIZE = 10

function formatUsd(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value)
}

function formatSignedUsd(value: number | null | undefined) {
  if (value === null || value === undefined) return '—'
  const sign = value > 0 ? '+' : value < 0 ? '−' : ''
  return `${sign}${formatUsd(Math.abs(value))}`
}

function changeTone(kas: number | null) {
  if (kas === null) return 'muted'
  return kas >= 0 ? 'positive' : 'negative'
}

function TopAddressSkeletonRows({ rows = 5 }: { rows?: number }) {
  return Array.from({ length: rows }, (_, index) => (
    <tr key={`top-address-skeleton-${index}`} aria-hidden="true">
      <td><span className="address-skeleton h-3 w-6" /></td>
      <td><span className="address-skeleton h-3 w-[16rem]" /></td>
      <td className="text-right"><span className="address-skeleton ml-auto h-3 w-[6rem]" /></td>
      <td className="text-right"><span className="address-skeleton ml-auto h-3 w-[5rem]" /></td>
      <td className="text-right"><span className="address-skeleton ml-auto h-3 w-[5rem]" /></td>
      <td className="text-right"><span className="address-skeleton ml-auto h-3 w-[5rem]" /></td>
    </tr>
  ))
}

function TopAddressSkeleton() {
  return (
    <div className="address-history-table-wrap">
      <table className="address-history-table address-top-table">
        <colgroup>
          <col />
          <col />
          <col />
          <col />
          <col />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Address</th>
            <th className="text-right">Holdings</th>
            <th className="text-right">1d</th>
            <th className="text-right">7d</th>
            <th className="text-right">30d</th>
          </tr>
        </thead>
        <tbody>
          <TopAddressSkeletonRows />
        </tbody>
      </table>
    </div>
  )
}

export function AddressTop() {
  const topAddress = useTopAddress()
  const addressNames = useAddressNames()
  const market = useKaspaMarketChart('1D')
  const ranking = topAddress.data?.ranking ?? []
  const [currency, setCurrency] = useState<'KAS' | 'USD'>('KAS')
  const [pageIndex, setPageIndex] = useState(0)
  const pages = Math.max(1, Math.ceil(ranking.length / PAGE_SIZE))
  const activePage = Math.min(pageIndex, pages - 1)
  const visibleRanking = ranking.slice(
    activePage * PAGE_SIZE,
    (activePage + 1) * PAGE_SIZE,
  )
  const rangeStart = visibleRanking.length ? activePage * PAGE_SIZE + 1 : 0
  const rangeEnd = rangeStart + visibleRanking.length - 1
  const nameByAddress = useMemo(
    () => new Map((addressNames.data ?? []).map((entry) => [entry.address, entry.name])),
    [addressNames.data],
  )
  const kasPrice = market.data?.at(-1)?.price ?? null
  const displayAmount = (kas: number | null) => {
    if (currency === 'USD') {
      return formatUsd(kas === null || kasPrice === null ? null : kas * kasPrice)
    }
    return formatKasValue(kas)
  }
  const displayChange = (kas: number | null) => {
    if (currency === 'USD') {
      return formatSignedUsd(
        kas === null || kasPrice === null
          ? null
          : kas * kasPrice,
      )
    }
    return formatSignedKasValue(kas)
  }

  useEffect(() => {
    setPageIndex(0)
  }, [ranking.length])

  return (
    <section className="address-history mt-6" aria-labelledby="top-addresses-title">
      <header className="address-history-header">
        <div className="address-history-title-wrap">
          <span className="live-panel-icon">
            <Medal className="size-5" />
          </span>
          <div>
            <p className="eyebrow m-0">Network rankings</p>
            <h2 id="top-addresses-title">Top addresses</h2>
          </div>
        </div>
        <div className="address-history-actions">
          <button
            type="button"
            className="live-control"
            onClick={() =>
              setCurrency((current) => (current === 'KAS' ? 'USD' : 'KAS'))
            }
            aria-label={`Show values in ${currency === 'KAS' ? 'USD' : 'KAS'}`}
            title={`Show values in ${currency === 'KAS' ? 'USD' : 'KAS'}`}
          >
            {currency === 'KAS' ? (
              <span className="currency-toggle-kas" aria-hidden="true" />
            ) : (
              <span className="currency-toggle-usd" aria-hidden="true">$</span>
            )}
          </button>
        </div>
      </header>

      {topAddress.isPending ? (
        <TopAddressSkeleton />
      ) : topAddress.isError ? (
        <div className="address-history-message text-[var(--danger)]">
          Top address rankings could not be loaded.
          <button type="button" onClick={() => void topAddress.refetch()}>
            Try again
          </button>
        </div>
      ) : ranking.length === 0 ? (
        <div className="address-history-message">
          No top address rankings are available right now.
        </div>
      ) : (
        <>
          <div className="address-history-table-wrap">
            <table className="address-history-table address-top-table">
              <colgroup>
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Address</th>
                  <th className="text-right">Holdings</th>
                  <th className="text-right">1d</th>
                  <th className="text-right">7d</th>
                  <th className="text-right">30d</th>
                </tr>
              </thead>
              <tbody>
                {visibleRanking.map((entry) => {
                  const address = entry.address ?? ''
                  return (
                    <tr key={`${entry.rank ?? 'r'}-${address}`}>
                      <td className="mono tabular-nums font-medium">
                        {entry.rank ?? '—'}
                      </td>
                    <td className="mono font-medium" title={address || 'Unavailable'}>
                      <span className="address-top-address-cell">
                        {address ? (
                          <>
                            <Link
                              to="/addresses/$address"
                              params={{ address }}
                              className="live-address-link"
                            >
                              {shortAddress(address)}
                            </Link>
                            {nameByAddress.get(address) ? (
                              <span className="address-top-label">
                                {nameByAddress.get(address)}
                              </span>
                            ) : null}
                          </>
                        ) : (
                          '—'
                        )}
                      </span>
                    </td>
                      <td className="text-right">
                        <span
                          className={`address-top-amount ${
                            currency === 'KAS' ? 'kas-amount' : ''
                          }`}
                        >
                          {displayAmount(entry.amountKas)}
                        </span>
                      </td>
                      <td className="text-right">
                        <span
                          className={`address-top-change ${changeTone(entry.change1dKas)}`}
                        >
                          {entry.change1dKas === null ? (
                            <span className="size-3.5" />
                          ) : entry.change1dKas >= 0 ? (
                            <ArrowUpRight className="size-3.5" />
                          ) : (
                            <ArrowDownRight className="size-3.5" />
                          )}
                          <span className={currency === 'KAS' ? 'kas-amount' : undefined}>
                            {displayChange(entry.change1dKas)}
                          </span>
                        </span>
                      </td>
                      <td className="text-right">
                        <span
                          className={`address-top-change ${changeTone(entry.change7dKas)}`}
                        >
                          {entry.change7dKas === null ? (
                            <span className="size-3.5" />
                          ) : entry.change7dKas >= 0 ? (
                            <ArrowUpRight className="size-3.5" />
                          ) : (
                            <ArrowDownRight className="size-3.5" />
                          )}
                          <span className={currency === 'KAS' ? 'kas-amount' : undefined}>
                            {displayChange(entry.change7dKas)}
                          </span>
                        </span>
                      </td>
                      <td className="text-right">
                        <span
                          className={`address-top-change ${changeTone(entry.change30dKas)}`}
                        >
                          {entry.change30dKas === null ? (
                            <span className="size-3.5" />
                          ) : entry.change30dKas >= 0 ? (
                            <ArrowUpRight className="size-3.5" />
                          ) : (
                            <ArrowDownRight className="size-3.5" />
                          )}
                          <span className={currency === 'KAS' ? 'kas-amount' : undefined}>
                            {displayChange(entry.change30dKas)}
                          </span>
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <footer className="live-pagination" aria-label="Top addresses pages">
            <span>
              Showing {rangeStart}–{rangeEnd} of {ranking.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPageIndex((current) => current - 1)}
                disabled={activePage === 0}
                aria-label="Previous page"
              >
                Prev
              </button>
              <span className="mono">Page {activePage + 1}</span>
              <button
                type="button"
                onClick={() => setPageIndex((current) => current + 1)}
                disabled={activePage === pages - 1}
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </footer>
        </>
      )}
    </section>
  )
}
