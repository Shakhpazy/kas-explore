import { Outlet, createFileRoute, useRouterState } from '@tanstack/react-router'
import { WalletCards } from 'lucide-react'
import { AddressRowData } from '@/components/Address/AddressRowData'
import { AddressTop } from '@/components/Address/AddressTop'

export const Route = createFileRoute('/addresses')({ component: Addresses })

function Addresses() {
  const isAddressDetail = useRouterState({
    select: (state) =>
      state.matches.some((match) => match.routeId === '/addresses/$address'),
  })

  if (isAddressDetail) return <Outlet />

  return (
    <main className="page-wrap route-entry py-10 sm:py-16">
      <p className="eyebrow">Address explorer</p>
      <h1 className="display-title mt-4 font-extrabold text-2xl">
        Addresses
      </h1>
      <AddressRowData />
      <AddressTop />
    </main>
  )
}
