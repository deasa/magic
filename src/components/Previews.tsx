// Static mockup that hints at Penny Pincher's UI on its placeholder page.

const CATEGORIES = [
  { name: 'Lands', count: 36, pct: 22 },
  { name: 'Ramp', count: 10, pct: 18 },
  { name: 'Card draw', count: 10, pct: 16 },
  { name: 'Removal', count: 8, pct: 14 },
  { name: 'Synergy', count: 35, pct: 30 },
]

export function PennyPreview() {
  return (
    <div className="preview" aria-hidden="true">
      <div className="preview-row">
        <span className="preview-label">Max per card</span>
        <span className="preview-value">$1.00</span>
      </div>
      <div className="slider">
        <span className="slider-fill" style={{ width: '22%' }} />
        <span className="slider-thumb" style={{ left: '22%' }} />
      </div>
      <div className="preview-stack">
        {CATEGORIES.map((c) => (
          <span key={c.name} className="stack-seg" style={{ flexGrow: c.pct }} title={c.name} />
        ))}
      </div>
      <div className="preview-legend">
        {CATEGORIES.map((c) => (
          <span key={c.name}>
            {c.name} <b>{c.count}</b>
          </span>
        ))}
      </div>
    </div>
  )
}
