import { Modal } from '../../../components/Modal';
import { useTenantMutations } from '../hooks/useTenantMutations';

interface Props {
  tenantId: string;
  tenantName: string;
  mode: 'suspend' | 'reactivate';
  onClose: () => void;
  onDone: () => void;
}

export const TenantStatusModal = ({
  tenantId,
  tenantName,
  mode,
  onClose,
  onDone,
}: Props) => {
  const { suspendTenant, reactivateTenant, loading, error } =
    useTenantMutations();

  const isSuspend = mode === 'suspend';

  const handleConfirm = async () => {
    const ok = isSuspend
      ? await suspendTenant(tenantId)
      : await reactivateTenant(tenantId);
    if (ok) onDone();
  };

  return (
    <Modal
      title={isSuspend ? 'Suspend tenant' : 'Reactivate tenant'}
      subtitle={tenantName}
      onClose={onClose}
    >
      {error && (
        <div className="login-error" role="alert">
          <span aria-hidden="true">⚠</span>
          {error}
        </div>
      )}

      <p className="state-msg" style={{ margin: '0 0 8px' }}>
        {isSuspend ? (
          <>
            Nobody at <strong>{tenantName}</strong> will be able to sign in once
            their current sessions expire. Their data stays intact and you can
            reactivate them anytime.
          </>
        ) : (
          <>
            <strong>{tenantName}</strong> will be able to sign in again right
            away.
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
          className={isSuspend ? 'btn btn-danger' : 'btn btn-primary'}
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <span
              className={isSuspend ? 'spinner spinner-dark' : 'spinner'}
              aria-hidden="true"
            />
          ) : null}
          {loading
            ? isSuspend
              ? 'Suspending…'
              : 'Reactivating…'
            : isSuspend
              ? 'Suspend'
              : 'Reactivate'}
        </button>
      </div>
    </Modal>
  );
};
