import PQueue from 'p-queue'
import { cardRepo } from '../repositories/cardRepo'
import { holdingRepo } from '../repositories/holdingRepo'
import { priceRepo, type PriceCache } from '../repositories/priceRepo'
import { scrapeLogRepo } from '../repositories/scrapeLogRepo'
import { scraperRegistry } from './scraping/registry'

const DEFAULT_SOURCE = 'yuyutei'

export interface RefreshOptions {
  cardIds?: number[]
  source?: string
}

export interface RefreshResult {
  source: string
  total: number
  updated: number
  failed: number
}

export const priceService = {
  getCached(cardId: number): PriceCache[] {
    return priceRepo.findByCard(cardId)
  },

  async refresh(options: RefreshOptions = {}): Promise<RefreshResult> {
    const source = options.source ?? DEFAULT_SOURCE
    const scraper = scraperRegistry.get(source)

    const targetIds =
      options.cardIds && options.cardIds.length > 0
        ? options.cardIds
        : holdingRepo.findAllCardIds()

    const queue = new PQueue({
      concurrency: 2,
      interval: 1000,
      intervalCap: 2,
    })

    let updated = 0
    let failed = 0

    const tasks = targetIds.map((cardId) => async () => {
      const card = cardRepo.findById(cardId)
      if (!card) return

      const cached = priceRepo.findByCardAndSource(cardId, source)
      const startedAt = new Date().toISOString()

      try {
        const result = await scraper.fetchPrice({
          cardCode: card.card_code,
          name: card.name,
          url: cached?.source_url ?? undefined,
        })

        priceRepo.upsert({
          card_id: cardId,
          source,
          sell_price: result.sellPrice,
          buy_price: result.buyPrice,
          source_url: result.sourceUrl ?? cached?.source_url ?? null,
        })

        scrapeLogRepo.log({
          source,
          target: card.card_code,
          status: 'ok',
          started_at: startedAt,
        })
        updated++
      } catch (e) {
        scrapeLogRepo.log({
          source,
          target: card.card_code,
          status: 'error',
          message: (e as Error).message,
          started_at: startedAt,
        })
        failed++
      }
    })

    await queue.addAll(tasks)

    return { source, total: targetIds.length, updated, failed }
  },
}
