import type { IScraper } from './types'
import { yuyuTeiScraper } from './parsers/yuyuTei'

const scrapers = new Map<string, IScraper>()
scrapers.set(yuyuTeiScraper.source, yuyuTeiScraper)

export const scraperRegistry = {
  get(source: string): IScraper {
    const s = scrapers.get(source)
    if (!s) throw new Error(`Unknown scraper source: ${source}`)
    return s
  },

  list(): string[] {
    return [...scrapers.keys()]
  },
}
