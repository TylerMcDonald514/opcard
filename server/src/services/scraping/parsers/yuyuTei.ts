import * as cheerio from 'cheerio'
import { httpClient } from '../httpClient'
import type { IScraper, PriceResult, ScraperInput } from '../types'

function log(msg: string): void {
  console.log(`[yuyutei] ${msg}`)
}

function parseYen(text: string | null | undefined): number | null {
  if (!text) return null
  const cleaned = text.replace(/[,，\s円¥￥]/g, '')
  const m = cleaned.match(/\d+/)
  return m ? Number(m[0]) : null
}

function toBuyUrl(url: string): string {
  return url.replace('/sell/', '/buy/')
}

async function safeGet(url: string): Promise<string | null> {
  try {
    const res = await httpClient.get(url)
    return typeof res.data === 'string' ? res.data : String(res.data)
  } catch (e) {
    log(`fetch error: ${url} (${(e as Error).message})`)
    return null
  }
}

export const yuyuTeiScraper: IScraper = {
  source: 'yuyutei',

  async fetchPrice(input: ScraperInput): Promise<PriceResult> {
    const sellUrl = input.url

    if (!sellUrl) {
      log('no url provided')
      return { sellPrice: null, buyPrice: null }
    }

    const buyUrl = toBuyUrl(sellUrl)

    let sellPrice: number | null = null
    let buyPrice: number | null = null

    const sellHtml = await safeGet(sellUrl)
    if (sellHtml) {
      const $sell = cheerio.load(sellHtml)
      sellPrice = parseYen(
        $sell('.price').first().text() ||
        $sell('.sell_price').first().text() ||
        $sell('[class*="price"]').first().text()
      )
    }

    const buyHtml = await safeGet(buyUrl)
    if (buyHtml) {
      const $buy = cheerio.load(buyHtml)
      buyPrice = parseYen(
        $buy('.price').first().text() ||
        $buy('.buy_price').first().text() ||
        $buy('[class*="price"]').first().text()
      )
    } else {
      log(`buy fetch failed: ${buyUrl}`)
    }

    const ok = sellPrice != null || buyPrice != null

    log(
      `${ok ? 'ok' : 'empty'}: sell=${sellPrice ?? 'null'} buy=${buyPrice ?? 'null'} url=${sellUrl}`
    )

    return {
      sellPrice,
      buyPrice,
      sourceUrl: sellUrl,
    }
  },
}
