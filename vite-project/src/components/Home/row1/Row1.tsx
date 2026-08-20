import { MarketChart } from '@/components/Home/row1/MarketChart'
import { NetworkStatsCards } from '@/components/Home/row1/NetworkStats'

export function Row1() {
  return (
    <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2">
      <div className="min-w-0">
        <NetworkStatsCards />
      </div>
      <div className="min-w-0">
        <MarketChart />
      </div>
    </div>
  )
}