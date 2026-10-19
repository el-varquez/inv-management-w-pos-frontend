import { useState } from 'react';
import { useInventoryValuation } from '../hooks/useInventoryValuation';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { InventoryTabs } from '../components/InventoryTabs';
import { Pagination } from '../../../components/Pagination';
import { peso, formatDateTime } from '../../../lib/format';

const SKELETON_ROWS = Array.from({ length: 5 });

export const InventoryValuationScreen = () => {
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput.trim());
  const {
    valuation,
    items,
    loading,
    error,
    refetch,
    page,
    setPage,
    pageSize,
    totalCount,
    totalPages,
  } = useInventoryValuation(search || undefined);

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Inventory · Report</p>
          <h1 className="page-title">Valuation</h1>
          <p className="page-lead">
            {loading
              ? 'Calculating…'
              : error
                ? 'Could not load valuation.'
                : valuation
                  ? `As of ${formatDateTime(valuation.generatedAt)}`
                  : ''}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={refetch} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      <InventoryTabs />

      <div className="filter-bar card">
        <div className="field">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            className="input"
            type="search"
            placeholder="Name, code or barcode"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        {searchInput !== '' && (
          <button
            type="button"
            className="btn btn-quiet btn-sm filter-clear"
            onClick={() => setSearchInput('')}
          >
            Clear filters
          </button>
        )}
      </div>

      {valuation && !loading && !error && (
        <div className="stat-row">
          <div className="card stat-card">
            <div className="stat-label">
              {search ? 'Stock value of matches' : 'Total stock value'}
            </div>
            <div className="stat-value tnum">
              {peso.format(valuation.totalValue)}
            </div>
            <div className="stat-sub">at cost price</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label">Items valued</div>
            <div className="stat-value tnum">{valuation.totalItems}</div>
            <div className="stat-sub">distinct products</div>
          </div>
        </div>
      )}

      <div className="card table-wrap">
        {error ? (
          <div className="state state-error">
            <div className="state-emoji">⚠️</div>
            <div className="state-title">Something went wrong</div>
            <p className="state-msg">{error}</p>
            <button className="btn btn-ghost" onClick={refetch}>
              Try again
            </button>
          </div>
        ) : loading ? (
          <ValuationTable>
            {SKELETON_ROWS.map((_, i) => (
              <tr key={i}>
                <td>
                  <span className="skeleton" style={{ width: '55%' }} />
                </td>
                <td className="item-sub-cat">
                  <span className="skeleton" style={{ width: 70 }} />
                </td>
                <td className="num">
                  <span className="skeleton" style={{ width: 40, marginLeft: 'auto' }} />
                </td>
                <td className="num">
                  <span className="skeleton" style={{ width: 70, marginLeft: 'auto' }} />
                </td>
                <td className="num">
                  <span className="skeleton" style={{ width: 90, marginLeft: 'auto' }} />
                </td>
              </tr>
            ))}
          </ValuationTable>
        ) : !valuation || items.length === 0 ? (
          search !== '' ? (
            <div className="state">
              <div className="state-emoji">🔍</div>
              <div className="state-title">No items match your search</div>
              <p className="state-msg">Try a different name, item code or barcode.</p>
              <button className="btn btn-ghost" onClick={() => setSearchInput('')}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="state">
              <div className="state-emoji">💰</div>
              <div className="state-title">Nothing to value</div>
              <p className="state-msg">Add items and stock to see valuation.</p>
            </div>
          )
        ) : (
          <ValuationTable>
            {items.map((i) => (
              <tr key={i.itemId}>
                <td>
                  <div className="item-name">{i.itemName}</div>
                </td>
                <td className="item-sub-cat">
                  <span className="cat-pill">{i.categoryName}</span>
                </td>
                <td className="num tnum">{i.stock}</td>
                <td className="num tnum cost">{peso.format(i.costPrice)}</td>
                <td className="num tnum price">{peso.format(i.stockValue)}</td>
              </tr>
            ))}
          </ValuationTable>
        )}
      </div>

      {valuation && !loading && !error && (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </>
  );
};

const ValuationTable = ({ children }: { children: React.ReactNode }) => (
  <table className="ledger">
    <thead>
      <tr>
        <th>Item</th>
        <th className="item-sub-cat">Category</th>
        <th className="num">Stock</th>
        <th className="num">Cost</th>
        <th className="num">Value</th>
      </tr>
    </thead>
    <tbody>{children}</tbody>
  </table>
);
