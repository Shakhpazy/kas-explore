import { Outlet, createFileRoute, useRouterState } from '@tanstack/react-router'
import { ActivityCharts } from '@/components/Home/row2/ActivityCharts'
import { LiveTransactionsPanel } from '@/components/Home/LiveChainFeed'
import { TransactionRowData } from '@/components/Transaction/TransactionRowData'

export const Route = createFileRoute('/transactions')({
  component: Transactions,
})
function Transactions() {
  const isTransactionDetail = useRouterState({
    select: (state) =>
      state.matches.some((match) => match.routeId === '/transactions/$transaction'),
  })

  if (isTransactionDetail) return <Outlet />

  return (
    <main className="page-wrap route-entry py-10 sm:py-16">
      <p className="eyebrow">Transaction explorer</p>
      <h1 className="display-title mt-4 text-2xl font-extrabold">
        Transactions
      </h1>
      <TransactionRowData />
      <ActivityCharts />
      <div className="mt-5">
        <LiveTransactionsPanel />
      </div>
    </main>
  )
}
