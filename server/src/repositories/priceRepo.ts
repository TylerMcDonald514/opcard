import { db } from '../db/client'

export interface PriceCache {
  id: number
  card_id: number
  source: string
  sell_price: number | null
  buy_price: number | null
  source_url: string | null
  fetched_at: string
}

export interface PriceUpsert {
  card_id: number
  source: string
  sell_price: number | null
  buy_price: number | null
  source_url: string | null
}

export const priceRepo = {
  findByCard(card_id: number): PriceCache[] {
    return db
      .prepare('SELECT * FROM price_cache WHERE card_id = ?')
      .all(card_id) as PriceCache[]
  },

  findByCardAndSource(
    card_id: number,
    source: string
  ): PriceCache | undefined {
    return db
      .prepare('SELECT * FROM price_cache WHERE card_id = ? AND source = ?')
      .get(card_id, source) as PriceCache | undefined
  },

  upsert(params: PriceUpsert): void {
    db.prepare(
      `INSERT INTO price_cache
         (card_id, source, sell_price, buy_price, source_url, fetched_at)
       VALUES
         (@card_id, @source, @sell_price, @buy_price, @source_url, CURRENT_TIMESTAMP)
       ON CONFLICT(card_id, source) DO UPDATE SET
         sell_price = excluded.sell_price,
         buy_price  = excluded.buy_price,
         source_url = COALESCE(excluded.source_url, price_cache.source_url),
         fetched_at = CURRENT_TIMESTAMP`
    ).run(params)
  },
}
