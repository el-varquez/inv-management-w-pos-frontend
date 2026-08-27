import { Modal } from '../../../components/Modal';
import { useUtangMutations } from '../hooks/useUtangMutations';
import type { Suki } from '../../../types';

interface Props {
  suki: Suki;
  hasEntries: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export const DeleteSukiModal = ({
  suki,
  hasEntries,
  onClose,
  onDeleted,
}: Props) => {
  const { deleteSuki, loading, error } = useUtangMutations();

  const handleConfirm = async () => {
    if (await deleteSuki(suki.id)) onDeleted();
  };

  return (
    <Modal title="Delete suki" subtitle={suki.name} onClose={onClose}>
      {error && (
        <div className="login-error" role="alert">
          <span aria-hidden="true">⚠</span>
          {error}
        </div>
      )}

      <p className="state-msg" style={{ margin: '0 0 8px' }}>
        {hasEntries ? (
          <>
            <strong>{suki.name}</strong> has ledger history, so they can’t be
            deleted — the record has to stay. Write the balance off with an
            adjustment instead.
          </>
        ) : (
          <>
            <strong>{suki.name}</strong> has no charges, collections or
            adjustments, so nothing is lost. This cannot be undone.
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
          {hasEntries ? 'Close' : 'Cancel'}
        </button>
        {!hasEntries && (
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner spinner-dark" aria-hidden="true" />
            ) : null}
            {loading ? 'Deleting…' : 'Delete suki'}
          </button>
        )}
      </div>
    </Modal>
  );
};
