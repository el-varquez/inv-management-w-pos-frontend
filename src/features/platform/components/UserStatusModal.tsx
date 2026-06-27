import { Modal } from '../../../components/Modal';
import { useTenantMutations } from '../hooks/useTenantMutations';
import type { TenantUser } from '../../../types';

interface Props {
  tenantId: string;
  user: TenantUser;
  mode: 'deactivate' | 'reactivate';
  onClose: () => void;
  onDone: () => void;
}

export const UserStatusModal = ({
  tenantId,
  user,
  mode,
  onClose,
  onDone,
}: Props) => {
  const { deactivateUser, reactivateUser, loading, error } =
    useTenantMutations();

  const isDeactivate = mode === 'deactivate';

  const handleConfirm = async () => {
    const ok = isDeactivate
      ? await deactivateUser(tenantId, user.id)
      : await reactivateUser(tenantId, user.id);
    if (ok) onDone();
  };

  return (
    <Modal
      title={isDeactivate ? 'Deactivate cashier' : 'Reactivate cashier'}
      subtitle={user.name}
      onClose={onClose}
    >
      {error && (
        <div className="login-error" role="alert">
          <span aria-hidden="true">⚠</span>
          {error}
        </div>
      )}

      <p className="state-msg" style={{ margin: '0 0 8px' }}>
        {isDeactivate ? (
          <>
            <strong>{user.name}</strong> will no longer be able to sign in once
            their current session expires, and a cap slot is freed. Their records
            stay intact and you can reactivate them anytime.
          </>
        ) : (
          <>
            <strong>{user.name}</strong> will be able to sign in again. This
            re-checks the tenant’s cashier cap.
          </>
        )}
      </p>

      <div className="modal-actions">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="button"
          className={isDeactivate ? 'btn btn-danger' : 'btn btn-primary'}
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <span
              className={isDeactivate ? 'spinner spinner-dark' : 'spinner'}
              aria-hidden="true"
            />
          ) : null}
          {loading
            ? isDeactivate
              ? 'Deactivating…'
              : 'Reactivating…'
            : isDeactivate
              ? 'Deactivate'
              : 'Reactivate'}
        </button>
      </div>
    </Modal>
  );
};
