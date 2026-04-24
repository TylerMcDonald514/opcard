import * as cheerio from 'cheerio'
import { httpClient } from '../httpClient'
import type { IScraper, PriceResult, ScraperInput } from '../types'

const BASE = 'https://yuyu-tei.jp'
const SEARCH_URL = `${BASE}/game_opc/sell`

const SELECTOR = {
  searchResultLink: '.card-product a',
  sellPrice: '.price-sell',
  buyPrice: '.price-kaitori',
  productTitle: 'h1',
} as const

function log(msg: string): void {
  console.log(`[yuyutei] ${msg}`)
}

// "¥1,280" / "1,280円" / "￥1，280" / " 1280 " などから数値を抽出
function parseYen(text: string | null | undefined): number | null {
  if (!text) return null
  const cleaned = text.replace(/[,，\s円¥￥]/g, '')
  const m = cleaned.match(/\d+/)
  return m ? Number(m[0]) : null
}

// 比較用正規化: 小文字化 + 空白 / 「・」 / 「-」除去
function normalize(s: string): string {
  return s.toLowerCase().replace(/[\s・\-]/g, '')
}

function absolutize(href: string): string {
  return href.startsWith('http') ? href : `${BASE}${href}`
}

async function safeGet(
  url: string,
  params?: Record<string, string>
): Promise<string | null> {
  try {
    const res = await httpClient.get(url, params ? { params } : undefined)
    return typeof res.data === 'string' ? res.data : String(res.data)
  } catch (e) {
    log(`fetch error: ${url} (${(e as Error).message})`)
    return null
  }
}

// Stage 1: 検索ページから商品URLを特定
async function findProductUrl(input: {
  cardCode?: string
  name?: string
}): Promise<string | null> {
  const query = input.cardCode ?? input.name
  if (!query) return null

  log(`search: "${query}"`)
  const html = await safeGet(SEARCH_URL, { word: query })
  if (!html) return null

  const $ = cheerio.load(html)
  const links = $(SELECTOR.searchResultLink).toArray()
  if (links.length === 0) {
    log(`no results: "${query}"`)
    return null
  }

  // ① cardCode一致 → ② name一致 → ③ 最初の要素
  const byText = (needle?: string) =>
    needle ? links.find((el) => $(el).text().includes(needle)) : undefined

  const target = byText(input.cardCode) ?? byText(input.name) ?? links[0]
  const href = target ? $(target).attr('href') : undefined
  if (!href) {
    log(`no href found: "${query}"`)
    return null
  }

  const url = absolutize(href)
  log(`match: ${url}`)
  return url
}

// Stage 2: 商品ページから販売/買取価格を取得（+ カード一致検証）
async function fetchProductPrices(
  url: string,
  expect: { cardCode?: string; name?: string }
): Promise<{
  sellPrice: number | null
  buyPrice: number | null
}> {
  const html = await safeGet(url)
  if (!html) return { sellPrice: null, buyPrice: null }

  const $ = cheerio.load(html)

  // カード一致検証: 正規化後の cardCode or name がページに含まれること
  const hasExpectation = !!(expect.cardCode || expect.name)
  if (hasExpectation) {
    const pageText = (
      $(SELECTOR.productTitle).first().text() || $('title').text()
    ).trim()
    const normalizedPage = normalize(pageText)

    const match = (needle?: string): boolean => {
      if (!needle) return false
      const n = normalize(needle)
      return n.length > 0 && normalizedPage.includes(n)
    }

    if (!match(expect.cardCode) && !match(expect.name)) {
      log(
        `mismatch: expected "${expect.cardCode ?? expect.name}" not in "${pageText}" url=${url}`
      )
      return { sellPrice: null, buyPrice: null }
    }
  }

  return {
    sellPrice: parseYen($(SELECTOR.sellPrice).first().text()),
    buyPrice: parseYen($(SELECTOR.buyPrice).first().text()),
  }
}

export const yuyuTeiScraper: IScraper = {
  source: 'yuyutei',

  async fetchPrice(input: ScraperInput): Promise<PriceResult> {
    const productUrl = input.url ?? (await findProductUrl(input))

    if (!productUrl) {
      return { sellPrice: null, buyPrice: null }
    }

    const { sellPrice, buyPrice } = await fetchProductPrices(productUrl, {
      cardCode: input.cardCode,
      name: input.name,
    })

    const ok = sellPrice != null || buyPrice != null
    log(
      `${ok ? 'ok' : 'empty'}: sell=${sellPrice ?? 'null'} buy=${buyPrice ?? 'null'} url=${productUrl}`
    )

    return {
      sellPrice,
      buyPrice,
      sourceUrl: productUrl,
    }
  },
}
