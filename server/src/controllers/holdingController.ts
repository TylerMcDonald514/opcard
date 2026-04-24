import type { Request, Response } from 'express'
import { holdingService } from '../services/holdingService'

export const holdingController = {
  list(_req: Request, res: Response) {
    res.json(holdingService.list())
  },

  create(req: Request, res: Response) {
    const { card_id, quantity, purchase_price } = req.body ?? {}
    if (card_id == null || quantity == null || purchase_price == null) {
      return res
        .status(400)
        .json({ error: 'card_id, quantity, purchase_price are required' })
    }
    try {
      const holding = holdingService.create(
        Number(card_id),
        Number(quantity),
        Number(purchase_price)
      )
      res.status(201).json(holding)
    } catch (e) {
      res.status(400).json({ error: (e as Error).message })
    }
  },

  delete(req: Request, res: Response) {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'invalid id' })
    }
    const ok = holdingService.delete(id)
    if (!ok) return res.status(404).json({ error: 'not found' })
    res.status(204).end()
  },
}
