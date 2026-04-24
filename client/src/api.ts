  import type {
    Card,
    Holding,
    HoldingWithCard,
    PriceCache,
    DashboardSummary,
    RefreshResult,
  } from './types'

  const BASE = import.meta.env.VITE_API_URL

  console.log('API:', BASE)

  async function request<T>(
    path: string,
    init?: RequestInit
  ): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`${init?.method ?? 'GET'} ${path} ${res.status}: ${text}`)
    }
    if (res.status === 204) return undefined as T
    return res.json() as Promise<T>
  }

  export const api = {
    listCards: (q?: string) =>
      request<Card[]>(`/cards${q ? `?q=${encodeURIComponent(q)}` : ''}`),

    createCard: (card_code: string, name: string) =>
      request<Card>('/cards', {
        method: 'POST',
        body: JSON.stringify({ card_code, name }),
      }),

    listHoldings: () => request<HoldingWithCard[]>('/holdings'),

    createHolding: (
      card_id: number,
      quantity: number,
      purchase_price: number
    ) =>
      request<Holding>('/holdings', {
        method: 'POST',
        body: JSON.stringify({ card_id, quantity, purchase_price }),
      }),

    deleteHolding: (id: number) =>
      request<void>(`/holdings/${id}`, { method: 'DELETE' }),

    getPrices: (cardId: number) =>
      request<PriceCache[]>(`/prices/${cardId}`),

    refreshPrices: (cardIds?: number[]) =>
      request<RefreshResult>('/prices/refresh', {
        method: 'POST',
        body: JSON.stringify({ cardIds }),
      }),

    getSummary: () => request<DashboardSummary>('/dashboard/summary'),
  }
