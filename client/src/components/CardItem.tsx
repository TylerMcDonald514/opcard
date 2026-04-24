import type { HoldingWithCard, PriceCache } from '../types'

interface Props {
  holding: HoldingWithCard
  price?: PriceCache
  onDelete: () => void
}

const yen = (n: number) => `¥${n.toLocaleString()}`

export function CardItem({ holding, price, onDelete }: Props) {
  const sell = price?.sell_price ?? null
  const currentValue = sell != null ? sell * holding.quantity : null
  const cost = holding.purchase_price * holding.quantity
  const profit = currentValue != null ? currentValue - cost : null

  const profitClass =
    profit == null
      ? ''
      : profit > 0
        ? 'positive'
        : profit < 0
          ? 'negative'
          : 'neutral'

  return (
    <div className="card-item">
      <div className="card-item-header">
        <div className="card-name">{holding.name}</div>
        <div className="card-code">{holding.card_code}</div>
      </div>

      <div className="card-item-body">
        <div>
          <div className="field-label">枚数</div>
          <div>{holding.quantity.toLocaleString()}</div>
        </div>
        <div>
          <div className="field-label">現在価格</div>
          <div>{sell != null ? yen(sell) : '—'}</div>
        </div>
        <div>
          <div className="field-label">合計価値</div>
          <div>{currentValue != null ? yen(currentValue) : '—'}</div>
        </div>
        <div>
          <div className="field-label">損益</div>
          <div className={profitClass}>
            {profit != null
              ? `${profit > 0 ? '+' : ''}${yen(profit)}`
              : '—'}
          </div>
        </div>
      </div>

      <button className="delete-btn" onClick={onDelete}>
        削除
      </button>
    </div>
  )
}
