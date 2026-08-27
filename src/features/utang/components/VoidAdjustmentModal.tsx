import { Modal } from '../../../components/Modal';
import { peso } from '../../../lib/format';
import { useUtangMutations } from '../hooks/useUtangMutations';
import type { UtangLedgerEntry } from '../../../types';

interface Props {
  entry: UtangLedgerEntry;
  balance: number;
  onClose: () => void;
  onVoided: () => void;
}

export const VoidAdjustmentModal = ({
  entry,
  balance,
  onClose,
  onVoided,
}: Props) => {
  const { voidAdjustment, loading, error } = useUtangMutations();

  const handleConfirm = async () => {
    if (await voidAdjustment(entry.id)) onVoided();
  };

  return (
    <Modal
      title="Void adjustment"
      subtitle={entry.note ?? undefined}
      onClose={onClose}
    >
      {error && (
        <div className="login-error" role="alert">
          <span aria-hidden="true">⚠</span>
          {error}
        </div>
      )}

      <p className="state-msg" style={{ margin: '0 0 8px' }}>
        The adjustment of <strong>{peso.format(entry.amount)}</strong> stays on
        the ledger struck through, and the balance goes back to{' '}
        <strong>{peso.format(balance - entry.amount)}</strong>.
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
          className="btn btn-danger"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <span className="spinner spinner-dark" aria-hidden="true" />
          ) : null}
          {loading ? 'Voiding…' : 'Void adjustment'}
        </button>
      </div>
    </Modal>
  );
};
