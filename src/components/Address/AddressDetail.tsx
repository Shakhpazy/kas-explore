import { Copy, WalletCards } from 'lucide-react'
import { AddressTransactions } from '@/components/Address/AddressTransactions'
import { useAddressInfo } from '@/hooks/useAddressInfo'
import { useKaspaMarketChart } from '@/hooks/useMarket'
import { formatDateMedium, formatKasFromSompi } from '@/lib/utils'

function formatUsd(sompi: number | null | undefined, price: number | undefined) {
  if (sompi === null || sompi === undefined || price === undefined) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format((sompi / 100_000_000) * price)
}

export function AddressDetail({ address }: { address: string }) {
  const info = useAddressInfo(address)
  const market = useKaspaMarketChart('1D')
  const kasPrice = market.data?.at(-1)?.price

  return (
    <>
      <p className="eyebrow">Address overview</p>
      <h1 className="display-title mt-4 text-4xl font-extrabold sm:text-5xl">
        Address details.
      </h1>
      <section className="address-summary mt-8">
        <header className="address-summary-header">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-deep)]">
              <WalletCards className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="m-0 text-xs font-bold uppercase tracking-[.12em] text-[var(--ink-muted)]">
                Kaspa address
              </p>
              <p className="mono mb-0 mt-1 truncate text-sm font-medium">
                {address}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="address-copy"
            onClick={() => void navigator.clipboard.writeText(address)}
            aria-label="Copy address"
          >
            <Copy className="size-4" />
          </button>
        </header>
        {info.isPending ? (
          <div className="grid min-h-40 place-items-center text-sm text-[var(--ink-muted)]">
            Loading address data…
          </div>
        ) : info.isError ? (
          <div className="grid min-h-40 place-items-center px-6 text-center text-sm text-[var(--danger)]">
            This address could not be loaded from the Kaspa API.
          </div>
        ) : (
          <div className="address-overview">
            <div className="address-balance">
              <p>Current balance</p>
              <strong className="kas-amount">
                {formatKasFromSompi(info.data.balanceSompi, 8)}
              </strong>
              <span>{formatUsd(info.data.balanceSompi, kasPrice)}</span>
            </div>
            <dl className="address-stat-grid">
              <div>
                <dt>Transactions</dt>
                <dd>{info.data.transactionCount?.toLocaleString('en-US') ?? '—'}</dd>
              </div>
              <div>
                <dt>UTXOs</dt>
                <dd>{info.data.utxoCount?.toLocaleString('en-US') ?? '—'}</dd>
              </div>
              <div>
                <dt>First activity</dt>
                <dd>{formatDateMedium(info.data.firstTransactionAt)}</dd>
              </div>
              <div>
                <dt>Latest activity</dt>
                <dd>{formatDateMedium(info.data.lastTransactionAt)}</dd>
              </div>
            </dl>
          </div>
        )}
      </section>
      <AddressTransactions
        address={address}
        transactionCount={info.data?.transactionCount ?? null}
      />
    </>
  )
}
