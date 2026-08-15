import { useState } from 'react';
import { Modal } from '../../../components/Modal';
import { shiftService } from '../services/shiftService';
import { getApiErrorMessage } from '../../../services/apiError';
import { peso } from '../../../lib/format';
import type { ShiftRead } from '../../../types';

interface Props {
  read: ShiftRead;
  onClose: () => void;
  onDone: () => void;
}

export const CorrectCountModal = ({ read, onClose, onDone }: Props) => {
  const [counted, setCounted] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const countedValue = Number(counted);
  const canSubmit =
    counted.trim() !== '' &&
    Number.isFinite(countedValue) &&
    countedValue >= 0 &&
    reason.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);
    try {
      await shiftService.correctCount(read.id, {
        countedCash: countedValue,
        reason: reason.trim(),
      });
      onDone();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not correct the count.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Correct counted cash"
      subtitle={`Shift #${read.number}`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="login-error" role="alert">
            <span aria-hidden="true">⚠</span>
            {error}
          </div>
        )}

        <p className="state-msg" style={{ margin: '0 0 12px' }}>
          The counted figure is the only thing that changes — expected cash and
          every sales figure stay frozen at close.
        </p>

        <div className="modal-summary">
          <span>Counted at close</span>
          <strong className="tnum">
            {read.countedCash === null ? '—' : peso.format(read.countedCash)}
          </strong>
        </div>

        <div className="field">
          <label htmlFor="corrected-count">Corrected counted cash</label>
          <input
            id="corrected-count"
            className="input"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={counted}
            onChange={(e) => setCounted(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className="field">
          <label htmlFor="correction-reason">Reason</label>
          <input
            id="correction-reason"
            className="input"
            type="text"
            maxLength={256}
            placeholder="Why is the count being corrected?"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>

        {canSubmit && (
          <div className="modal-summary">
            <span>Variance after correction</span>
            <strong className="tnum">
              {peso.format(countedValue - read.expectedCash)}
            </strong>
          </div>
        )}

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
            type="submit"
            className="btn btn-primary"
            disabled={loading || !canSubmit}
          >
            {loading ? <span className="spinner" aria-hidden="true" /> : null}
            {loading ? 'Saving…' : 'Save correction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
