import { useState } from 'react';
import { useProfitReport } from '../hooks/useProfitReport';
import { useDateRange } from '../../../hooks/useDateRange';
import { useCategories } from '../../items/hooks/useCategories';
import { ItemSearchSelect } from '../../items/components/ItemSearchSelect';
import { ReportsTabs } from '../components/ReportsTabs';
import { DateRangeControls } from '../../../components/DateRangeControls';
import { Pagination } from '../../../components/Pagination';
import { SearchSelect } from '../../../components/SearchSelect';
import { peso } from '../../../lib/format';

export const ProfitReportScreen = () => {
  const {
    preset,
    setPreset,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    range,
  } = useDateRange('month');

  const { categories } = useCategories();

  const [categoryId, setCategoryId] = useState('');
  const [itemId, setItemId] = useState('');
  const [itemName, setItemName] = useState('');

  const {
    report,
    items: details,
    loading,
    error,
    refetch,
    page,
    setPage,
    pageSize,
    totalCount,
    totalPages,
  } = useProfitReport(range, { categoryId, itemId });

  const onCategoryChange = (value: string) => {
    setCategoryId(value);
    setItemId('');
    setItemName('');
  };

  const filters = (
    <>
      <div className="field">
        <label htmlFor="filter-category">Category</label>
        <SearchSelect
          id="filter-category"
          value={categoryId}
          onChange={onCategoryChange}
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          allLabel="All categories"
          placeholder="Search categories…"
        />
      </div>
      <div className="field">
        <label htmlFor="filter-item">Item</label>
        <ItemSearchSelect
          id="filter-item"
          value={itemId}
          selectedLabel={itemName}
          onChange={(id, item) => {
            setItemId(id);
            setItemName(item?.name ?? '');
          }}
          categoryId={categoryId || undefined}
          allLabel="All items"
          placeholder="Search items…"
        />
      </div>
    </>
  );

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Reports · Profit</p>
          <h1 className="page-title">Profit report</h1>
          <p className="page-lead">
            {loading
              ? 'Crunching the numbers…'
              : error
                ? 'Could not load the profit report.'
                : `Net profit of ${peso.format(report?.netProfit ?? 0)} in the selected period`}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={refetch} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      <ReportsTabs />

      <DateRangeControls
        leading={filters}
        preset={preset}
        setPreset={setPreset}
        customFrom={customFrom}
        setCustomFrom={setCustomFrom}
        customTo={customTo}
        setCustomTo={setCustomTo}
      />

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
        <>
          <div className="stat-row">
            <div className="card stat-card">
              <div className="stat-label">Net sales</div>
              <div className="stat-value tnum">
                {peso.format(report?.netSales ?? 0)}
              </div>
            </div>
            <div className="card stat-card">
              <div className="stat-label">Cost of goods sold</div>
              <div className="stat-value tnum">
                {peso.format(report?.costOfGoodsSold ?? 0)}
              </div>
            </div>
            <div className="card stat-card">
              <div className="stat-label">Gross profit</div>
              <div className="stat-value tnum">
                {peso.format(report?.grossProfit ?? 0)}
              </div>
            </div>
            <div className="card stat-card">
              <div className="stat-label">Inventory loss</div>
              <div className="stat-value tnum">
                {peso.format(report?.inventoryLoss ?? 0)}
              </div>
            </div>
            <div className="card stat-card">
              <div className="stat-label">Net profit</div>
              <div className="stat-value tnum">
                {peso.format(report?.netProfit ?? 0)}
              </div>
            </div>
            <div className="card stat-card">
              <div className="stat-label">Gross margin</div>
              <div className="stat-value tnum">
                {report?.grossMarginPercent ?? 0}%
              </div>
            </div>
          </div>

          <div className="card table-wrap">
            {loading ? (
              <ProfitTable>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td>
                      <span className="skeleton" style={{ width: '55%' }} />
                    </td>
                    <td className="num">
                      <span className="skeleton" style={{ width: 30, marginLeft: 'auto' }} />
                    </td>
                    <td className="num">
                      <span className="skeleton" style={{ width: 70, marginLeft: 'auto' }} />
                    </td>
                    <td className="num">
                      <span className="skeleton" style={{ width: 70, marginLeft: 'auto' }} />
                    </td>
                    <td className="num">
                      <span className="skeleton" style={{ width: 70, marginLeft: 'auto' }} />
                    </td>
                    <td className="num">
                      <span className="skeleton" style={{ width: 50, marginLeft: 'auto' }} />
                    </td>
                  </tr>
                ))}
              </ProfitTable>
            ) : details.length === 0 ? (
              <div className="state">
                <div className="state-emoji">📈</div>
                <div className="state-title">No sales in this period</div>
                <p className="state-msg">
                  Item-level profit will appear once there are sales in range.
                </p>
              </div>
            ) : (
              <ProfitTable>
                {details.map((d) => (
                  <tr key={d.itemId}>
                    <td>
                      <div className="item-name">{d.itemName}</div>
                      <div className="item-sub">{d.categoryName}</div>
                    </td>
                    <td className="num tnum">{d.quantitySold}</td>
                    <td className="num tnum">{peso.format(d.revenue)}</td>
                    <td className="num tnum cost">{peso.format(d.cost)}</td>
                    <td
                      className={`num tnum ${d.profit < 0 ? 'text-red' : 'price'}`}
                      style={{ fontWeight: 600 }}
                    >
                      {peso.format(d.profit)}
                    </td>
                    <td className="num tnum">{d.marginPercent}%</td>
                  </tr>
                ))}
              </ProfitTable>
            )}
          </div>

          {!loading && (
            <Pagination
              page={page}
              pageSize={pageSize}
              totalCount={totalCount}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </>
  );
};

const ProfitTable = ({ children }: { children: React.ReactNode }) => (
  <table className="ledger">
    <thead>
      <tr>
        <th>Item</th>
        <th className="num">Qty sold</th>
        <th className="num">Revenue</th>
        <th className="num">COGS</th>
        <th className="num">Profit</th>
        <th className="num">Margin</th>
      </tr>
    </thead>
    <tbody>{children}</tbody>
  </table>
);
