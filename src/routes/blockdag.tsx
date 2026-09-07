import { createFileRoute } from '@tanstack/react-router'
import { BlockdagVisualizer } from '@/components/Block/BlockdagVisualizer'

export const Route = createFileRoute('/blockdag')({ component: BlockdagPage })

function BlockdagPage() {
  return <main className="page-wrap route-entry py-10 sm:py-16">
    <p className="eyebrow">Network explorer</p>
    <h1 className="display-title mt-4 text-2xl font-extrabold">BlockDAG</h1>
    <BlockdagVisualizer />
  </main>
}
