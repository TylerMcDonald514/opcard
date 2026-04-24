import type { Request, Response } from 'express'
import { cardService } from '../services/cardService'

export const cardController = {
  list(req: Request, res: Response) {
    const q = typeof req.query.q === 'string' ? req.query.q : undefined
    res.json(cardService.list(q))
  },

  create(req: Request, res: Response) {
    const { card_code, name } = req.body ?? {}
    if (!card_code || !name) {
      return res.status(400).json({ error: 'card_code and name are required' })
    }
    const card = cardService.create(String(card_code), String(name))
    res.status(201).json(card)
  },
}
