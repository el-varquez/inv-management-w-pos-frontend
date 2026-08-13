import type { StockHealth } from '../../../types';

const R_DONUT = 62;
const CIRC = 2 * Math.PI * R_DONUT;
const GAP = 3; // 2px-ish surface gap between segments, in viewBox units

export const StockHealthDonut = ({ health }: { health: StockHealth }) => {
  const { totalItems, inStock, lowStock, outOfStock } = health;

  const segs = [
    { key: 'in', label: 'In stock', count: inStock, cls: 'dash-seg-green' },
    { key: 'low', label: 'Low stock', count: lowStock, cls: 'dash-seg-gold' },
    { key: 'out', label: 'Out of stock', count: outOfStock, cls: 'dash-seg-red' },
  ];
  const nonZero = segs.filter((s) => s.count > 0);

  let offset = 0;
  const arcs = nonZero.map((s) => {
    const len = (s.count / totalItems) * CIRC;
    const arc = { ...s, dash: Math.max(len - GAP, 0.5), start: offset };
    offset += len;
    return arc;
  });

  return (
    <div className="dash-donut-wrap">
      <svg
        width="164"
        height="164"
        viewBox="0 0 180 180"
        role="img"
        aria-label={`${totalItems} items — ${inStock} in stock, ${lowStock} low, ${outOfStock} out of stock`}
      >
        <g transform="rotate(-90 90 90)" fill="none" strokeWidth="24">
          {totalItems === 0 ? (
            <circle cx="90" cy="90" r={R_DONUT} className="dash-seg-empty" />
          ) : nonZero.length === 1 ? (
            <circle cx="90" cy="90" r={R_DONUT} className={nonZero[0].cls} />
          ) : (
            arcs.map((a) => (
              <circle
                key={a.key}
                cx="90"
                cy="90"
                r={R_DONUT}
                className={a.cls}
                strokeDasharray={`${a.dash} ${CIRC - a.dash}`}
                strokeDashoffset={-a.start}
              />
            ))
          )}
        </g>
        <text x="90" y="90" textAnchor="middle" className="dash-donut-n">
          {totalItems}
        </text>
        <text x="90" y="108" textAnchor="middle" className="dash-donut-cap">
          items
        </text>
      </svg>
      <div className="dash-donut-legend">
        {segs.map((s) => (
          <div key={s.key} className="dash-dl-row">
            <span className={`dash-dot-swatch ${s.cls}`} />
            {s.label}
            <span className="dash-dl-count">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
