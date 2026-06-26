import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenants } from '../hooks/useTenants';
import { PlatformTabs } from '../components/PlatformTabs';
import { TenantFormModal } from '../components/TenantFormModal';
import { TenantStatusModal } from '../components/TenantStatusModal';
import { CashierCapModal } from '../components/CashierCapModal';
import { formatDate } from '../../../lib/format';
import type { TenantSummary } from '../../../types';

const SKELETON_ROWS = Array.from({ length: 5 });

type ModalState =
  | { kind: 'create' }
  | { kind: 'suspend'; tenant: TenantSummary }
  | { kind: 'reactivate'; tenant: TenantSummary }
  | { kind: 'cap'; tenant: TenantSummary }
  | null;

export const TenantsScreen = () => {
  const { tenants, loading, error, refetch } = useTenants();
  const [modal, setModal] = useState<ModalState>(null);
  const navigate = useNavigate();

  const activeCount = tenants.filter((t) => t.isActive).length;

  const closeAndRefresh = () => {
    setModal(null);
    refetch();
  };

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Platform</p>
          <h1 className="page-title">Tenants</h1>
          <p className="page-lead">
            {loading
              ? 'Loading tenants…'
              : error
                ? 'Could not load tenants.'
                : `${activeCount} active of ${tenants.length} business${tenants.length === 1 ? '' : 'es'}`}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={refetch} disabled={loading}>
            Refresh
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setModal({ kind: 'create' })}
          >
            New tenant
          </button>
        </div>
      </div>

      <PlatformTabs />

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
          <TenantsTable>
            {SKELETON_ROWS.map((_, i) => (
              <tr key={i}>
                <td>
                  <span className="skeleton" style={{ width: '60%' }} />
                </td>
                <td>
                  <span className="skeleton" style={{ width: '40%' }} />
                </td>
                <td className="num">
                  <span className="skeleton" style={{ width: 40, marginLeft: 'auto' }} />
                </td>
                <td className="num">
                  <span className="skeleton" style={{ width: 60, marginLeft: 'auto' }} />
                </td>
                <td>
                  <span className="skeleton" style={{ width: 60 }} />
                </td>
                <td className="num">
                  <span className="skeleton" style={{ width: 140, marginLeft: 'auto' }} />
                </td>
              </tr>
            ))}
          </TenantsTable>
        ) : tenants.length === 0 ? (
          <div className="state">
            <div className="state-emoji">🏬</div>
            <div className="state-title">No tenants yet</div>
            <p className="state-msg">
              Onboard a business to set up its account and first admin.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setModal({ kind: 'create' })}
            >
              New tenant
            </button>
          </div>
        ) : (
          <TenantsTable>
            {tenants.map((t) => (
              <tr key={t.id}>
                <td>
                  <div className="item-name">{t.name}</div>
                </td>
                <td className="item-sub">{formatDate(t.createdAt)}</td>
                <td className="num">{t.userCount}</td>
                <td className="num">
                  {t.activeCashierCount} of {t.cashierCap}
                </td>
                <td>
                  <span
                    className={`badge ${t.isActive ? 'badge-ok' : 'badge-muted'}`}
                  >
                    {t.isActive ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="num">
                  <div className="row-actions">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => navigate(`/platform/tenants/${t.id}`)}
                    >
                      View
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setModal({ kind: 'cap', tenant: t })}
                    >
                      Edit cap
                    </button>
                    {t.isActive ? (
                      <button
                        className="btn btn-quiet btn-sm"
                        onClick={() => setModal({ kind: 'suspend', tenant: t })}
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() =>
                          setModal({ kind: 'reactivate', tenant: t })
                        }
                      >
                        Reactivate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </TenantsTable>
        )}
      </div>

      {modal?.kind === 'create' && (
        <TenantFormModal
          onClose={() => setModal(null)}
          onSaved={closeAndRefresh}
        />
      )}
      {modal?.kind === 'suspend' && (
        <TenantStatusModal
          tenantId={modal.tenant.id}
          tenantName={modal.tenant.name}
          mode="suspend"
          onClose={() => setModal(null)}
          onDone={closeAndRefresh}
        />
      )}
      {modal?.kind === 'reactivate' && (
        <TenantStatusModal
          tenantId={modal.tenant.id}
          tenantName={modal.tenant.name}
          mode="reactivate"
          onClose={() => setModal(null)}
          onDone={closeAndRefresh}
        />
      )}
      {modal?.kind === 'cap' && (
        <CashierCapModal
          tenantId={modal.tenant.id}
          tenantName={modal.tenant.name}
          currentCap={modal.tenant.cashierCap}
          activeCashierCount={modal.tenant.activeCashierCount}
          onClose={() => setModal(null)}
          onDone={closeAndRefresh}
        />
      )}
    </>
  );
};

const TenantsTable = ({ children }: { children: React.ReactNode }) => (
  <table className="ledger">
    <thead>
      <tr>
        <th>Business</th>
        <th>Created</th>
        <th className="num">Users</th>
        <th className="num">Cashiers</th>
        <th>Status</th>
        <th className="num">Actions</th>
      </tr>
    </thead>
    <tbody>{children}</tbody>
  </table>
);
