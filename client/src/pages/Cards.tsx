import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../api'
import type { HoldingWithCard, PriceCache } from '../types'
import { CardItem } from '../components/CardItem'
import { SearchBar } from '../components/SearchBar'

export function Cards() {
  const [holdings, setHoldings] = useState<HoldingWithCard[]>([])
  const [prices, setPrices] = useState<Record<number, PriceCache | undefined>>(
    {}
  )
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setError(null)
    try {
      const hs = await api.listHoldings()
      setHoldings(hs)

      const uniqCardIds = Array.from(new Set(hs.map((h) => h.card_id)))
      const entries = await Promise.all(
        uniqCardIds.map(async (id) => {
          const list = await api.getPrices(id)
          return [id, list[0]] as const
        })
      )
      setPrices(Object.fromEntries(entries))
    } catch (e) {
      setError((e as Error).message)
    }
  }

  useEffect(() => {
    setLoading(true)
    load().finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!code || !name || !quantity || !purchasePrice) return
    setSubmitting(true)
    setError(null)
    try {
      const card = await api.createCard(code.trim(), name.trim())
      await api.createHolding(
        card.id,
        Number(quantity),
        Number(purchasePrice)
      )
      setCode('')
      setName('')
      setQuantity('')
      setPurchasePrice('')
      await load()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    setError(null)
    try {
      await api.deleteHolding(id)
      await load()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const q = query.trim().toLowerCase()
  const filtered = q
    ? holdings.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.card_code.toLowerCase().includes(q)
      )
    : holdings

  return (
    <div className="cards">
      <section className="card-form">
        <h2>カード追加</h2>
        <form onSubmit={handleSubmit}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="カード番号 (例: OP01-001)"
            required
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="カード名"
            required
          />
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="枚数"
            required
          />
          <input
            type="number"
            min="0"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            placeholder="購入価格 (¥)"
            required
          />
          <button type="submit" disabled={submitting}>
            {submitting ? '追加中...' : '追加'}
          </button>
        </form>
      </section>

      <section>
        <SearchBar value={query} onChange={setQuery} />

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p className="loading">読込中...</p>
        ) : filtered.length === 0 ? (
          <p className="empty">
            {holdings.length === 0 ? 'カードがありません' : '一致するカードなし'}
          </p>
        ) : (
          <div className="card-list">
            {filtered.map((h) => (
              <CardItem
                key={h.id}
                holding={h}
                price={prices[h.card_id]}
                onDelete={() => handleDelete(h.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
