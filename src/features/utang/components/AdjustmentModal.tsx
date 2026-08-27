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

export const AdjustmentModal = ({ suki, balance, onClose, onSaved }: Props) => {
  const { createAdjustment, loading, error } = useUtangMutations();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const parsed = Number.parseFloat(amount);
  const valid = Number.isFinite(parsed) && parsed !== 0;
  const canSubmit = valid && note.trim().length > 0 && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const ok = await createAdjustment({
      sukiId: suki.id,
      amount: parsed,
      note: note.trim(),
    });
    if (ok) onSaved();
  };

  return (
    <Modal
      title={`Adjust ${suki.name}'s balance`}
      subtitle="Carry a paper-ledger balance forward, or correct one"
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
          <label htmlFor="adjust-amount">Amount</label>
          <input
            id="adjust-amount"
            className="input"
            type="number"
            step="0.01"
            placeholder="e.g. 5000 or -250"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
            required
          />
          <span className="field-hint">
            Positive adds to what they owe, negative reduces it. Balance after:{' '}
            {peso.format(balance + (valid ? parsed : 0))}
          </span>
        </div>

        <div className="field">
          <label htmlFor="adjust-note">Note</label>
          <input
            id="adjust-note"
            className="input"
            type="text"
            placeholder="e.g. Forwarded balance"
            maxLength={200}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
          />
          <span className="field-hint">
            Required — this is the only record of why the balance moved.
          </span>
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
            {loading ? 'Saving…' : 'Save adjustment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
