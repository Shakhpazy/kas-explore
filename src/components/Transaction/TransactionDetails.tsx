import {
  Check,
  Copy,
  Hash,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { DetailSkeleton as SummarySkeleton } from '@/components/ui/DetailSkeleton'
import { useTransactionInfo } from '@/hooks/useTransactionInfo'
import { formatDateMedium, formatKasFromSompi, shortHash } from '@/lib/utils'

function isTransactionId(value: string) {
  return /^[a-f0-9]{64}$/i.test(value.trim().replace(/^0x/i, ''))
}

function DetailSkeleton() {
  return (
    <section className="transaction-detail" role="status" aria-label="Loading transaction details" aria-busy="true">
      <article className="transaction-summary"><SummarySkeleton /></article>
      <div className="transaction-flow-grid">
        {['Inputs', 'Outputs'].map((label) => (
          <section key={label} className="transaction-io" aria-hidden="true">
            <header><h2>{label}</h2></header>
            <div className="p-5 space-y-5">
              {Array.from({ length: 5 }, (_, index) => <span key={index} className="metric-skeleton h-4 w-full" />)}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}

function InvalidTransactionInput({ transactionId }: { transactionId: string }) {
  return (
    <div className="transaction-detail-error">
      <div>Not a valid transaction input.</div>
      <div className="mt-2 mono text-xs text-[var(--ink-muted)]" title={transactionId}>
        {shortHash(transactionId)}
      </div>
    </div>
  )
}

function TransactionTable({
  kind,
  rows,
}: {
  kind: 'Inputs' | 'Outputs'
  rows: Array<{
    index: number
    address: string | null
    amountSompi: number | null
    previousTransactionId?: string | null
    previousIndex?: number | null
  }>
}) {
  return (
    <section className="transaction-io" aria-labelledby={`transaction-${kind.toLowerCase()}-title`}>
      <header>
        <div>
          <p className="eyebrow m-0">Transaction flow</p>
          <h2 id={`transaction-${kind.toLowerCase()}-title`}>{kind}</h2>
        </div>
        <span>{rows.length} row{rows.length === 1 ? '' : 's'}</span>
      </header>
      <div className="transaction-io-table-wrap">
        <table className="transaction-io-table">
          <colgroup>
            <col />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th>Index</th>
              <th>{kind === 'Inputs' ? 'Source' : 'Destination'}</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${kind}-${row.index}`}>
                <td className="mono tabular-nums">{row.index}</td>
                <td>
                  {row.address ? (
                    <Link
                      to="/addresses/$address"
                      params={{ address: row.address }}
                      className="live-address-link mono"
                      title={row.address}
                    >
                      {shortHash(row.address)}
                    </Link>
                  ) : (
                    <span className="mono">—</span>
                  )}
                </td>
                <td className="text-right">
                  <span className="transaction-amount">
                    <span className="kas-amount">{formatKasFromSompi(row.amountSompi)}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function TransactionDetails({ transactionId }: { transactionId: string }) {
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const validTransactionId = isTransactionId(transactionId)
  const transaction = useTransactionInfo(transactionId, validTransactionId)
  const data = transaction.data

  const copyTransactionId = async () => {
    try {
      await navigator.clipboard.writeText(transactionId)
      setCopyState('copied')
      window.setTimeout(() => setCopyState('idle'), 1200)
    } catch {
      setCopyState('idle')
    }
  }

  if (!validTransactionId) {
    return <InvalidTransactionInput transactionId={transactionId} />
  }

  if (transaction.isPending) return <DetailSkeleton />

  if (transaction.isError) {
    return (
      <div className="transaction-detail-error">
        Transaction details could not be loaded.
      </div>
    )
  }

  if (!data) return <DetailSkeleton />

  return (
    <section className="transaction-detail">
      <article className="transaction-summary">
        <div className="transaction-overview">
          <div className="transaction-total">
            <p>Transaction ID</p>
            <strong title={data.id}>{shortHash(data.id)}</strong>
            <span>{data.isAccepted ? 'Accepted transaction' : 'Pending transaction'}</span>
            <button
              type="button"
              onClick={() => void copyTransactionId()}
              className="mt-4 inline-flex items-center gap-2 self-start rounded-full border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent-deep)]"
            >
              <Copy className="size-3.5" />
              {copyState === 'copied' ? 'Copied' : 'Copy ID'}
            </button>
          </div>

          <dl className="transaction-stat-grid">
            <div>
              <dt>Status</dt>
              <dd className={data.isAccepted ? 'is-accepted' : 'is-unaccepted'}>
                {data.isAccepted ? <Check className="size-4" /> : <Hash className="size-4" />}
                {data.isAccepted ? 'Accepted' : 'Unaccepted'}
              </dd>
            </div>
            <div>
              <dt>Confirmed at</dt>
              <dd>{formatDateMedium(data.timestamp, { dateStyle: 'medium', timeStyle: 'medium' })}</dd>
            </div>
            <div>
              <dt>Transaction fee</dt>
              <dd className="kas-amount">{formatKasFromSompi(data.feeSompi)}</dd>
            </div>
            <div>
              <dt>Mass</dt>
              <dd>{data.mass === null ? '—' : data.mass.toLocaleString('en-US')}</dd>
            </div>
            <div>
              <dt>Total outputs</dt>
              <dd className="kas-amount">{formatKasFromSompi(data.totalOutputSompi)}</dd>
            </div>
            <div>
              <dt>Flow rows</dt>
              <dd>{data.inputs.length} inputs, {data.outputs.length} outputs</dd>
            </div>
          </dl>
        </div>
      </article>

      <div className="transaction-flow-grid">
        <TransactionTable kind="Inputs" rows={data.inputs} />
        <TransactionTable kind="Outputs" rows={data.outputs} />
      </div>
    </section>
  )
}
