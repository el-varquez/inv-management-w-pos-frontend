import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InventoryTabs } from '../components/InventoryTabs';
import { Pagination } from '../../../components/Pagination';
import { useInventoryCount } from '../hooks/useInventoryCount';
import { useInventoryCounts } from '../hooks/useInventoryCounts';
import { usePagedQuery } from '../../../hooks/usePagedQuery';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { inventoryService } from '../services/inventoryService';
import { signed } from '../../../lib/format';
import type { InventoryCount, InventoryCountLine, Paged } from '../../../types';

type Mode = 'landing' | 'counting' | 'done';

/** Blank input ↔ uncounted (null). */
const toNumber = (raw: string | undefined): number | null =>
  raw === undefined || raw === '' ? null : Number(raw);

export const InventoryCountScreen = () => {
  const { start, load, saveProgress, complete, loading, saving, error } =
    useInventoryCount();

  const [mode, setMode] = useState<Mode>('landing');
  const [statusFilter, setStatusFilter] = useState<'Draft' | 'Completed'>('Draft');
  const counts = useInventoryCounts(statusFilter);

  const [count, setCount] = useState<InventoryCount | null>(null);
  const [notes, setNotes] = useState('');
  /** Editable values keyed by itemId, as typed. */
  const [actuals, setActuals] = useState<Record<string, string>>({});
  /** The last quantity the server is known to hold per itemId (null = uncounted). */
  const [baseline, setBaseline] = useState<Record<string, number | null>>({});
  const [readOnly, setReadOnly] = useState(false);

  // Lines are editable, so they are never served from the page cache.
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput.trim());
  /** The term the lines are filtered by. It only advances once this page's edits are saved. */
  const [search, setSearch] = useState('');
  /** `search` mirrored for async code, the latest term the user wants, a re-entrancy guard, and the freshest autosave. */
  const appliedSearchRef = useRef('');
  const wantedSearchRef = useRef('');
  const applyingSearchRef = useRef(false);
  const syncDirtyRef = useRef<() => Promise<boolean>>(() => Promise.resolve(true));

  const countId = count?.id ?? '';
  const lines = usePagedQuery<Paged<InventoryCountLine>>(
    (p) =>
      countId
        ? inventoryService.getCountLines(countId, search ? { ...p, search } : p)
        : Promise.resolve({ items: [], page: 1, pageSize: p.pageSize, totalCount: 0, totalPages: 1 }),
    { key: `${countId}|${search}`, cache: false, fallbackError: 'Failed to load count lines.' }
  );

  // Seed the editable values and the server baseline from every loaded page.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const pageLines = lines.data?.items;
    if (!pageLines || pageLines.length === 0) return;
    setActuals((prev) => {
      const next = { ...prev };
      for (const l of pageLines) next[l.itemId] = l.actualQty === null ? '' : String(l.actualQty);
      return next;
    });
    setBaseline((prev) => {
      const next = { ...prev };
      for (const l of pageLines) next[l.itemId] = l.actualQty;
      return next;
    });
  }, [lines.data]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const openCount = async (id: string, viewOnly: boolean) => {
    const loaded = await load(id);
    if (!loaded) return;
    setActuals({});
    setBaseline({});
    setSearchInput('');
    setSearch('');
    appliedSearchRef.current = '';
    wantedSearchRef.current = '';
    setCount(loaded);
    setNotes(loaded.notes ?? '');
    setReadOnly(viewOnly);
    setMode('counting');
  };

  const startNew = async () => {
    const id = await start(notes.trim() || undefined);
    if (id) await openCount(id, false);
  };

  const pageLines = useMemo(() => lines.data?.items ?? [], [lines.data]);

  const rows = useMemo(
    () =>
      pageLines.map((l) => {
        const counted = toNumber(actuals[l.itemId]);
        return {
          ...l,
          counted,
          variance: counted === null ? null : counted - l.expectedQty,
        };
      }),
    [pageLines, actuals]
  );

  const savedQty = useCallback(
    (l: InventoryCountLine) => (l.itemId in baseline ? baseline[l.itemId] : l.actualQty),
    [baseline]
  );

  /** This page's lines whose typed value differs from what the server holds. */
  const dirtyLines = useMemo(
    () =>
      rows
        .filter((r) => r.counted !== savedQty(r))
        .map((r) => ({ itemId: r.itemId, actualQty: r.counted })),
    [rows, savedQty]
  );

  // Footer totals: the header's saved stats, with this page's saved values swapped for the typed ones.
  const savedCountedOnPage = rows.filter((r) => savedQty(r) !== null).length;
  const savedVarianceOnPage = rows.filter((r) => {
    const q = savedQty(r);
    return q !== null && q !== r.expectedQty;
  }).length;
  const localCountedOnPage = rows.filter((r) => r.counted !== null).length;
  const localVarianceOnPage = rows.filter((r) => r.variance !== null && r.variance !== 0).length;
  const countedCount = (count?.countedCount ?? 0) - savedCountedOnPage + localCountedOnPage;
  const varianceCount = (count?.varianceCount ?? 0) - savedVarianceOnPage + localVarianceOnPage;

  /** Autosave this page's edits. Resolves false when the save failed, so the caller must stay put. */
  const syncDirty = async (): Promise<boolean> => {
    if (!count) return false;
    if (dirtyLines.length === 0) return true;
    const ok = await saveProgress(count.id, dirtyLines);
    if (!ok) return false;
    setBaseline((prev) => {
      const next = { ...prev };
      for (const d of dirtyLines) next[d.itemId] = d.actualQty;
      return next;
    });
    const refreshed = await load(count.id);
    if (refreshed) setCount(refreshed);
    return true;
  };

  const changePage = async (p: number) => {
    if (await syncDirty()) lines.setPage(p);
  };

  /**
   * Like a page change: a new term applies only after this page's dirty lines are saved.
   * The field stays enabled while saving; a term typed meanwhile is picked up by the
   * running loop, so the last term the user wanted always wins. On a failed save the
   * field reverts to the term in effect and the error banner shows.
   */
  const applyWantedSearch = async () => {
    if (applyingSearchRef.current) return;
    applyingSearchRef.current = true;
    try {
      while (wantedSearchRef.current !== appliedSearchRef.current) {
        const next = wantedSearchRef.current;
        if (await syncDirtyRef.current()) {
          appliedSearchRef.current = next;
          setSearch(next);
        } else {
          wantedSearchRef.current = appliedSearchRef.current;
          setSearchInput(appliedSearchRef.current);
        }
      }
    } finally {
      applyingSearchRef.current = false;
    }
  };

  useEffect(() => {
    syncDirtyRef.current = syncDirty;
  });

  useEffect(() => {
    wantedSearchRef.current = debouncedSearch;
    void applyWantedSearch();
  }, [debouncedSearch]);

  const handleSave = () => syncDirty();

  const handleSubmit = async () => {
    if (!count) return;
    const ok = await complete(count.id, dirtyLines);
    if (ok) setMode('done');
  };

  const backToLanding = () => {
    setCount(null);
    setActuals({});
    setBaseline({});
    setSearchInput('');
    setSearch('');
    appliedSearchRef.current = '';
    wantedSearchRef.current = '';
    setNotes('');
    setMode('landing');
    counts.refetch();
  };

  if (mode === 'done') {
    return (
      <>
        <div className="page-head">
          <div>
            <p className="eyebrow">Inventory · Stocktake</p>
            <h1 className="page-title">Stocktake</h1>
          </div>
        </div>
        <InventoryTabs />
        <div className="card">
          <div className="state">
            <div className="state-emoji">✅</div>
            <div className="state-title">Count submitted</div>
            <p className="state-msg">
              Stock levels were adjusted to your counted quantities. Variances are
              recorded in the inventory history.
            </p>
            <button className="btn btn-primary" onClick={backToLanding}>
              Back to counts
            </button>
          </div>
        </div>
      </>
    );
  }

  if (mode === 'counting' && count) {
    return (
      <>
        <div className="page-head">
          <div>
            <p className="eyebrow">Inventory · Stocktake</p>
            <h1 className="page-title">{count.reference}</h1>
            <p className="page-lead">
              {readOnly
                ? 'Completed count (view only).'
                : 'Enter counted quantities. Blank rows stay uncounted and are left unchanged on submit.'}
            </p>
          </div>
          <div className="page-actions">
            <button className="btn btn-ghost" onClick={backToLanding}>
              Back
            </button>
          </div>
        </div>
        <InventoryTabs />
        {(error || lines.error) && (
          <div className="login-error" role="alert">
            <span aria-hidden="true">⚠</span>
            {error ?? lines.error}
          </div>
        )}
        <div className="filter-bar card">
          <div className="field">
            <label htmlFor="line-search">Search</label>
            <input
              id="line-search"
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
          {lines.loading && rows.length === 0 ? (
            <div className="state">
              <span className="spinner spinner-dark" aria-hidden="true" />
            </div>
          ) : rows.length === 0 && search !== '' ? (
            <div className="state">
              <div className="state-emoji">🔍</div>
              <div className="state-title">No lines match your search</div>
              <p className="state-msg">Try a different name, item code or barcode.</p>
              <button className="btn btn-ghost" onClick={() => setSearchInput('')}>
                Clear filters
              </button>
            </div>
          ) : (
            <table className="ledger">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="item-sub-cat">Category</th>
                  <th className="num">Expected</th>
                  <th className="num">Counted</th>
                  <th className="num">Variance</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.itemId}>
                    <td>
                      <div className="item-name">{r.itemName}</div>
                    </td>
                    <td className="item-sub-cat">
                      <span className="cat-pill">{r.categoryName}</span>
                    </td>
                    <td className="num tnum cost">{r.expectedQty}</td>
                    <td className="num">
                      {readOnly ? (
                        <span className="tnum">{r.counted ?? '—'}</span>
                      ) : (
                        <input
                          className="input input-inline tnum"
                          type="number"
                          min="0"
                          step="1"
                          disabled={saving || lines.loading}
                          placeholder={String(r.expectedQty)}
                          value={actuals[r.itemId] ?? ''}
                          onChange={(e) =>
                            setActuals((a) => ({ ...a, [r.itemId]: e.target.value }))
                          }
                        />
                      )}
                    </td>
                    <td className="num">
                      {r.variance === null || r.variance === 0 ? (
                        <span className="tnum text-muted">
                          {r.variance === null ? '—' : '0'}
                        </span>
                      ) : (
                        <span
                          className={`tnum ${r.variance < 0 ? 'text-red' : 'text-green'}`}
                        >
                          {signed(r.variance)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!lines.loading && !lines.error && (
          <Pagination
            page={lines.page}
            pageSize={lines.pageSize}
            totalCount={lines.totalCount}
            totalPages={lines.totalPages}
            onPageChange={changePage}
          />
        )}
        {!readOnly && (
          <div className="card count-footer">
            <div className="count-summary">
              <span>
                {countedCount} counted · {varianceCount} with variance
              </span>
              <div className="modal-actions">
                <button
                  className="btn btn-ghost"
                  onClick={handleSave}
                  disabled={saving || lines.loading}
                >
                  {saving ? 'Saving…' : 'Save draft'}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={saving || lines.loading || countedCount === 0}
                >
                  Submit count
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Inventory · Stocktake</p>
          <h1 className="page-title">Stocktake</h1>
          <p className="page-lead">Resume an open count or start a new one.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={startNew} disabled={saving}>
            {saving ? 'Starting…' : 'Start new count'}
          </button>
        </div>
      </div>
      <InventoryTabs />
      {(counts.error || error) && (
        <div className="login-error" role="alert">
          <span aria-hidden="true">⚠</span>
          {counts.error ?? error}
        </div>
      )}
      <div className="segmented" style={{ marginBottom: 12 }}>
        <button
          className={statusFilter === 'Draft' ? 'seg is-active' : 'seg'}
          onClick={() => setStatusFilter('Draft')}
        >
          In progress
        </button>
        <button
          className={statusFilter === 'Completed' ? 'seg is-active' : 'seg'}
          onClick={() => setStatusFilter('Completed')}
        >
          Completed
        </button>
      </div>
      <div className="card table-wrap">
        {loading || counts.loading ? (
          <div className="state">
            <span className="spinner spinner-dark" aria-hidden="true" />
          </div>
        ) : counts.summaries.length === 0 ? (
          <div className="state">
            <div className="state-emoji">📋</div>
            <div className="state-title">
              {statusFilter === 'Draft' ? 'No counts in progress' : 'No completed counts'}
            </div>
            <p className="state-msg">
              {statusFilter === 'Draft'
                ? 'Start a new count to begin a stocktake.'
                : 'Completed counts will appear here.'}
            </p>
          </div>
        ) : (
          <table className="ledger">
            <thead>
              <tr>
                <th>Reference</th>
                <th className="num">Items</th>
                <th>Started</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {counts.summaries.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="item-name">{s.reference}</div>
                  </td>
                  <td className="num tnum">{s.lineCount}</td>
                  <td>{new Date(s.createdAt).toLocaleString()}</td>
                  <td className="num">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => openCount(s.id, s.status === 'Completed')}
                    >
                      {s.status === 'Completed' ? 'View' : 'Resume'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Pagination
        page={counts.page}
        pageSize={counts.pageSize}
        totalPages={counts.totalPages}
        totalCount={counts.totalCount}
        onPageChange={counts.setPage}
      />
    </>
  );
};
