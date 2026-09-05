import { MarketChart } from '@/components/Home/row1/MarketChart'
import { NetworkStatsCards } from '@/components/Home/row1/NetworkStats'

export function Row1() {
  return (
    <div className="grid items-stretch gap-5 lg:grid-cols-2">
      <NetworkStatsCards />
      <MarketChart />
    </div>
  )
}
