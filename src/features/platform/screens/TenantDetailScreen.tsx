import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTenant } from '../hooks/useTenant';
import { TenantStatusModal } from '../components/TenantStatusModal';
import { CashierCapModal } from '../components/CashierCapModal';
import { EditUserModal } from '../components/EditUserModal';
import { UserStatusModal } from '../components/UserStatusModal';
import { formatDate } from '../../../lib/format';
import type { TenantUser } from '../../../types';

type ModalState = 'suspend' | 'reactivate' | 'cap' | null;
type UserAction = { user: TenantUser; action: 'edit' | 'deactivate' | 'reactivate' };

export const TenantDetailScreen = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { tenant, loading, error, refetch } = useTenant(id);
  const [modal, setModal] = useState<ModalState>(null);
  const [userAction, setUserAction] = useState<UserAction | null>(null);

  const closeAndRefresh = () => {
    setModal(null);
    refetch();
  };

  const closeUserAndRefresh = () => {
    setUserAction(null);
    refetch();
  };

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/platform/tenants')}
            >
              ← Tenants
            </button>
          </p>
          <h1 className="page-title">{tenant?.name ?? 'Tenant'}</h1>
          <p className="page-lead">
            {loading
              ? 'Loading tenant…'
              : error
                ? 'Could not load tenant.'
                : tenant
                  ? `${tenant.activeCashierCount} of ${tenant.cashierCap} active cashier${tenant.cashierCap === 1 ? '' : 's'} · ${tenant.users.length} user${tenant.users.length === 1 ? '' : 's'}`
                  : ''}
          </p>
        </div>
        {tenant && (
          <div className="page-actions">
            <button
              className="btn btn-ghost"
              onClick={() => setModal('cap')}
            >
              Edit cap
            </button>
            {tenant.isActive ? (
              <button
                className="btn btn-quiet"
                onClick={() => setModal('suspend')}
              >
                Suspend
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => setModal('reactivate')}
              >
                Reactivate
              </button>
            )}
          </div>
        )}
      </div>

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
      ) : loading || !tenant ? (
        <div className="card table-wrap">
          <div className="state">
            <span className="spinner spinner-dark" aria-hidden="true" />
          </div>
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 16, padding: 20 }}>
            <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
              <div>
                <p className="eyebrow">Status</p>
                <span
                  className={`badge ${tenant.isActive ? 'badge-ok' : 'badge-muted'}`}
                >
                  {tenant.isActive ? 'Active' : 'Suspended'}
                </span>
              </div>
              <div>
                <p className="eyebrow">Onboarded</p>
                <div className="item-name">{formatDate(tenant.createdAt)}</div>
              </div>
              <div>
                <p className="eyebrow">Cashier cap</p>
                <div className="item-name">{tenant.cashierCap}</div>
              </div>
            </div>
          </div>

          <div className="card table-wrap">
            <table className="ledger">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenant.users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="item-name">{u.name}</div>
                    </td>
                    <td className="item-sub">{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      <span
                        className={`badge ${u.isActive ? 'badge-ok' : 'badge-muted'}`}
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          gap: 8,
                          justifyContent: 'flex-end',
                        }}
                      >
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setUserAction({ user: u, action: 'edit' })}
                        >
                          Edit
                        </button>
                        {u.role === 'Cashier' &&
                          (u.isActive ? (
                            <button
                              className="btn btn-quiet btn-sm"
                              onClick={() =>
                                setUserAction({ user: u, action: 'deactivate' })
                              }
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() =>
                                setUserAction({ user: u, action: 'reactivate' })
                              }
                            >
                              Reactivate
                            </button>
                          ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tenant && modal === 'suspend' && (
        <TenantStatusModal
          tenantId={tenant.id}
          tenantName={tenant.name}
          mode="suspend"
          onClose={() => setModal(null)}
          onDone={closeAndRefresh}
        />
      )}
      {tenant && modal === 'reactivate' && (
        <TenantStatusModal
          tenantId={tenant.id}
          tenantName={tenant.name}
          mode="reactivate"
          onClose={() => setModal(null)}
          onDone={closeAndRefresh}
        />
      )}
      {tenant && modal === 'cap' && (
        <CashierCapModal
          tenantId={tenant.id}
          tenantName={tenant.name}
          currentCap={tenant.cashierCap}
          activeCashierCount={tenant.activeCashierCount}
          onClose={() => setModal(null)}
          onDone={closeAndRefresh}
        />
      )}

      {tenant && userAction?.action === 'edit' && (
        <EditUserModal
          tenantId={tenant.id}
          user={userAction.user}
          onClose={() => setUserAction(null)}
          onDone={closeUserAndRefresh}
        />
      )}
      {tenant && userAction?.action === 'deactivate' && (
        <UserStatusModal
          tenantId={tenant.id}
          user={userAction.user}
          mode="deactivate"
          onClose={() => setUserAction(null)}
          onDone={closeUserAndRefresh}
        />
      )}
      {tenant && userAction?.action === 'reactivate' && (
        <UserStatusModal
          tenantId={tenant.id}
          user={userAction.user}
          mode="reactivate"
          onClose={() => setUserAction(null)}
          onDone={closeUserAndRefresh}
        />
      )}
    </>
  );
};
