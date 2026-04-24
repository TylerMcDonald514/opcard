import { db } from '../db/client'

export interface Card {
  id: number
  card_code: string
  name: string
}

export const cardRepo = {
  findAll(q?: string): Card[] {
    if (q && q.trim()) {
      const like = `%${q.trim()}%`
      return db
        .prepare(
          'SELECT id, card_code, name FROM cards WHERE card_code LIKE ? OR name LIKE ? ORDER BY card_code'
        )
        .all(like, like) as Card[]
    }
    return db
      .prepare('SELECT id, card_code, name FROM cards ORDER BY card_code')
      .all() as Card[]
  },

  findById(id: number): Card | undefined {
    return db
      .prepare('SELECT id, card_code, name FROM cards WHERE id = ?')
      .get(id) as Card | undefined
  },

  findByCode(card_code: string): Card | undefined {
    return db
      .prepare('SELECT id, card_code, name FROM cards WHERE card_code = ?')
      .get(card_code) as Card | undefined
  },

  create(card_code: string, name: string): Card {
    const info = db
      .prepare('INSERT INTO cards (card_code, name) VALUES (?, ?)')
      .run(card_code, name)
    return { id: Number(info.lastInsertRowid), card_code, name }
  },
}
