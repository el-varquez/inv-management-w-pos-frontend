import { useState } from 'react';
import { Modal } from '../../../components/Modal';
import { useTenantMutations } from '../hooks/useTenantMutations';
import type { TenantUser } from '../../../types';

interface Props {
  tenantId: string;
  user: TenantUser;
  onClose: () => void;
  onDone: () => void;
}

export const EditUserModal = ({ tenantId, user, onClose, onDone }: Props) => {
  const { editUser, loading, error } = useTenantMutations();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');

  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    (password.length === 0 || password.length >= 8);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const ok = await editUser(tenantId, user.id, {
      name: name.trim(),
      email: email.trim(),
      password: password.length > 0 ? password : undefined,
    });

    if (ok) onDone();
  };

  return (
    <Modal
      title="Edit user"
      subtitle={user.role === 'Admin' ? 'Tenant admin' : 'Cashier'}
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
          <label htmlFor="user-name">Name</label>
          <input
            id="user-name"
            className="input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className="field">
          <label htmlFor="user-email">Email</label>
          <input
            id="user-email"
            className="input"
            type="email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="user-password">New password</label>
          <input
            id="user-password"
            className="input"
            type="password"
            autoComplete="new-password"
            placeholder="Leave blank to keep current password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
