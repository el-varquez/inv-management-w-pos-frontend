import { useMemo, useState } from 'react';
import { InventoryTabs } from '../components/InventoryTabs';
import { Pagination } from '../../../components/Pagination';
import { useInventoryCount } from '../hooks/useInventoryCount';
import { useInventoryCounts } from '../hooks/useInventoryCounts';
import { signed } from '../../../lib/format';
import type { InventoryCount } from '../../../types';

type Mode = 'landing' | 'counting' | 'done';

export const InventoryCountScreen = () => {
  const { start, load, saveProgress, complete, loading, saving, error } =
    useInventoryCount();

  const [mode, setMode] = useState<Mode>('landing');
  const [statusFilter, setStatusFilter] = useState<'Draft' | 'Completed'>('Draft');
  const counts = useInventoryCounts(statusFilter);

  const [count, setCount] = useState<InventoryCount | null>(null);
  const [notes, setNotes] = useState('');
  const [actuals, setActuals] = useState<Record<string, string>>({});
  const [readOnly, setReadOnly] = useState(false);

  const openCount = async (id: string, viewOnly: boolean) => {
    const loaded = await load(id);
    if (!loaded) return;
    setCount(loaded);
    setNotes(loaded.notes ?? '');
    setActuals(
      Object.fromEntries(
        loaded.lines
          .filter((l) => l.actualQty !== null)
          .map((l) => [l.itemId, String(l.actualQty)])
      )
    );
    setReadOnly(viewOnly);
    setMode('counting');
  };

  const startNew = async () => {
    const id = await start(notes.trim() || undefined);
    if (id) await openCount(id, false);
  };

  const payload = useMemo(
    () =>
      (count?.lines ?? []).map((l) => {
        const raw = actuals[l.itemId];
        return {
          itemId: l.itemId,
          actualQty: raw === undefined || raw === '' ? null : Number(raw),
        };
      }),
    [count, actuals]
  );

  const rows = useMemo(
    () =>
      (count?.lines ?? []).map((l) => {
        const raw = actuals[l.itemId];
        const counted = raw === undefined || raw === '' ? null : Number(raw);
        return {
          ...l,
          counted,
          variance: counted === null ? null : counted - l.expectedQty,
        };
      }),
    [count, actuals]
  );

  const countedCount = rows.filter((r) => r.counted !== null).length;
  const varianceCount = rows.filter((r) => r.variance !== null && r.variance !== 0).length;

  const handleSave = async () => {
    if (!count) return;
    await saveProgress(count.id, payload);
  };

  const handleSubmit = async () => {
    if (!count) return;
    const ok = await complete(count.id, payload);
    if (ok) setMode('done');
  };

  const backToLanding = () => {
    setCount(null);
    setActuals({});
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
        {error && (
          <div className="login-error" role="alert">
            <span aria-hidden="true">⚠</span>
            {error}
          </div>
        )}
        <div className="card table-wrap">
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
        </div>
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
                  disabled={saving}
                >
                  {saving ? 'Saving…' : 'Save draft'}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={saving || countedCount === 0}
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
