import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSukis } from '../hooks/useSukis';
import { useSukiLedger } from '../hooks/useSukiLedger';
import { useLedgerEntries } from '../hooks/useLedgerEntries';
import { useUtangSummary } from '../hooks/useUtangSummary';
import { useDateRange } from '../../../hooks/useDateRange';
import { useSettings } from '../../../hooks/useSettings';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { DateRangeControls } from '../../../components/DateRangeControls';
import { Pagination } from '../../../components/Pagination';
import { peso, formatDate } from '../../../lib/format';
import { SukiFormModal } from '../components/SukiFormModal';
import { CollectModal } from '../components/CollectModal';
import { DeleteSukiModal } from '../components/DeleteSukiModal';
import { VoidEntryModal } from '../components/VoidEntryModal';
import { EditPaymentModal } from '../components/EditPaymentModal';
import { useIsAdmin } from '../../../store/authStore';
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

// The running balance is computed by the API over the whole chronological ledger, so a page
// can start anywhere; voided entries carry none.
const buildLedgerRows = (entries: UtangLedgerEntry[]): LedgerDisplayRow[] =>
  entries.map((entry) => {
    const label =
      entry.type === 'Charge'
        ? `Charge · ${entry.invoiceNumber ?? ''}`
        : (entry.note ?? 'Payment received');
    return {
      entry,
      label,
      edited:
        entry.editedFrom !== null
          ? `edited · was ${peso.format(entry.editedFrom)}`
          : null,
      running:
        entry.runningBalance === null ? '—' : peso.format(entry.runningBalance),
    };
  });

const LedgerView = ({ suki, onBack }: { suki: Suki; onBack: () => void }) => {
  const { ledger, loading, error, refetch } = useSukiLedger(suki.id);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput.trim());
  const filtersActive = Boolean(from || to || searchInput);
  const clearFilters = () => {
    setFrom('');
    setTo('');
    setSearchInput('');
  };
  // Date inputs give local calendar days; send each whole day in local time, `to` inclusive.
  const entries = useLedgerEntries(suki.id, {
    from: from ? new Date(`${from}T00:00:00`).toISOString() : undefined,
    to: to ? new Date(`${to}T23:59:59.999`).toISOString() : undefined,
    search: search || undefined,
  });
  const refreshAll = () => {
    refetch();
    entries.refetch();
  };
  const [collecting, setCollecting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [voidingEntry, setVoidingEntry] = useState<UtangLedgerEntry | null>(null);
  const [editingPayment, setEditingPayment] = useState<UtangLedgerEntry | null>(
    null
  );
  const isAdmin = useIsAdmin();
  const current: Suki = ledger
    ? {
        id: ledger.id,
        name: ledger.name,
        phone: ledger.phone,
        balance: ledger.balance,
        debtSince: ledger.debtSince,
        lastPaidAt: ledger.lastPaidAt,
        daysSincePayment: ledger.daysSincePayment,
        paymentOverdue: ledger.paymentOverdue,
      }
    : suki;

  const amountPaid = ledger?.amountPaid ?? 0;

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Utang · Ledger</p>
          <h1 className="page-title">{current.name}</h1>
          <p className="page-lead">
            {current.phone ?? 'No phone on file'}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setCollecting(true)}>
            Collect
          </button>
          {isAdmin && (
            <>
              <button className="btn btn-ghost" onClick={() => setEditing(true)}>
                Edit
              </button>
              <button
                className="btn btn-danger"
                onClick={() => setDeleting(true)}
              >
                Delete
              </button>
            </>
          )}
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

      <div className="filter-bar card">
        <div className="field">
          <label htmlFor="ledger-from">From</label>
          <input
            id="ledger-from"
            className="input"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="ledger-to">To</label>
          <input
            id="ledger-to"
            className="input"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="ledger-search">Search</label>
          <input
            id="ledger-search"
            className="input"
            type="search"
            placeholder="Invoice no., note or amount"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        {filtersActive && (
          <button
            type="button"
            className="btn btn-quiet btn-sm filter-clear"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        )}
      </div>
      {from && !entries.loading && !entries.error && entries.data && (
        <p className="field-hint">
          Opening balance on {formatDate(`${from}T00:00:00`)}:{' '}
          {peso.format(entries.openingBalance)}
        </p>
      )}

      <div className="card table-wrap">
        {error || entries.error ? (
          <div className="state state-error">
            <div className="state-emoji">⚠️</div>
            <div className="state-title">Something went wrong</div>
            <p className="state-msg">{error ?? entries.error}</p>
            <button className="btn btn-ghost" onClick={refreshAll}>
              Try again
            </button>
          </div>
        ) : loading || !ledger || (entries.loading && entries.items.length === 0) ? (
          <div className="state">
            <div className="state-title">Loading ledger…</div>
          </div>
        ) : entries.totalCount === 0 ? (
          <div className="state">
            <div className="state-emoji">📒</div>
            <div className="state-title">
              {filtersActive ? 'No entries match' : 'No entries yet'}
            </div>
            <p className="state-msg">
              {filtersActive
                ? 'Try a different period or search term.'
                : 'Charges and collections from the register will appear here.'}
            </p>
          </div>
        ) : (
          <>
          <table className="ledger">
            <thead>
              <tr>
                <th>Date</th>
                <th>Entry</th>
                <th className="num">Charge</th>
                <th className="num">Payment</th>
                <th className="num">Balance</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {buildLedgerRows(entries.items).map((row) => (
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
                  <td className="right">
                    {isAdmin && !row.entry.isVoided && (
                      <>
                        {row.entry.type === 'Payment' && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            aria-label="Correct this payment"
                            onClick={() => setEditingPayment(row.entry)}
                          >
                            ✎
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          aria-label={
                            row.entry.type === 'Charge'
                              ? 'Void this charge'
                              : 'Void this payment'
                          }
                          onClick={() => setVoidingEntry(row.entry)}
                        >
                          ✕
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={entries.page}
            pageSize={entries.pageSize}
            totalCount={entries.totalCount}
            totalPages={entries.totalPages}
            onPageChange={entries.setPage}
          />
          </>
        )}
      </div>

      {deleting && (
        <DeleteSukiModal
          suki={current}
          hasEntries={entries.totalCount > 0 || filtersActive}
          onClose={() => setDeleting(false)}
          onDeleted={() => {
            setDeleting(false);
            onBack();
          }}
        />
      )}

      {voidingEntry && (
        <VoidEntryModal
          entry={voidingEntry}
          onClose={() => setVoidingEntry(null)}
          onSaved={() => {
            setVoidingEntry(null);
            refreshAll();
          }}
        />
      )}

      {editingPayment && (
        <EditPaymentModal
          entry={editingPayment}
          onClose={() => setEditingPayment(null)}
          onSaved={() => {
            setEditingPayment(null);
            refreshAll();
          }}
        />
      )}

      {editing && (
        <SukiFormModal
          suki={current}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            refreshAll();
          }}
        />
      )}

      {collecting && ledger && (
        <CollectModal
          suki={current}
          balance={ledger.balance}
          onClose={() => setCollecting(false)}
          onSaved={() => {
            setCollecting(false);
            refreshAll();
          }}
        />
      )}

    </>
  );
};

export const UtangScreen = () => {
  const { acceptUtang, loading: settingsLoading } = useSettings();
  const [searchInput, setSearchInput] = useState('');
  const [term, setTerm] = useState('');
  const [selected, setSelected] = useState<Suki | null>(null);
  const [addingSuki, setAddingSuki] = useState(false);
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

  if (settingsLoading) return null;

  if (!acceptUtang) {
    return (
      <>
        <div className="page-head">
          <div>
            <p className="eyebrow">Store</p>
            <h1 className="page-title">Utang</h1>
          </div>
        </div>
        <div className="card">
          <div className="state">
            <div className="state-emoji">📒</div>
            <div className="state-title">Utang is off</div>
            <p className="state-msg">
              Turn it on in <Link to="/settings">Settings</Link> to charge sukis
              and record collections.
            </p>
          </div>
        </div>
      </>
    );
  }

  if (selected) {
    return (
      <LedgerView
        suki={selected}
        onBack={() => {
          setSelected(null);
          refetch();
          refetchSummary();
        }}
      />
    );
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
                : `${totalCount} suki${totalCount === 1 ? '' : 's'}`}
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
        trailing={
          <button className="btn btn-primary" onClick={() => setAddingSuki(true)}>
            + New suki
          </button>
        }
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
                : 'Add your first suki to start a ledger.'}
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

      {addingSuki && (
        <SukiFormModal
          onClose={() => setAddingSuki(false)}
          onSaved={() => {
            setAddingSuki(false);
            refetch();
          }}
        />
      )}
    </>
  );
};
