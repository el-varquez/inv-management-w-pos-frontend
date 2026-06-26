import { useState } from 'react';
import { Modal } from '../../../components/Modal';
import { useTenantMutations } from '../hooks/useTenantMutations';

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export const TenantFormModal = ({ onClose, onSaved }: Props) => {
  const { createTenant, loading, error } = useTenantMutations();

  const [businessName, setBusinessName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [cashierCap, setCashierCap] = useState('5');

  const capValue = Number(cashierCap);
  const canSubmit =
    businessName.trim().length > 0 &&
    adminName.trim().length > 0 &&
    adminEmail.trim().length > 0 &&
    adminPassword.length >= 8 &&
    Number.isInteger(capValue) &&
    capValue >= 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const ok = await createTenant({
      businessName: businessName.trim(),
      adminName: adminName.trim(),
      adminEmail: adminEmail.trim(),
      adminPassword,
      cashierCap: capValue,
    });

    if (ok) onSaved();
  };

  return (
    <Modal
      title="New tenant"
      subtitle="Onboard a business and its first admin"
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
          <label htmlFor="tenant-business">Business name</label>
          <input
            id="tenant-business"
            className="input"
            type="text"
            placeholder="e.g. Aling Nena Store"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className="field">
          <label htmlFor="tenant-admin-name">Admin name</label>
          <input
            id="tenant-admin-name"
            className="input"
            type="text"
            placeholder="e.g. Nena Cruz"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="tenant-admin-email">Admin email</label>
          <input
            id="tenant-admin-email"
            className="input"
            type="email"
            autoComplete="off"
            placeholder="admin@store.ph"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="tenant-admin-password">Admin password</label>
          <input
            id="tenant-admin-password"
            className="input"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            minLength={8}
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="tenant-cap">Cashier cap</label>
          <input
            id="tenant-cap"
            className="input"
            type="number"
            min={1}
            value={cashierCap}
            onChange={(e) => setCashierCap(e.target.value)}
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
            {loading ? 'Creating…' : 'Create tenant'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
