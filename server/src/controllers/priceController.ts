import type { Request, Response } from 'express'
import { priceService } from '../services/priceService'

export const priceController = {
  getByCard(req: Request, res: Response) {
    const cardId = Number(req.params.cardId)
    if (!Number.isFinite(cardId)) {
      return res.status(400).json({ error: 'invalid cardId' })
    }
    res.json(priceService.getCached(cardId))
  },

  async refresh(req: Request, res: Response) {
    const { cardIds, source } = req.body ?? {}
    try {
      const result = await priceService.refresh({
        cardIds: Array.isArray(cardIds) ? cardIds.map(Number) : undefined,
        source: typeof source === 'string' ? source : undefined,
      })
      res.json(result)
    } catch (e) {
      res.status(500).json({ error: (e as Error).message })
    }
  },
}
