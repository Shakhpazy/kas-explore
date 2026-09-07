import { Outlet, createFileRoute, useRouterState } from '@tanstack/react-router'
import { BlockRowData } from '@/components/Block/BlockRowData'
import { LiveBlocksPanel } from '@/components/Home/LiveChainFeed'

export const Route = createFileRoute('/blocks')({ component: BlocksPage })

function BlocksPage() {
  const detail = useRouterState({
    select: (state) =>
      state.matches.some((match) => match.routeId === '/blocks/$block'),
  })
  if (detail) return <Outlet />
  return (
    <main className="page-wrap route-entry py-10 sm:py-16">
      <p className="eyebrow">Block explorer</p>
      <h1 className="display-title mt-4 text-2xl font-extrabold">Blocks</h1>
      <BlockRowData />
      <div className="mt-5">
        <LiveBlocksPanel />
      </div>
    </main>
  )
}
