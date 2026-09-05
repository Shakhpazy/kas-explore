import { Card } from '@/components/ui/card/Card'
import { SkeletonCard } from '@/components/ui/card/SkeletonCard'
import { useNetworkCardData } from '@/hooks/useNetworkCardData'

export function NetworkStatsCards() {
  const { cards } = useNetworkCardData()

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.map(({ isPending, isError, ...card }) => {
        if (isPending) return <SkeletonCard key={card.title} />

        if (isError) {
          return (
            <Card
              key={card.title}
              title={card.title}
              content="Failed to load data"
              description="Please try again later"
            />
          )
        }

        return <Card key={card.title} {...card} />
      })}
    </div>
  )
}