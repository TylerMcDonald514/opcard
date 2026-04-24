export interface Card {
  id: number
  card_code: string
  name: string
}

export interface Holding {
  id: number
  card_id: number
  quantity: number
  purchase_price: number
}

export interface HoldingWithCard extends Holding {
  card_code: string
  name: string
}

export interface PriceCache {
  id: number
  card_id: number
  source: string
  sell_price: number | null
  buy_price: number | null
  source_url: string | null
  fetched_at: string
}

export interface DashboardSummary {
  source: string
  currentValue: number
  cost: number
  profit: number
  holdingsCount: number
}

export interface RefreshResult {
  source: string
  total: number
  updated: number
  failed: number
}
