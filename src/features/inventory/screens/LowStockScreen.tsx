import { useState } from 'react';
import { useLowStock } from '../hooks/useLowStock';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { InventoryTabs } from '../components/InventoryTabs';
import { Pagination } from '../../../components/Pagination';

const SKELETON_ROWS = Array.from({ length: 4 });

export const LowStockScreen = () => {
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput.trim());
  const { items, loading, error, refetch, page, setPage, pageSize, totalCount, totalPages } =
    useLowStock(search || undefined);

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Inventory · Alerts</p>
          <h1 className="page-title">Low stock</h1>
          <p className="page-lead">
            {loading
              ? 'Checking stock…'
              : error
                ? 'Could not load low stock items.'
                : totalCount === 0
                  ? search
                    ? 'No low-stock items match your search.'
                    : 'Everything is above its threshold.'
                  : `${totalCount} item${totalCount === 1 ? '' : 's'} need restocking`}
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
          <LowStockTable>
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
                  <span className="skeleton" style={{ width: 40, marginLeft: 'auto' }} />
                </td>
                <td className="num">
                  <span className="skeleton" style={{ width: 60, marginLeft: 'auto' }} />
                </td>
              </tr>
            ))}
          </LowStockTable>
        ) : items.length === 0 ? (
          search !== '' ? (
            <div className="state">
              <div className="state-emoji">🔍</div>
              <div className="state-title">No matches</div>
              <p className="state-msg">
                No low-stock items match that name, code or barcode.
              </p>
              <button className="btn btn-ghost" onClick={() => setSearchInput('')}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="state">
              <div className="state-emoji">✅</div>
              <div className="state-title">All good</div>
              <p className="state-msg">
                No items are below their low-stock threshold right now.
              </p>
            </div>
          )
        ) : (
          <LowStockTable>
            {items.map((i) => (
              <tr key={i.itemId}>
                <td>
                  <div className="item-name">{i.itemName}</div>
                </td>
                <td className="item-sub-cat">
                  <span className="cat-pill">{i.categoryName}</span>
                </td>
                <td className="num">
                  <span className="stock-num tnum">{i.stock}</span>
                </td>
                <td className="num tnum cost">{i.lowStockThreshold}</td>
                <td className="num">
                  <span className="badge badge-low">−{i.deficit}</span>
                </td>
              </tr>
            ))}
          </LowStockTable>
        )}
      </div>

      {!loading && !error && (
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

const LowStockTable = ({ children }: { children: React.ReactNode }) => (
  <table className="ledger">
    <thead>
      <tr>
        <th>Item</th>
        <th className="item-sub-cat">Category</th>
        <th className="num">On hand</th>
        <th className="num">Threshold</th>
        <th className="num">Short by</th>
      </tr>
    </thead>
    <tbody>{children}</tbody>
  </table>
);
