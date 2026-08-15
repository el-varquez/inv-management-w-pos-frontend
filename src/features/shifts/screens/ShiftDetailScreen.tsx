import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useShiftRead } from '../hooks/useShiftRead';
import { CorrectCountModal } from '../components/CorrectCountModal';
import { useIsAdmin } from '../../../store/authStore';
import { peso, formatDateTime } from '../../../lib/format';

const varianceClass = (variance: number) => {
  if (variance < 0) return 'text-red';
  if (variance > 0) return 'text-gold';
  return 'text-muted';
};

const ReadRow = ({
  label,
  value,
  valueClass,
  hint,
}: {
  label: string;
  value: string;
  valueClass?: string;
  hint?: string | null;
}) => (
  <div className="read-row">
    <div className="read-label">
      {label}
      {hint && <p className="field-hint read-hint">{hint}</p>}
    </div>
    <div className={`read-value tnum${valueClass ? ` ${valueClass}` : ''}`}>
      {value}
    </div>
  </div>
);

export const ShiftDetailScreen = () => {
  const { id } = useParams();
  const { read, loading, error, reload } = useShiftRead(id);
  const isAdmin = useIsAdmin();
  const [correcting, setCorrecting] = useState(false);

  const correctionHint = (
    original: number | null,
    reason: string | null
  ): string | null =>
    original === null
      ? null
      : `corrected · was ${peso.format(original)}${reason ? ` — "${reason}"` : ''}`;

  const activeMovements = read
    ? read.movements.filter((m) => !m.isVoided)
    : [];

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">
            <Link to="/shifts">Shifts</Link>
          </p>
          <h1 className="page-title">
            {read ? `Shift #${read.number}` : 'Shift'}
          </h1>
          <p className="page-lead">
            {loading
              ? 'Loading the shift…'
              : error
                ? 'Could not load the shift.'
                : read
                  ? read.isClosed
                    ? `Z READ #${read.number}`
                    : 'X READ (live)'
                  : ''}
          </p>
        </div>
        {read && (
          <div className="page-actions">
            <span className={`badge ${read.isClosed ? 'badge-muted' : 'badge-ok'}`}>
              {read.isClosed ? 'Closed' : 'Open'}
            </span>
            {read.closedLate && <span className="badge badge-late">Late</span>}
            {read.isClosed && isAdmin && (
              <button
                className="btn btn-ghost"
                onClick={() => setCorrecting(true)}
              >
                Correct count
              </button>
            )}
          </div>
        )}
      </div>

      {error ? (
        <div className="card">
          <div className="state state-error">
            <div className="state-emoji">⚠️</div>
            <div className="state-title">Something went wrong</div>
            <p className="state-msg">{error}</p>
          </div>
        </div>
      ) : !read ? (
        <div className="card">
          <div className="state">
            <div className="state-emoji">🧾</div>
            <div className="state-title">Loading…</div>
          </div>
        </div>
      ) : (
        <>
          <div className="stat-row">
            <div className="card stat-card">
              <div className="stat-label">Net sales</div>
              <div className="stat-value tnum">{peso.format(read.netSales)}</div>
              <div className="stat-sub">
                {read.transactionCount} transaction
                {read.transactionCount === 1 ? '' : 's'}
              </div>
            </div>
            <div className="card stat-card">
              <div className="stat-label">Expected cash</div>
              <div className="stat-value tnum">
                {peso.format(read.expectedCash)}
              </div>
              <div className="stat-sub">Starting cash + cash sales + movements</div>
            </div>
            <div className="card stat-card">
              <div className="stat-label">Counted cash</div>
              <div className="stat-value tnum">
                {read.countedCash === null ? '—' : peso.format(read.countedCash)}
              </div>
              <div className="stat-sub">
                {read.isClosed ? 'Counted at close' : 'Counted at Z read'}
              </div>
            </div>
            <div className="card stat-card">
              <div className="stat-label">Variance</div>
              <div
                className={`stat-value tnum${
                  read.cashVariance === null
                    ? ''
                    : ` ${varianceClass(read.cashVariance)}`
                }`}
              >
                {read.cashVariance === null
                  ? '—'
                  : peso.format(read.cashVariance)}
              </div>
              <div className="stat-sub">
                {read.cashVariance === null
                  ? 'Available after close'
                  : read.cashVariance < 0
                    ? 'Short'
                    : read.cashVariance > 0
                      ? 'Over'
                      : 'Balanced'}
              </div>
            </div>
          </div>

          <div className="card card-section">
            <div className="card-head">
              <div>
                <div className="card-title">The read</div>
                <p className="card-sub">
                  Opened {formatDateTime(read.openedAt)}
                  {read.closedAt ? ` · closed ${formatDateTime(read.closedAt)}` : ''}
                </p>
              </div>
            </div>

            <ReadRow
              label="Cash sales"
              value={peso.format(read.cashSales)}
            />
            <ReadRow
              label="GCash sales"
              value={peso.format(read.gcashSales)}
            />
            <ReadRow label="Maya sales" value={peso.format(read.mayaSales)} />
            <ReadRow
              label="Starting cash"
              value={peso.format(read.startingCash)}
              hint={correctionHint(
                read.startingCashOriginal,
                read.startingCashCorrectionReason
              )}
            />
            <ReadRow
              label="Drawer movements"
              value={peso.format(read.drawerMovementsNet)}
            />
            <ReadRow
              label="Expected cash"
              value={peso.format(read.expectedCash)}
            />
            {read.isClosed && (
              <>
                <ReadRow
                  label="Counted cash"
                  value={
                    read.countedCash === null
                      ? '—'
                      : peso.format(read.countedCash)
                  }
                  hint={correctionHint(
                    read.countedCashOriginal,
                    read.correctionReason
                  )}
                />
                <ReadRow
                  label="Variance"
                  value={
                    read.cashVariance === null
                      ? '—'
                      : peso.format(read.cashVariance)
                  }
                  valueClass={
                    read.cashVariance === null
                      ? undefined
                      : varianceClass(read.cashVariance)
                  }
                />
              </>
            )}
          </div>

          {read.expectedEWalletBalance !== null && (
            <div className="card card-section">
              <div className="card-head">
                <div>
                  <div className="card-title">E-wallet</div>
                  <p className="card-sub">
                    The store's float — a second drawer, never sales.
                  </p>
                </div>
              </div>

              <ReadRow
                label="Starting balance"
                value={
                  read.startingEWalletBalance === null
                    ? '—'
                    : peso.format(read.startingEWalletBalance)
                }
              />
              <ReadRow
                label="Expected balance"
                value={peso.format(read.expectedEWalletBalance)}
              />
              <ReadRow
                label="Counted balance"
                value={
                  read.countedEWalletBalance === null
                    ? '—'
                    : peso.format(read.countedEWalletBalance)
                }
              />
              <ReadRow
                label="Variance"
                value={
                  read.eWalletVariance === null
                    ? '—'
                    : peso.format(read.eWalletVariance)
                }
                valueClass={
                  read.eWalletVariance === null
                    ? undefined
                    : varianceClass(read.eWalletVariance)
                }
              />
            </div>
          )}

          <div className="card table-wrap">
            {read.movements.length === 0 ? (
              <div className="state">
                <div className="state-emoji">💸</div>
                <div className="state-title">No drawer movements</div>
                <p className="state-msg">
                  Payouts and pay-ins recorded during the shift appear here.
                </p>
              </div>
            ) : (
              <table className="ledger">
                <thead>
                  <tr>
                    <th>Note</th>
                    <th>Time</th>
                    <th className="num">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {read.movements.map((m) => (
                    <tr key={m.id} className={m.isVoided ? 'row-voided' : undefined}>
                      <td>
                        <div className="item-name">{m.note}</div>
                        {m.isVoided && <div className="item-sub">Voided</div>}
                      </td>
                      <td className="item-sub">{formatDateTime(m.createdAt)}</td>
                      <td className="num tnum">{peso.format(m.amount)}</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td>Net movements</td>
                    <td />
                    <td className="num tnum">
                      {peso.format(
                        activeMovements.reduce((sum, m) => sum + m.amount, 0)
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {correcting && read && (
        <CorrectCountModal
          read={read}
          onClose={() => setCorrecting(false)}
          onDone={() => {
            setCorrecting(false);
            reload();
          }}
        />
      )}
    </>
  );
};
