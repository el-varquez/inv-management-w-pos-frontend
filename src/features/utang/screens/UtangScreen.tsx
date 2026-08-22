import { useEffect, useState } from 'react';
import { useSukis } from '../hooks/useSukis';
import { useSukiLedger } from '../hooks/useSukiLedger';
import { useUtangSummary } from '../hooks/useUtangSummary';
import { useDateRange } from '../../../hooks/useDateRange';
import { DateRangeControls } from '../../../components/DateRangeControls';
import { Pagination } from '../../../components/Pagination';
import { peso, formatDate } from '../../../lib/format';
import type { Suki, UtangLedgerEntry } from '../../../types';

const SKELETON_ROWS = Array.from({ length: 5 });

const balanceStyle = (balance: number) =>
  balance === 0
    ? { color: 'var(--confirm)' }
    : { color: 'var(--gold)' };

interface LedgerDisplayRow {
  entry: UtangLedgerEntry;
  label: string;
  edited: string | null;
  running: string;
}

const buildLedgerRows = (entries: UtangLedgerEntry[]): LedgerDisplayRow[] => {
  let running = 0;
  return entries.map((entry) => {
    if (!entry.isVoided) {
      running += entry.type === 'Charge' ? entry.amount : -entry.amount;
    }
    const label =
      entry.type === 'Charge'
        ? `Charge · ${entry.receiptNumber ?? ''}`
        : entry.transactionId
          ? `${entry.note ?? 'Down payment'} · ${entry.receiptNumber ?? ''}`
          : (entry.note ?? 'Payment received');
    return {
      entry,
      label,
      edited:
        entry.editedFrom !== null
          ? `edited · was ${peso.format(entry.editedFrom)}`
          : null,
      running: entry.isVoided ? '—' : peso.format(running),
    };
  });
};

const LedgerView = ({ suki, onBack }: { suki: Suki; onBack: () => void }) => {
  const { ledger, loading, error, refetch } = useSukiLedger(suki.id);
  const amountPaid =
    ledger?.entries
      .filter((e) => e.type === 'Payment' && !e.isVoided)
      .reduce((sum, e) => sum + e.amount, 0) ?? 0;

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Utang · Ledger</p>
          <h1 className="page-title">{suki.name}</h1>
          <p className="page-lead">
            {suki.phone ?? 'No phone on file'}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={onBack}>
            ← All sukis
          </button>
        </div>
      </div>

      {ledger && (
        <div className="stat-row" style={{ marginBottom: 18 }}>
          <div className="card stat-card">
            <div className="stat-label">Balance</div>
            <div className="stat-value" style={balanceStyle(ledger.balance)}>{peso.format(ledger.balance)}</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label">Amount paid</div>
            <div className="stat-value">{peso.format(amountPaid)}</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label">Markup earned</div>
            <div className="stat-value">{peso.format(ledger.markupEarned)}</div>
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
        ) : loading || !ledger ? (
          <div className="state">
            <div className="state-title">Loading ledger…</div>
          </div>
        ) : ledger.entries.length === 0 ? (
          <div className="state">
            <div className="state-emoji">📒</div>
            <div className="state-title">No entries yet</div>
            <p className="state-msg">
              Charges and collections from the register will appear here.
            </p>
          </div>
        ) : (
          <table className="ledger">
            <thead>
              <tr>
                <th>Date</th>
                <th>Entry</th>
                <th className="num">Charge</th>
                <th className="num">Payment</th>
                <th className="num">Balance</th>
              </tr>
            </thead>
            <tbody>
              {buildLedgerRows(ledger.entries).map((row) => (
                <tr
                  key={row.entry.id}
                  style={row.entry.isVoided ? { opacity: 0.6 } : undefined}
                >
                  <td
                    style={
                      row.entry.isVoided
                        ? { textDecoration: 'line-through' }
                        : undefined
                    }
                  >
                    {formatDate(row.entry.createdAt)}
                  </td>
                  <td>
                    <span
                      style={
                        row.entry.isVoided
                          ? { textDecoration: 'line-through', fontWeight: 600 }
                          : { fontWeight: 600 }
                      }
                    >
                      {row.label}
                    </span>
                    {row.entry.isVoided && (
                      <span
                        className="pill"
                        style={{
                          marginLeft: 8,
                          color: 'var(--red)',
                          background: 'var(--red-soft)',
                        }}
                      >
                        VOIDED
                      </span>
                    )}
                    {row.edited && (
                      <div className="item-sub-cat">{row.edited}</div>
                    )}
                  </td>
                  <td
                    className="num"
                    style={
                      row.entry.isVoided
                        ? { textDecoration: 'line-through' }
                        : undefined
                    }
                  >
                    {row.entry.type === 'Charge'
                      ? peso.format(row.entry.amount)
                      : ''}
                  </td>
                  <td
                    className="num"
                    style={{
                      color: 'var(--confirm)',
                      textDecoration: row.entry.isVoided
                        ? 'line-through'
                        : undefined,
                    }}
                  >
                    {row.entry.type === 'Payment'
                      ? peso.format(row.entry.amount)
                      : ''}
                  </td>
                  <td className="num">{row.running}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export const UtangScreen = () => {
  const [searchInput, setSearchInput] = useState('');
  const [term, setTerm] = useState('');
  const [selected, setSelected] = useState<Suki | null>(null);
  const {
    sukis,
    loading,
    error,
    refetch,
    page,
    setPage,
    pageSize,
    totalCount,
    totalPages,
  } = useSukis(term);
  const {
    preset,
    setPreset,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    range,
  } = useDateRange('month');
  const { summary, refetch: refetchSummary } = useUtangSummary(range);

  useEffect(() => {
    const handle = setTimeout(() => setTerm(searchInput), 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  if (selected) {
    return <LedgerView suki={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Utang · Suki</p>
          <h1 className="page-title">Utang</h1>
          <p className="page-lead">
            {loading
              ? 'Loading sukis…'
              : error
                ? 'Could not load sukis.'
                : `${totalCount} suki${totalCount === 1 ? '' : 's'} — read-only; charges and collections happen at the register`}
          </p>
        </div>
        <div className="page-actions">
          <input
            className="input"
            placeholder="Search by name or phone…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button
            className="btn btn-ghost"
            onClick={() => {
              refetch();
              refetchSummary();
            }}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      <DateRangeControls
        preset={preset}
        setPreset={setPreset}
        customFrom={customFrom}
        setCustomFrom={setCustomFrom}
        customTo={customTo}
        setCustomTo={setCustomTo}
      />

      <div className="stat-row" style={{ marginBottom: 18 }}>
        <div className="card stat-card">
          <div className="stat-label">Total utang</div>
          <div className="stat-value tnum">
            {peso.format(summary?.totalCharged ?? 0)}
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Total amount paid</div>
          <div className="stat-value tnum">
            {peso.format(summary?.totalPaid ?? 0)}
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Top suki</div>
          <div className="stat-value">{summary?.topSukiName ?? '—'}</div>
          {summary?.topSukiName && (
            <div className="stat-sub">
              {peso.format(summary.topSukiCharged)} charged
            </div>
          )}
        </div>
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
          <table className="ledger">
            <thead>
              <tr>
                <th>Suki</th>
                <th>Phone</th>
                <th className="num">Balance</th>
              </tr>
            </thead>
            <tbody>
              {SKELETON_ROWS.map((_, i) => (
                <tr key={i}>
                  <td>
                    <span className="skeleton" style={{ width: '60%' }} />
                  </td>
                  <td>
                    <span className="skeleton" style={{ width: 110 }} />
                  </td>
                  <td className="num">
                    <span
                      className="skeleton"
                      style={{ width: 90, marginLeft: 'auto' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : sukis.length === 0 ? (
          <div className="state">
            <div className="state-emoji">📒</div>
            <div className="state-title">
              {term ? 'No sukis match your search' : 'No sukis yet'}
            </div>
            <p className="state-msg">
              {term
                ? 'Try a different name or phone number.'
                : 'Sukis are added at the register when the first utang is charged.'}
            </p>
          </div>
        ) : (
          <>
            <table className="ledger">
              <thead>
                <tr>
                  <th>Suki</th>
                  <th>Phone</th>
                  <th className="num">Balance</th>
                </tr>
              </thead>
              <tbody>
                {sukis.map((suki) => (
                  <tr key={suki.id} onClick={() => setSelected(suki)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600 }}>{suki.name}</td>
                    <td className="item-sub-cat">{suki.phone ?? '—'}</td>
                    <td className="num" style={balanceStyle(suki.balance)}>
                      {peso.format(suki.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </>
  );
};
