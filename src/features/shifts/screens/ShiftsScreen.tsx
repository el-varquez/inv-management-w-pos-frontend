import { Link } from 'react-router-dom';
import { useShifts } from '../hooks/useShifts';
import { Pagination } from '../../../components/Pagination';
import { peso, formatDateTime } from '../../../lib/format';

const SKELETON_ROWS = Array.from({ length: 5 });

const varianceClass = (variance: number) => {
  if (variance < 0) return 'text-red';
  if (variance > 0) return 'text-gold';
  return 'text-muted';
};

export const ShiftsScreen = () => {
  const {
    shifts,
    loading,
    error,
    refetch,
    page,
    setPage,
    pageSize,
    totalCount,
    totalPages,
  } = useShifts();

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Register</p>
          <h1 className="page-title">Shifts</h1>
          <p className="page-lead">
            {loading
              ? 'Loading shifts…'
              : error
                ? 'Could not load shifts.'
                : `${totalCount} shift${totalCount === 1 ? '' : 's'}`}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={refetch} disabled={loading}>
            Refresh
          </button>
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
          <ShiftsTable>
            {SKELETON_ROWS.map((_, i) => (
              <tr key={i}>
                <td>
                  <span className="skeleton" style={{ width: 40 }} />
                </td>
                <td>
                  <span className="skeleton" style={{ width: '70%' }} />
                </td>
                <td>
                  <span className="skeleton" style={{ width: '70%' }} />
                </td>
                <td className="num">
                  <span className="skeleton" style={{ width: 80, marginLeft: 'auto' }} />
                </td>
                <td className="num">
                  <span className="skeleton" style={{ width: 80, marginLeft: 'auto' }} />
                </td>
                <td className="num">
                  <span className="skeleton" style={{ width: 80, marginLeft: 'auto' }} />
                </td>
                <td className="num">
                  <span className="skeleton" style={{ width: 80, marginLeft: 'auto' }} />
                </td>
                <td className="num">
                  <span className="skeleton" style={{ width: 80, marginLeft: 'auto' }} />
                </td>
              </tr>
            ))}
          </ShiftsTable>
        ) : shifts.length === 0 ? (
          <div className="state">
            <div className="state-emoji">🧾</div>
            <div className="state-title">No shifts yet</div>
            <p className="state-msg">
              Shifts appear here once the register declares starting cash and
              starts selling.
            </p>
          </div>
        ) : (
          <ShiftsTable>
            {shifts.map((s) => (
              <tr key={s.id}>
                <td>
                  <Link to={`/shifts/${s.id}`} className="item-name">
                    #{s.number}
                  </Link>
                </td>
                <td className="item-sub">{formatDateTime(s.openedAt)}</td>
                <td className="item-sub">
                  {s.isClosed ? (
                    <span className="shift-closed-cell">
                      {s.closedAt ? formatDateTime(s.closedAt) : '—'}
                      {s.closedLate && <span className="badge badge-late">Late</span>}
                    </span>
                  ) : (
                    <span className="badge badge-ok">Open</span>
                  )}
                </td>
                <td className="num tnum">{peso.format(s.startingCash)}</td>
                <td className="num tnum">
                  {s.netSales === null ? '—' : peso.format(s.netSales)}
                </td>
                <td className="num tnum">
                  {s.expectedCash === null ? '—' : peso.format(s.expectedCash)}
                </td>
                <td className="num tnum">
                  {s.countedCash === null ? '—' : peso.format(s.countedCash)}
                </td>
                <td className="num tnum">
                  {s.cashVariance === null ? (
                    '—'
                  ) : (
                    <span className={varianceClass(s.cashVariance)}>
                      {peso.format(s.cashVariance)}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </ShiftsTable>
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

const ShiftsTable = ({ children }: { children: React.ReactNode }) => (
  <table className="ledger">
    <thead>
      <tr>
        <th>#</th>
        <th>Opened</th>
        <th>Closed</th>
        <th className="num">Starting cash</th>
        <th className="num">Net sales</th>
        <th className="num">Expected</th>
        <th className="num">Counted</th>
        <th className="num">Variance</th>
      </tr>
    </thead>
    <tbody>{children}</tbody>
  </table>
);
