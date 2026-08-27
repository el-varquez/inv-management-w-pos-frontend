import { useState } from 'react';
import { Modal } from '../../../components/Modal';
import { peso } from '../../../lib/format';
import { useUtangMutations } from '../hooks/useUtangMutations';
import type { Suki } from '../../../types';

interface Props {
  suki: Suki;
  balance: number;
  onClose: () => void;
  onSaved: () => void;
}

export const CollectModal = ({ suki, balance, onClose, onSaved }: Props) => {
  const { collect, loading, error } = useUtangMutations();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const parsed = Number.parseFloat(amount);
  const valid = Number.isFinite(parsed) && parsed > 0;
  const overBalance = valid && parsed > balance;
  const canSubmit = valid && !overBalance && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const trimmedNote = note.trim();
    const ok = await collect({
      sukiId: suki.id,
      amount: parsed,
      ...(trimmedNote ? { note: trimmedNote } : {}),
    });
    if (ok) onSaved();
  };

  return (
    <Modal
      title={`Collect from ${suki.name}`}
      subtitle="Cash goes into the drawer and counts as a collection"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="login-error" role="alert">
            <span aria-hidden="true">⚠</span>
            {error}
          </div>
        )}

        <div className="field">
          <label htmlFor="collect-amount">Amount</label>
          <input
            id="collect-amount"
            className="input"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
            required
          />
          <span className="field-hint">
            {overBalance
              ? `That's more than ${suki.name} owes — the balance is ${peso.format(balance)}.`
              : `Balance after: ${peso.format(balance - (valid ? parsed : 0))}`}
          </span>
        </div>

        <div className="field">
          <label htmlFor="collect-note">Note (optional)</label>
          <input
            id="collect-note"
            className="input"
            type="text"
            placeholder="e.g. paid at the house"
            maxLength={200}
            value={note}
            onChange={(e) => setNote(e.target.value)}
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
            {loading ? 'Saving…' : 'Collect'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
