interface Props {
  label: string
  value: string
  tone?: 'positive' | 'negative' | 'neutral'
}

export function SummaryCard({ label, value, tone = 'neutral' }: Props) {
  return (
    <div className="summary-card">
      <div className="summary-label">{label}</div>
      <div className={`summary-value ${tone}`}>{value}</div>
    </div>
  )
}
