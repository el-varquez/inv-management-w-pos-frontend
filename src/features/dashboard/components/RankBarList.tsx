export interface RankBarRow {
  key: string;
  label: string;
  value: string;
  pct: number; // 0..100, relative to the largest row
  meta?: string;
}

interface Props {
  rows: RankBarRow[];
  fill: 'gold' | 'green';
  ranked?: boolean;
  money?: boolean;
}

export const RankBarList = ({ rows, fill, ranked = false, money = false }: Props) => (
  <div className="dash-rank-list">
    {rows.map((r, i) => (
      <div key={r.key} className="dash-rank-row">
        <div className="dash-rank-name">
          {ranked && <span className="dash-rank-n">{i + 1}</span>}
          <span className="dash-rank-t">{r.label}</span>
        </div>
        <div className={money ? 'dash-rank-val dash-rank-money' : 'dash-rank-val'}>
          {r.value}
        </div>
        <div className="dash-track">
          <div className={`dash-fill dash-fill-${fill}`} style={{ width: `${r.pct}%` }} />
        </div>
        {r.meta && <div className="dash-rank-meta">{r.meta}</div>}
      </div>
    ))}
  </div>
);
