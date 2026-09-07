import { createFileRoute } from '@tanstack/react-router'
import { TransactionDetails } from '@/components/Transaction/TransactionDetails'


export const Route = createFileRoute('/transactions/$transaction')({
  component: TransactionDetailPage,
})

function TransactionDetailPage() {
  const { transaction } = Route.useParams()

  return (
    <main className="page-wrap route-entry py-10 sm:py-16">
      <p className="eyebrow">Transaction overview</p>
      <h1 className="display-title mt-4 text-4xl font-extrabold sm:text-5xl">
        Transaction details.
      </h1>
      <TransactionDetails transactionId={transaction} />
    </main>
  )
}
