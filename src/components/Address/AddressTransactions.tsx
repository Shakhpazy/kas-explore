import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Repeat2,
  ReceiptText,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ADDRESS_TRANSACTIONS_PAGE_SIZE } from '@/api/address/Address'
import { useAddressTransactions } from '@/hooks/useAddressTransactions'
import { formatDateMedium, formatKasFromSompi, shortHash } from '@/lib/utils'

function TransactionSkeletonRows({ rows = 5 }: { rows?: number }) {
  return Array.from({ length: rows }, (_, index) => (
    <tr key={`transaction-skeleton-${index}`} aria-hidden="true">
      <td><span className="address-skeleton w-[9.5rem]" /></td>
      <td><span className="address-skeleton w-[10.5rem]" /></td>
      <td><span className="address-skeleton w-[5.5rem]" /></td>
      <td><span className="address-skeleton w-[3rem]" /></td>
      <td className="text-right"><span className="address-skeleton ml-auto w-[6.5rem]" /></td>
    </tr>
  ))
}

function AddressHistorySkeleton() {
  return (
    <div className="address-history-table-wrap">
      <table className="address-history-table">
        <colgroup>
          <col />
          <col />
          <col />
          <col />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th>Transaction</th>
            <th>Time</th>
            <th>Type</th>
            <th>Inputs / outputs</th>
            <th className="text-right">Net amount</th>
          </tr>
        </thead>
        <tbody><TransactionSkeletonRows /></tbody>
      </table>
    </div>
  )
}

export function AddressTransactions({
  address,
  transactionCount,
}: {
  address: string
  transactionCount: number | null
}) {
  const history = useAddressTransactions(address)
  const [pageIndex, setPageIndex] = useState(0)
  const pages = history.data?.pages ?? []
  const transactions = pages.flatMap((page) => page.transactions)
  const visibleTransactions = pages[pageIndex]?.transactions ?? []
  const lastTransaction = transactions.at(0)
  const rangeStart = visibleTransactions.length
    ? pageIndex * ADDRESS_TRANSACTIONS_PAGE_SIZE + 1
    : 0
  const rangeEnd = rangeStart + visibleTransactions.length - 1

  useEffect(() => {
    setPageIndex(0)
  }, [address])

  const goToNextPage = async () => {
    if (pageIndex < pages.length - 1) {
      setPageIndex((current) => current + 1)
      return
    }
    if (!history.hasNextPage || history.isFetchingNextPage) return

    const result = await history.fetchNextPage()
    if (!result.isError) setPageIndex((current) => current + 1)
  }

  return (
    <section className="address-history mt-6" aria-labelledby="address-history-title">
      <header className="address-history-header">
        <div className="address-history-title-wrap">
          <span className="live-panel-icon">
            <ReceiptText className="size-5" />
          </span>
          <div>
            <p className="eyebrow m-0">On-chain activity</p>
            <h2 id="address-history-title">Transaction history</h2>
          </div>
        </div>
        <div className="address-last-activity">
          <span>Last transaction</span>
          <strong>
            {history.isPending ? (
              <span className="address-skeleton h-3 w-36" aria-label="Loading last transaction" />
            ) : lastTransaction ? (
              formatDateMedium(lastTransaction.timestamp, {
                dateStyle: 'medium',
                timeStyle: 'medium',
              })
            ) : (
              '—'
            )}
          </strong>
        </div>
      </header>

      {history.isPending ? (
        <AddressHistorySkeleton />
      ) : history.isError ? (
        <div className="address-history-message text-[var(--danger)]">
          Transaction history could not be loaded.
          <button type="button" onClick={() => void history.refetch()}>
            Try again
          </button>
        </div>
      ) : visibleTransactions.length === 0 ? (
        <div className="address-history-message">
          No accepted transactions were found for this address.
        </div>
      ) : (
        <>
          <div className="address-history-table-wrap">
            <table className="address-history-table">
              <colgroup>
                <col />
                <col />
                <col />
                <col />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Inputs / outputs</th>
                  <th className="text-right">Net amount</th>
                </tr>
              </thead>
              <tbody>
                {visibleTransactions.map((transaction) => {
                  const Icon =
                    transaction.direction === 'received'
                      ? ArrowDownLeft
                      : transaction.direction === 'sent'
                        ? ArrowUpRight
                        : Repeat2
                  const label =
                    transaction.direction === 'received'
                      ? 'Received'
                      : transaction.direction === 'sent'
                        ? 'Sent'
                        : 'Self transfer'

                  return (
                    <tr key={transaction.id}>
                      <td className="mono font-medium" title={transaction.id}>
                        <Link
                          to="/transactions/$transaction"
                          params={{ transaction: transaction.id }}
                          className="live-address-link"
                        >
                          {shortHash(transaction.id)}
                        </Link>
                      </td>
                      <td>
                        {formatDateMedium(transaction.timestamp, {
                          dateStyle: 'medium',
                          timeStyle: 'medium',
                        })}
                      </td>
                      <td>
                        <span className={`address-direction ${transaction.direction}`}>
                          <Icon className="size-3.5" /> {label}
                        </span>
                        {transaction.isAccepted && (
                          <Check className="ml-2 inline size-3.5 text-[var(--accent)]" />
                        )}
                      </td>
                      <td className="tabular-nums">
                        {transaction.inputCount} / {transaction.outputCount}
                      </td>
                      <td className="text-right">
                        <span className="address-history-amount kas-amount">
                          {formatKasFromSompi(transaction.amountSompi)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <footer className="live-pagination" aria-label="Transaction history pages">
            <span>
              Showing {rangeStart}–{rangeEnd}
              {transactionCount === null ? '' : ` of ${transactionCount}`}
            </span>
            <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPageIndex((current) => current - 1)}
              disabled={pageIndex === 0}
              aria-label="Previous page"
            >
              Prev
            </button>
            <span className="mono">Page {pageIndex + 1}</span>
            <button
              type="button"
              onClick={() => void goToNextPage()}
              disabled={history.isFetchingNextPage || (!history.hasNextPage && pageIndex === pages.length - 1)}
              aria-label="Next page"
            >
              {history.isFetchingNextPage ? 'Loading…' : 'Next'}
            </button>
            </div>
          </footer>
        </>
      )}
    </section>
  )
}
