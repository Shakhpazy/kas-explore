import { createFileRoute } from '@tanstack/react-router'
import { BlockDetails } from '@/components/Block/BlockDetails'

export const Route = createFileRoute('/blocks/$block')({ component: BlockPage })

function BlockPage() {
  const { block } = Route.useParams()
  return (
    <main className="page-wrap route-entry py-10 sm:py-16">
      <p className="eyebrow">Block overview</p>
      <h1 className="display-title mt-4 text-4xl font-extrabold sm:text-5xl">
        Block details.
      </h1>
      <BlockDetails key={block} hash={block} />
    </main>
  )
}
