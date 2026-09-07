import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Blocks, Copy } from 'lucide-react'
import { useBlockInfo } from '@/hooks/useBlockInfo'
import { formatDateMedium, formatKasFromSompi, shortHash } from '@/lib/utils'

const PAGE_SIZE = 10

export function BlockDetails({ hash }: { hash: string }) {
  const query = useBlockInfo(hash)
  const [page, setPage] = useState(0)
  const [copied, setCopied] = useState(false)
  if (!/^[a-f0-9]{64}$/i.test(hash))
    return (
      <div className="transaction-detail-error">Not a valid block hash.</div>
    )
  if (query.isPending)
    return (
      <div
        className="transaction-summary mt-6 p-6"
        aria-label="Loading block details"
        aria-busy="true"
      >
        <span className="metric-skeleton block h-8 w-60" />
        <div className="mt-6 grid grid-cols-2 gap-6">
          {Array.from({ length: 6 }, (_, index) => (
            <span key={index} className="metric-skeleton block h-12 w-full" />
          ))}
        </div>
      </div>
    )
  if (!query.data)
    return (
      <div className="transaction-detail-error">
        Block details are unavailable. Check the hash or try again later.
      </div>
    )
  const data = query.data
  const transactions = data.transactions ?? []
  const rows = transactions.map((tx, index) => ({
    id: tx.verboseData.transactionId,
    inputs: tx.inputs?.length ?? 0,
    outputs: tx.outputs?.length ?? 0,
    amount:
      tx.outputs?.reduce((sum, output) => sum + Number(output.amount), 0) ??
      null,
    coinbase: index === 0,
  }))
  const totalAmount = rows.reduce((sum, tx) => sum + (tx.amount ?? 0), 0)
  const miner =
    data.extra?.minerAddress ??
    transactions[0]?.outputs?.[0]?.verboseData?.scriptPublicKeyAddress
  const parents = data.header.parents?.[0]?.parentHashes ?? []
  const facts = [
    [
      'Timestamp',
      formatDateMedium(Number(data.header.timestamp), {
        dateStyle: 'medium',
        timeStyle: 'medium',
      }),
    ],
    [
      'Chain status',
      data.verboseData.isChainBlock ? 'Chain block' : 'Non-chain block',
    ],
    ['DAA score', data.header.daaScore],
    ['Blue score', data.verboseData.blueScore],
    ['Difficulty', data.verboseData.difficulty.toLocaleString()],
    [
      'Transactions',
      (
        data.verboseData.transactionIds?.length ?? transactions.length
      ).toString(),
    ],
    ['Version', data.header.version.toString()],
    ['Nonce', data.header.nonce],
  ]
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const activePage = Math.min(page, pages - 1)
  const visible = rows.slice(
    activePage * PAGE_SIZE,
    (activePage + 1) * PAGE_SIZE,
  )
  return (
    <section className="transaction-detail">
      <article className="transaction-summary">
        <div className="transaction-overview">
          <div className="transaction-total">
            <p>Block hash</p>
            <strong title={hash}>{shortHash(hash)}</strong>
            <span>
              {data.extra?.color
                ? `${data.extra.color} block`
                : 'BlockDAG record'}
            </span>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 self-start rounded-full border border-[var(--line)] px-3 py-2 text-xs font-semibold"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(hash)
                  setCopied(true)
                } catch {
                  setCopied(false)
                }
              }}
            >
              <Copy className="size-3.5" />
              {copied ? 'Copied' : 'Copy hash'}
            </button>
          </div>
          <dl className="transaction-stat-grid">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </article>
      <article className="transaction-summary mt-5">
        <dl className="transaction-stat-grid">
          <div>
            <dt>Miner address</dt>
            <dd>
              {miner ? (
                <Link
                  to="/addresses/$address"
                  params={{ address: miner }}
                  className="live-address-link mono"
                  title={miner}
                >
                  {shortHash(miner)}
                </Link>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt>Total transaction outputs</dt>
            <dd>
              <span className="kas-amount">
                {formatKasFromSompi(transactions.length ? totalAmount : null)}
              </span>
            </dd>
          </div>
          <div>
            <dt>Selected parent</dt>
            <dd>
              {data.verboseData.selectedParentHash ? (
                <BlockLink hash={data.verboseData.selectedParentHash} />
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt>Direct parents</dt>
            <dd className="flex-wrap">
              {parents.length
                ? parents.map((parent) => (
                    <BlockLink key={parent} hash={parent} />
                  ))
                : '—'}
            </dd>
          </div>
          <div>
            <dt>Merkle root</dt>
            <dd className="mono text-xs">{data.header.hashMerkleRoot}</dd>
          </div>
          <div>
            <dt>UTXO commitment</dt>
            <dd className="mono text-xs">{data.header.utxoCommitment}</dd>
          </div>
        </dl>
      </article>
      <section className="address-history mt-5" aria-label="Block transactions">
        <header className="address-history-header">
          <div className="address-history-title-wrap">
            <span className="live-panel-icon">
              <Blocks className="size-5" />
            </span>
            <div>
              <p className="eyebrow m-0">Block contents</p>
              <h2>Transactions</h2>
            </div>
          </div>
        </header>
        <div className="live-table-wrap">
          <table className="live-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Type</th>
                <th className="text-right">Inputs / outputs</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((tx) => (
                <tr key={tx.id}>
                  <td>
                    <Link
                      to="/transactions/$transaction"
                      params={{ transaction: tx.id }}
                      className="live-address-link mono"
                      title={tx.id}
                    >
                      {shortHash(tx.id)}
                    </Link>
                  </td>
                  <td>{tx.coinbase ? 'Coinbase' : 'Transfer'}</td>
                  <td className="text-right tabular-nums">
                    {tx.inputs} / {tx.outputs}
                  </td>
                  <td className="text-right">
                    <span className="kas-amount">
                      {formatKasFromSompi(tx.amount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && (
          <p className="p-5 text-sm text-[var(--ink-muted)]">
            No transaction bodies available for this block.
          </p>
        )}
        <footer className="live-pagination">
          <span>
            Showing {rows.length ? activePage * PAGE_SIZE + 1 : 0}–
            {Math.min((activePage + 1) * PAGE_SIZE, rows.length)} of{' '}
            {rows.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={activePage === 0}
              onClick={() => setPage(activePage - 1)}
            >
              Prev
            </button>
            <span className="mono">Page {activePage + 1}</span>
            <button
              type="button"
              disabled={activePage === pages - 1}
              onClick={() => setPage(activePage + 1)}
            >
              Next
            </button>
          </div>
        </footer>
      </section>
    </section>
  )
}

function BlockLink({ hash }: { hash: string }) {
  return (
    <Link
      to="/blocks/$block"
      params={{ block: hash }}
      className="live-address-link mono"
      title={hash}
    >
      {shortHash(hash)}
    </Link>
  )
}
