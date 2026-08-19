import { useState } from 'react';
import { Modal } from '../../../components/Modal';
import { PasswordInput } from '../../../components/PasswordInput';
import { NewPasswordFields } from '../../../components/NewPasswordFields';
import { validateNewPassword } from '../../../lib/validateNewPassword';
import { useChangePassword } from '../hooks/useChangePassword';

interface Props {
  onClose: () => void;
  onDone: () => void;
}

export const ChangePasswordModal = ({ onClose, onDone }: Props) => {
  const { changePassword, loading, error } = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const shownError = formError ?? error;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateNewPassword(newPassword, confirmPassword);
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError(null);
    const ok = await changePassword(currentPassword, newPassword);
    if (ok) onDone();
  };

  return (
    <Modal title="Change password" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {shownError && (
          <div className="login-error" role="alert">
            <span aria-hidden="true">⚠</span>
            {shownError}
          </div>
        )}

        <div className="field">
          <label htmlFor="change-current-password">Current password</label>
          <PasswordInput
            id="change-current-password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoFocus
            required
          />
        </div>

        <NewPasswordFields
          idPrefix="change"
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          onNewPasswordChange={setNewPassword}
          onConfirmPasswordChange={setConfirmPassword}
        />

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" aria-hidden="true" /> : null}
            {loading ? 'Saving…' : 'Change password'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
