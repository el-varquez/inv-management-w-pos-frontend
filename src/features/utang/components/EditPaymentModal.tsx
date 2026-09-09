import { useState } from 'react';
import { Modal } from '../../../components/Modal';
import { peso } from '../../../lib/format';
import { useUtangMutations } from '../hooks/useUtangMutations';
import type { UtangLedgerEntry } from '../../../types';

interface Props {
  entry: UtangLedgerEntry;
  onClose: () => void;
  onSaved: () => void;
}

export const EditPaymentModal = ({ entry, onClose, onSaved }: Props) => {
  const { editPayment, loading, error } = useUtangMutations();
  const [amount, setAmount] = useState(String(entry.amount));

  const parsed = Number.parseFloat(amount);
  const valid = Number.isFinite(parsed) && parsed > 0;
  const canSubmit = valid && !loading;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const ok = await editPayment(entry.id, parsed);
    if (ok) onSaved();
  };

  return (
    <Modal
      title="Correct this payment"
      subtitle="The first recorded amount is kept beside the entry."
      onClose={onClose}
    >
      <form onSubmit={submit}>
        {error && (
          <div className="login-error" role="alert">
            <span aria-hidden="true">⚠</span>
            {error}
          </div>
        )}

        <p className="state-msg" style={{ marginBottom: 16 }}>
          Current amount: {peso.format(entry.amount)}
        </p>

        <div className="field">
          <label htmlFor="edit-payment-amount">Corrected amount</label>
          <input
            id="edit-payment-amount"
            className="input"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
