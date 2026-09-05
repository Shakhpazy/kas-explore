import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/transactions')({
  component: Transactions,
})

function Transactions() {
  return <div>Hello "/transactions"!</div>
}
