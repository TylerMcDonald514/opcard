import { useEffect, useState } from 'react'
import { api } from '../api'
import type { DashboardSummary } from '../types'
import { SummaryCard } from '../components/SummaryCard'

export function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const load = async () => {
    setError(null)
    try {
      const s = await api.getSummary()
      setSummary(s)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  useEffect(() => {
    setLoading(true)
    load().finally(() => setLoading(false))
  }, [])

  // 「更新完了」は数秒で自動消去
  useEffect(() => {
    if (status === '更新完了') {
      const t = setTimeout(() => setStatus(null), 3000)
      return () => clearTimeout(t)
    }
  }, [status])

  const handleRefresh = async () => {
    setRefreshing(true)
    setError(null)
    setStatus('更新中... 遊々亭から価格を取得しています')
    try {
      const result = await api.refreshPrices()
      setLastRefresh(
        `更新 ${result.updated} / 失敗 ${result.failed} / 合計 ${result.total}`
      )
      await load()
      setStatus('更新完了')
    } catch (e) {
      setError((e as Error).message)
      setStatus(null)
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) return <p className="loading">読込中...</p>
  if (error && !summary) return <p className="error">{error}</p>
  if (!summary) return null

  const profit = summary.profit
  const profitTone =
    profit > 0 ? 'positive' : profit < 0 ? 'negative' : 'neutral'
  const profitText = `${profit > 0 ? '+' : ''}¥${profit.toLocaleString()}`

  return (
    <div className="dashboard">
      <div className="total">
        <div className="total-label">総資産額（現在価格ベース）</div>
        <div className="total-value">
          ¥{summary.currentValue.toLocaleString()}
        </div>
      </div>

      <div className="cards-grid">
        <SummaryCard
          label="取得原価"
          value={`¥${summary.cost.toLocaleString()}`}
        />
        <SummaryCard label="損益" value={profitText} tone={profitTone} />
        <SummaryCard
          label="所持枚数"
          value={summary.holdingsCount.toLocaleString()}
        />
      </div>

      <div className="actions">
        <button
          className="refresh-btn"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? '更新中...' : '価格更新'}
        </button>
        {lastRefresh && <span className="refresh-meta">{lastRefresh}</span>}
      </div>

      {status && (
        <div
          className={`status-message ${refreshing ? 'loading' : 'done'}`}
        >
          {status}
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  )
}
