import { useState } from 'react';
import { Modal } from '../../../components/Modal';
import { useTenantMutations } from '../hooks/useTenantMutations';

interface Props {
  tenantId: string;
  tenantName: string;
  currentCap: number;
  activeCashierCount: number;
  onClose: () => void;
  onDone: () => void;
}

export const CashierCapModal = ({
  tenantId,
  tenantName,
  currentCap,
  activeCashierCount,
  onClose,
  onDone,
}: Props) => {
  const { setCashierCap, loading, error } = useTenantMutations();
  const [cap, setCap] = useState(String(currentCap));

  const capValue = Number(cap);
  const canSubmit =
    Number.isInteger(capValue) && capValue >= 1 && capValue !== currentCap;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const ok = await setCashierCap(tenantId, capValue);
    if (ok) onDone();
  };

  return (
    <Modal title="Edit cashier cap" subtitle={tenantName} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="login-error" role="alert">
            <span aria-hidden="true">⚠</span>
            {error}
          </div>
        )}

        <p className="state-msg" style={{ margin: '0 0 12px' }}>
          This business currently has <strong>{activeCashierCount}</strong>{' '}
          active cashier{activeCashierCount === 1 ? '' : 's'}. Lowering the cap
          below that won’t deactivate anyone — it only blocks new activations
          until they’re back under the limit.
        </p>

        <div className="field">
          <label htmlFor="cap-value">Cashier cap</label>
          <input
            id="cap-value"
            className="input"
            type="number"
            min={1}
            value={cap}
            onChange={(e) => setCap(e.target.value)}
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
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !canSubmit}
          >
            {loading ? <span className="spinner" aria-hidden="true" /> : null}
            {loading ? 'Saving…' : 'Save cap'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
