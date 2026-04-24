import { db } from '../db/client'

export interface ScrapeLogInput {
  source: string
  target: string | null
  status: 'ok' | 'error'
  message?: string | null
  started_at: string
}

export const scrapeLogRepo = {
  log(input: ScrapeLogInput): void {
    db.prepare(
      `INSERT INTO scrape_logs (source, target, status, message, started_at)
       VALUES (@source, @target, @status, @message, @started_at)`
    ).run({ ...input, message: input.message ?? null })
  },
}
