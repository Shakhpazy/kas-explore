import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/addresses')({
  component: Addresses,
})

function Addresses() {
  return <div>Hello "/addresses"!</div>
}
