import { db } from '../db/client'

const DEFAULT_SOURCE = 'yuyutei'

export interface DashboardSummary {
  source: string
  currentValue: number
  cost: number
  profit: number
  holdingsCount: number
}

export const dashboardService = {
  summary(source: string = DEFAULT_SOURCE): DashboardSummary {
    const row = db
      .prepare(
        `SELECT
           COALESCE(SUM(h.quantity * COALESCE(p.sell_price, 0)), 0) AS current_value,
           COALESCE(SUM(h.quantity * h.purchase_price), 0)          AS cost,
           COALESCE(SUM(h.quantity), 0)                             AS holdings_count
         FROM card_holdings h
         LEFT JOIN price_cache p
           ON p.card_id = h.card_id AND p.source = ?`
      )
      .get(source) as {
      current_value: number
      cost: number
      holdings_count: number
    }

    return {
      source,
      currentValue: row.current_value,
      cost: row.cost,
      profit: row.current_value - row.cost,
      holdingsCount: row.holdings_count,
    }
  },
}
