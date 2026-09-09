import { useState } from 'react';
import { Modal } from '../../../components/Modal';
import { PasswordInput } from '../../../components/PasswordInput';
import { peso } from '../../../lib/format';

interface Props {
  totalOwed: number;
  owingCount: number;
  saving: boolean;
  saveError: string | null;
  onClose: () => void;
  onConfirm: (username: string, password: string) => Promise<boolean>;
}

export const TurnUtangOffModal = ({
  totalOwed,
  owingCount,
  saving,
  saveError,
  onClose,
  onConfirm,
}: Props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const canSubmit =
    username.trim().length > 0 && password.length > 0 && !saving;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const ok = await onConfirm(username.trim(), password);
    if (ok) onClose();
    else setPassword('');
  };

  return (
    <Modal title="Turn utang off?" onClose={onClose}>
      <form onSubmit={submit}>
        <p className="state-msg" style={{ marginBottom: 16 }}>
          {owingCount} {owingCount === 1 ? 'suki' : 'sukis'} still owe{' '}
          {peso.format(totalOwed)}. Their balances stay in the ledger and come
          back when you turn utang on.
        </p>

        {saveError && (
          <div className="login-error" role="alert">
            <span aria-hidden="true">⚠</span>
            {saveError}
          </div>
        )}

        <div className="field">
          <label htmlFor="utang-off-username">Admin username</label>
          <input
            id="utang-off-username"
            className="input"
            type="text"
            autoComplete="off"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
        </div>

        <div className="field">
          <label htmlFor="utang-off-password">Password</label>
          <PasswordInput
            id="utang-off-password"
            autoComplete="off"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-danger" disabled={!canSubmit}>
            {saving ? 'Turning off…' : 'TURN OFF'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
