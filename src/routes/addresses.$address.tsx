import { createFileRoute } from '@tanstack/react-router'
import { AddressDetail } from '@/components/Address/AddressDetail'

export const Route = createFileRoute('/addresses/$address')({
  component: AddressDetailPage,
})

function AddressDetailPage() {
  const { address } = Route.useParams()

  return (
    <main className="page-wrap route-entry py-10 sm:py-16">
      <AddressDetail address={address} />
    </main>
  )
}
