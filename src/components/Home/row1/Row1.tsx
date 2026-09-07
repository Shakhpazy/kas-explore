import { MarketChart } from '@/components/Home/row1/MarketChart'
import { NetworkStatsCards } from '@/components/Home/row1/NetworkStats'

export function Row1() {
  return (
    <div className="home-overview-grid">
      <NetworkStatsCards />
      <MarketChart />
    </div>
  )
}
