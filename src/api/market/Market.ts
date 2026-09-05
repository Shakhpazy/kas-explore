import axios from 'axios'

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3'

export type MarketRange = '1D' | '7D' | '30D' | '1Y'

interface CoinGeckoMarketChartResponse {
  prices: Array<[number, number]>
  market_caps: Array<[number, number]>
  total_volumes: Array<[number, number]>
}

export interface KaspaMarketPoint {
  timestamp: number
  price: number
  marketCap: number | null
  volume: number | null
}

const daysByRange: Record<MarketRange, number> = {
  '1D': 1,
  '7D': 7,
  '30D': 30,
  '1Y' : 365,
}

function valueAtTimestamp(points: Array<[number, number]>, timestamp: number) {
  return (
    points.find(([pointTimestamp]) => pointTimestamp === timestamp)?.[1] ?? null
  )
}

export async function getKaspaMarketChart(range: MarketRange) {
  const response = await axios.get<CoinGeckoMarketChartResponse>(
    `${COINGECKO_BASE_URL}/coins/kaspa/market_chart`,
    {
      params: {
        vs_currency: 'usd',
        days: daysByRange[range],
      },
    },
  )

  return response.data.prices.map(([timestamp, price]) => ({
    timestamp,
    price,
    marketCap: valueAtTimestamp(response.data.market_caps, timestamp),
    volume: valueAtTimestamp(response.data.total_volumes, timestamp),
  })) satisfies KaspaMarketPoint[]
}
