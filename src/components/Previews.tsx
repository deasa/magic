// Static mockups that hint at each tool's UI on its placeholder page.

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

const VITALS = [
  { name: 'Land count', value: 34, target: 36, max: 42 },
  { name: 'Ramp', value: 7, target: 10, max: 15 },
  { name: 'Card draw', value: 11, target: 10, max: 15 },
  { name: 'Removal', value: 4, target: 8, max: 15 },
]

export function DoctorPreview() {
  return (
    <div className="preview" aria-hidden="true">
      {VITALS.map((v) => {
        const low = v.value < v.target - 1
        return (
          <div key={v.name} className="vital">
            <span className="preview-label">{v.name}</span>
            <span className="vital-bar">
              <span className={`vital-fill${low ? ' low' : ''}`} style={{ width: `${(v.value / v.max) * 100}%` }} />
              <span className="vital-target" style={{ left: `${(v.target / v.max) * 100}%` }} />
            </span>
            <span className={`vital-value${low ? ' low' : ''}`}>{v.value}</span>
          </div>
        )
      })}
    </div>
  )
}
