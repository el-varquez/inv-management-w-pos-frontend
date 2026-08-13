import { useState } from 'react';
import { peso, pesoWhole } from '../../../lib/format';
import type { SalesTrend, TrendPeriod } from '../../../types';

const W = 660;
const H = 232;
const L = 46; // plot left
const R = 576; // plot right
const T = 10; // plot top
const B = 196; // plot bottom (baseline)

const niceCeil = (v: number): number => {
  if (v <= 0) return 1000;
  const pow = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 2, 2.5, 5, 10]) {
    if (v <= m * pow) return m * pow;
  }
  return 10 * pow;
};

const bucketLabel = (iso: string, period: TrendPeriod): string => {
  const d = new Date(iso);
  if (period === 'day') return d.toLocaleTimeString('en-PH', { hour: 'numeric' });
  if (period === 'year') return d.toLocaleDateString('en-PH', { month: 'short' });
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
};

const tickLabel = (v: number): string =>
  v >= 1000 ? `₱${v / 1000}k` : pesoWhole.format(v);

// draw every Nth x label so 24/30-bucket axes don't collide
const LABEL_EVERY: Record<TrendPeriod, number> = { day: 4, week: 1, month: 5, year: 1 };

export const SalesTrendChart = ({ trend }: { trend: SalesTrend }) => {
  const [hover, setHover] = useState<number | null>(null);

  const { buckets, period } = trend;
  const n = buckets.length;
  if (n === 0) return null;

  const hasUtang = trend.totalUtangCharged > 0;
  const last = n - 1;

  const yMax = niceCeil(
    Math.max(...buckets.map((b) => Math.max(b.paidSales, b.utangCharged)))
  );
  const x = (i: number) => L + (i * (R - L)) / (n - 1 || 1);
  const y = (v: number) => B - (v / yMax) * (B - T);

  const salesPts = buckets.map((b, i) => `${x(i)},${y(b.paidSales)}`).join(' ');
  const utangPts = buckets.map((b, i) => `${x(i)},${y(b.utangCharged)}`).join(' ');
  const gridVals = [0, 0.25, 0.5, 0.75, 1].map((f) => f * yMax);
  const hovered = hover === null ? null : buckets[hover];

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - L) / (R - L)) * (n - 1));
    setHover(Math.max(0, Math.min(last, i)));
  };

  const onKey = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (e.key === 'ArrowRight') setHover((h) => Math.min(last, (h ?? last) + 1));
    if (e.key === 'ArrowLeft') setHover((h) => Math.max(0, (h ?? last) - 1));
    if (e.key === 'Escape') setHover(null);
  };

  return (
    <div className="dash-chart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Paid sales and utang charged over the selected period"
        tabIndex={0}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        onKeyDown={onKey}
        onBlur={() => setHover(null)}
      >
        {gridVals.map((v) => (
          <line key={`g${v}`} x1={L} y1={y(v)} x2={R} y2={y(v)} className="dash-grid-line" />
        ))}
        {gridVals.map((v) => (
          <text key={`t${v}`} x={L - 8} y={y(v) + 3} textAnchor="end" className="dash-axis">
            {tickLabel(v)}
          </text>
        ))}
        {buckets.map((b, i) =>
          i % LABEL_EVERY[period] === 0 || i === last ? (
            <text
              key={b.bucketStart}
              x={x(i)}
              y={B + 20}
              textAnchor="middle"
              className={i === last ? 'dash-axis dash-axis-today' : 'dash-axis'}
            >
              {bucketLabel(b.bucketStart, period)}
            </text>
          ) : null
        )}

        {hover !== null && (
          <line x1={x(hover)} y1={T} x2={x(hover)} y2={B} className="dash-crosshair" />
        )}

        {hasUtang && <polyline points={utangPts} className="dash-line dash-line-utang" />}
        <polyline points={salesPts} className="dash-line dash-line-sales" />

        {hover !== null && hovered && (
          <>
            <circle cx={x(hover)} cy={y(hovered.paidSales)} r={4.5} className="dash-dot dash-dot-sales" />
            {hasUtang && (
              <circle cx={x(hover)} cy={y(hovered.utangCharged)} r={4.5} className="dash-dot dash-dot-utang" />
            )}
          </>
        )}

        <circle cx={x(last)} cy={y(buckets[last].paidSales)} r={4.5} className="dash-dot dash-dot-sales" />
        <text x={x(last) + 10} y={y(buckets[last].paidSales) + 4} className="dash-end-lbl">
          {pesoWhole.format(buckets[last].paidSales)}
        </text>
        {hasUtang && (
          <>
            <circle cx={x(last)} cy={y(buckets[last].utangCharged)} r={4.5} className="dash-dot dash-dot-utang" />
            <text x={x(last) + 10} y={y(buckets[last].utangCharged) + 4} className="dash-end-lbl">
              {pesoWhole.format(buckets[last].utangCharged)}
            </text>
          </>
        )}
      </svg>

      {hover !== null && hovered && (
        <div className="dash-tip" style={{ left: `${(x(hover) / W) * 100}%` }}>
          <div className="dash-tip-day">{bucketLabel(hovered.bucketStart, period)}</div>
          <div className="dash-tip-row">
            <i className="dash-key-sales" />
            <b>{peso.format(hovered.paidSales)}</b> sales
          </div>
          {hasUtang && (
            <div className="dash-tip-row">
              <i className="dash-key-utang" />
              <b>{peso.format(hovered.utangCharged)}</b> utang
            </div>
          )}
        </div>
      )}
    </div>
  );
};
