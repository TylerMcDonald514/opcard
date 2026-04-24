import { db } from '../db/client'

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

export const holdingRepo = {
  findAll(): HoldingWithCard[] {
    return db
      .prepare(
        `SELECT h.id, h.card_id, h.quantity, h.purchase_price,
                c.card_code, c.name
         FROM card_holdings h
         JOIN cards c ON c.id = h.card_id
         ORDER BY h.id DESC`
      )
      .all() as HoldingWithCard[]
  },

  findAllCardIds(): number[] {
    const rows = db
      .prepare('SELECT DISTINCT card_id FROM card_holdings')
      .all() as { card_id: number }[]
    return rows.map((r) => r.card_id)
  },

  create(card_id: number, quantity: number, purchase_price: number): Holding {
    const info = db
      .prepare(
        'INSERT INTO card_holdings (card_id, quantity, purchase_price) VALUES (?, ?, ?)'
      )
      .run(card_id, quantity, purchase_price)
    return {
      id: Number(info.lastInsertRowid),
      card_id,
      quantity,
      purchase_price,
    }
  },

  delete(id: number): boolean {
    const info = db.prepare('DELETE FROM card_holdings WHERE id = ?').run(id)
    return info.changes > 0
  },
}
