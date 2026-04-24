export interface PriceResult {
  sellPrice: number | null
  buyPrice: number | null
  sourceUrl?: string
}

export interface ScraperInput {
  cardCode?: string
  name?: string
  url?: string
}

export interface IScraper {
  source: string
  fetchPrice(input: ScraperInput): Promise<PriceResult>
}
