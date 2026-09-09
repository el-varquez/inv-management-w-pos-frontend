import { Modal } from '../../../components/Modal';
import { peso } from '../../../lib/format';
import { useUtangMutations } from '../hooks/useUtangMutations';
import type { UtangLedgerEntry } from '../../../types';

interface Props {
  entry: UtangLedgerEntry;
  onClose: () => void;
  onSaved: () => void;
}

export const VoidEntryModal = ({ entry, onClose, onSaved }: Props) => {
  const { voidInvoice, voidPayment, loading, error } = useUtangMutations();
  const isCharge = entry.type === 'Charge';

  const confirm = async () => {
    const ok = isCharge
      ? entry.invoiceId
        ? await voidInvoice(entry.invoiceId)
        : false
      : await voidPayment(entry.id);
    if (ok) onSaved();
  };

  return (
    <Modal
      title={isCharge ? 'Void this charge?' : 'Void this payment?'}
      subtitle={
        isCharge
          ? 'Stock goes back to the shelf and the balance drops by the charge.'
          : 'The balance goes back up by the payment. Nothing moves in the drawer.'
      }
      onClose={onClose}
    >
      {error && (
        <div className="login-error" role="alert">
          <span aria-hidden="true">⚠</span>
          {error}
        </div>
      )}

      <p className="state-msg" style={{ marginBottom: 16 }}>
        {isCharge
          ? `Charge · ${entry.invoiceNumber ?? ''} — ${peso.format(entry.amount)}`
          : `${entry.note ?? 'Payment received'} — ${peso.format(entry.amount)}`}
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
          onClick={confirm}
          disabled={loading}
        >
          {loading ? 'Voiding…' : 'Void'}
        </button>
      </div>
    </Modal>
  );
};
