import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { useSalesTrend } from '../hooks/useSalesTrend';
import { usePopularItems } from '../hooks/usePopularItems';
import { useProfitMonth } from '../hooks/useProfitMonth';
import { SalesTrendChart } from '../components/SalesTrendChart';
import { RankBarList } from '../components/RankBarList';
import { StockHealthDonut } from '../components/StockHealthDonut';
import { peso } from '../../../lib/format';
import type { PopularWindow } from '../hooks/usePopularItems';
import type { TrendPeriod } from '../../../types';

export const DashboardScreen = () => {
  const { summary, loading, error, refetch } = useDashboardSummary();
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>('week');
  const [popularWindow, setPopularWindow] = useState<PopularWindow>('week');
  const {
    trend,
    loading: trendLoading,
    error: trendError,
    refetch: refetchTrend,
  } = useSalesTrend(trendPeriod);
  const {
    items: popular,
    loading: popularLoading,
    error: popularError,
    refetch: refetchPopular,
  } = usePopularItems(popularWindow);
  const {
    report: profit,
    loading: profitLoading,
    error: profitError,
    refetch: refetchProfit,
  } = useProfitMonth();

  const today = summary?.today;
  const dim = loading && summary !== null;

  const handleRefresh = () => {
    refetch();
    refetchTrend();
    refetchPopular();
    refetchProfit();
  };

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Overview</p>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-lead">How the store is doing, at a glance.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={handleRefresh} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="card table-wrap">
          <div className="state state-error">
            <div className="state-emoji">⚠️</div>
            <div className="state-title">Something went wrong</div>
            <p className="state-msg">{error}</p>
            <button className="btn btn-ghost" onClick={refetch}>
              Try again
            </button>
          </div>
        </div>
      ) : (
        <div className={dim ? 'dash-dim' : undefined}>
          <div className="stat-row">
            <div className="card stat-card">
              <div className="stat-label">Sales today</div>
              <div className="stat-value">
                {today ? peso.format(today.paidSales) : '—'}
              </div>
              <div className="stat-sub">
                {today?.deltaPercent != null ? (
                  <>
                    <span
                      className={
                        today.deltaPercent >= 0 ? 'stat-delta up' : 'stat-delta down'
                      }
                    >
                      {today.deltaPercent >= 0 ? '▲' : '▼'}{' '}
                      {Math.abs(today.deltaPercent)}%
                    </span>{' '}
                    vs yesterday
                  </>
                ) : (
                  'no sales yesterday to compare'
                )}
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-label">Transactions today</div>
              <div className="stat-value">{today ? today.transactionCount : '—'}</div>
              <div className="stat-sub">
                {today && today.transactionCount > 0
                  ? `avg ${peso.format(today.averageSale)} per sale`
                  : 'no sales yet today'}
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-label">Utang outstanding</div>
              <div className="stat-value">
                {summary ? peso.format(summary.utang.totalOutstanding) : '—'}
              </div>
              <div className="stat-sub">
                {summary && summary.utang.sukiCount > 0 ? (
                  <>
                    <span className="stat-dot" />
                    {summary.utang.sukiCount} suki carrying utang
                  </>
                ) : (
                  'no suki carrying utang'
                )}
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-label">Low stock</div>
              <div className="stat-value">
                {summary ? summary.stockHealth.lowStock : '—'}
              </div>
              <div className="stat-sub">
                {summary && summary.stockHealth.outOfStock > 0 ? (
                  <span className="stat-warn">
                    {summary.stockHealth.outOfStock} out of stock
                  </span>
                ) : (
                  'nothing out of stock'
                )}
              </div>
            </div>
          </div>

          <div className="dash-grid">
            <div className="card dash-span2">
              <div className="dash-head">
                <div>
                  <h2 className="dash-title">Sales &amp; utang</h2>
                  <div className="dash-sub">
                    {trendError ? (
                      '—'
                    ) : trend ? (
                      <>
                        <b>{peso.format(trend.totalPaidSales)}</b> paid sales
                        {trend.totalUtangCharged > 0 ? (
                          <>
                            {' '}· <b>{peso.format(trend.totalUtangCharged)}</b> charged on utang
                          </>
                        ) : (
                          <> · no utang in this period</>
                        )}
                      </>
                    ) : (
                      'Loading…'
                    )}
                  </div>
                  {trend && trend.totalUtangCharged > 0 && (
                    <div className="dash-legend">
                      <span className="dash-lg"><i className="dash-key-sales" />Sales (paid)</span>
                      <span className="dash-lg"><i className="dash-key-utang" />Utang charged</span>
                    </div>
                  )}
                </div>
                <div className="segmented segmented-sm">
                  {(['day', 'week', 'month', 'year'] as const).map((p) => (
                    <button
                      key={p}
                      className={trendPeriod === p ? 'seg is-active' : 'seg'}
                      onClick={() => setTrendPeriod(p)}
                    >
                      {p === 'day' ? 'Day' : p === 'week' ? 'Week' : p === 'month' ? 'Month' : 'Year'}
                    </button>
                  ))}
                </div>
              </div>
              {trendError ? (
                <div className="dash-empty">{trendError}</div>
              ) : (
                <div className={trendLoading && trend ? 'dash-dim' : undefined}>
                  {trend && <SalesTrendChart key={trend.period} trend={trend} />}
                </div>
              )}
              <div className="dash-foot">
                <span>Utang is never counted in sales — two separate lines on one scale.</span>
                <Link className="dash-link" to="/reports/sales">Open sales report →</Link>
              </div>
            </div>
            <div className="card">
              <div className="dash-head">
                <div>
                  <h2 className="dash-title">Popular items</h2>
                  <div className="dash-sub">by units sold</div>
                </div>
                <div className="segmented segmented-sm">
                  {(['week', 'month', 'year'] as const).map((w) => (
                    <button
                      key={w}
                      className={popularWindow === w ? 'seg is-active' : 'seg'}
                      onClick={() => setPopularWindow(w)}
                    >
                      {w === 'week' ? 'Week' : w === 'month' ? 'Month' : 'Year'}
                    </button>
                  ))}
                </div>
              </div>
              {popularError ? (
                <div className="dash-empty">{popularError}</div>
              ) : popular.length === 0 ? (
                <div className="dash-empty">No sales in this window yet.</div>
              ) : (
                <div className={popularLoading ? 'dash-dim' : undefined}>
                  <RankBarList
                    ranked
                    fill="green"
                    rows={popular.map((p) => ({
                      key: p.itemId,
                      label: p.itemName,
                      value: String(p.quantitySold),
                      pct: (p.quantitySold / popular[0].quantitySold) * 100,
                    }))}
                  />
                </div>
              )}
              <div className="dash-foot">
                <span>Top 8 — same ranking the register strip uses.</span>
                <Link className="dash-link" to="/reports/best-sellers">Best sellers →</Link>
              </div>
            </div>
            <div className="card">
              <div className="dash-head">
                <div>
                  <h2 className="dash-title">Items</h2>
                  <div className="dash-sub">catalog by stock health</div>
                </div>
              </div>
              {summary && <StockHealthDonut health={summary.stockHealth} />}
              <div className="dash-foot">
                <span>Matches the Low stock screen's thresholds.</span>
                <Link className="dash-link" to="/inventory/stock-levels">Stock levels →</Link>
              </div>
            </div>
            <div className="card dash-span2">
              <div className="dash-head">
                <div>
                  <h2 className="dash-title">Top utang</h2>
                  <div className="dash-sub">
                    {summary && summary.utang.sukiCount > 0 ? (
                      <>
                        <b>{peso.format(summary.utang.totalOutstanding)}</b> outstanding
                        across <b>{summary.utang.sukiCount} suki</b> ·{' '}
                        <span className="good">
                          {peso.format(summary.utang.collectedThisWeek)} collected
                        </span>{' '}
                        this week
                      </>
                    ) : (
                      'customer credit, largest balance first'
                    )}
                  </div>
                </div>
              </div>
              {summary && summary.utang.top.length > 0 ? (
                <>
                  <RankBarList
                    fill="gold"
                    money
                    ranked
                    rows={summary.utang.top.map((u) => ({
                      key: u.sukiId,
                      label: u.name,
                      value: peso.format(u.balance),
                      pct: (u.balance / summary.utang.top[0].balance) * 100,
                      meta: `${Math.round((u.balance / summary.utang.totalOutstanding) * 100)}% of total · ${u.chargeCount} charge${u.chargeCount === 1 ? '' : 's'} · oldest ${u.oldestDays} day${u.oldestDays === 1 ? '' : 's'}`,
                    }))}
                  />
                  <div className="dash-foot">
                    <span>Bars scaled to the largest balance.</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="dash-empty">
                    No utang recorded yet — the register starts selling on credit in the
                    desktop phase.
                  </div>
                  <div className="dash-foot">
                    <span>Utang report lands under Reports after the dashboard.</span>
                  </div>
                </>
              )}
            </div>
            <div className="card">
              <div className="dash-head">
                <div>
                  <h2 className="dash-title">Payments today</h2>
                  <div className="dash-sub">where the money came in</div>
                </div>
              </div>
              {summary && (
                <RankBarList
                  fill="green"
                  money
                  rows={(() => {
                    const max = Math.max(
                      ...summary.paymentsToday.map((p) => p.amount),
                      1
                    );
                    return summary.paymentsToday.map((p) => ({
                      key: p.method,
                      label: p.method,
                      value: peso.format(p.amount),
                      pct: (p.amount / max) * 100,
                      meta: `${p.transactionCount} transaction${p.transactionCount === 1 ? '' : 's'}`,
                    }));
                  })()}
                />
              )}
              <div className="dash-foot">
                <span>One hue on purpose — the rows compare amounts, not identities.</span>
              </div>
            </div>

            <div className="card">
              <div className="dash-head">
                <div>
                  <h2 className="dash-title">Profit</h2>
                  <div className="dash-sub">month to date · paid sales only</div>
                </div>
              </div>
              {profitError ? (
                <div className="dash-empty">{profitError}</div>
              ) : (
                <div className={profitLoading && profit ? 'dash-dim' : undefined}>
                  {profit && (
                    <div className="dash-receipt">
                      <div className="dash-receipt-row">
                        <span>Sales</span>
                        <span className="amt">{peso.format(profit.netSales)}</span>
                      </div>
                      <div className="dash-receipt-rule" />
                      <div className="dash-receipt-row">
                        <span>Cost of goods</span>
                        <span className="amt">− {peso.format(profit.costOfGoodsSold)}</span>
                      </div>
                      <div className="dash-receipt-row">
                        <span>Inventory loss</span>
                        <span className="amt">− {peso.format(profit.inventoryLoss)}</span>
                      </div>
                      <div className="dash-receipt-row total">
                        <span>Profit</span>
                        <span className={profit.netProfit < 0 ? 'amt loss' : 'amt'}>
                          {peso.format(profit.netProfit)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="dash-foot">
                <span>Same math as the profit report.</span>
                <Link className="dash-link" to="/reports/profit">Profit report →</Link>
              </div>
            </div>

            <div className="card">
              <div className="dash-head">
                <div>
                  <h2 className="dash-title">Running out</h2>
                  <div className="dash-sub">act on these today</div>
                </div>
              </div>
              {summary && summary.runningOut.length > 0 ? (
                <div className="dash-stock-list">
                  {summary.runningOut.map((r) => (
                    <div key={r.itemId} className="dash-stock-row">
                      <span
                        className={
                          r.stock <= 0 ? 'dash-chip dash-chip-out' : 'dash-chip dash-chip-low'
                        }
                      >
                        {r.stock <= 0 ? 'Out' : 'Low'}
                      </span>
                      <span className="dash-stock-nm">{r.name}</span>
                      <span className="dash-stock-lv">
                        {r.stock} left · min {r.lowStockThreshold}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dash-empty">Nothing low — fully stocked.</div>
              )}
              <div className="dash-foot">
                <span>Out of stock first, biggest deficit next.</span>
                <Link className="dash-link" to="/inventory/receive">Receive stock →</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
