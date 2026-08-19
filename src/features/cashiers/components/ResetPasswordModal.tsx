import { useState } from 'react';
import { Modal } from '../../../components/Modal';
import { NewPasswordFields } from '../../../components/NewPasswordFields';
import { validateNewPassword } from '../../../lib/validateNewPassword';
import { useCashierMutations } from '../hooks/useCashierMutations';
import type { Cashier } from '../../../types';

interface Props {
  cashier: Cashier;
  onClose: () => void;
  onDone: () => void;
}

export const ResetPasswordModal = ({ cashier, onClose, onDone }: Props) => {
  const { resetPassword, loading, error } = useCashierMutations();
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
    const ok = await resetPassword(cashier.id, newPassword);
    if (ok) onDone();
  };

  return (
    <Modal
      title="Reset password"
      subtitle={cashier.name}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        {shownError && (
          <div className="login-error" role="alert">
            <span aria-hidden="true">⚠</span>
            {shownError}
          </div>
        )}

        <p className="state-msg" style={{ margin: '0 0 12px' }}>
          Set a new password for <strong>{cashier.username}</strong>. Share it with
          them directly — they’ll use it to sign in on the register.
        </p>

        <NewPasswordFields
          idPrefix="reset"
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          onNewPasswordChange={setNewPassword}
          onConfirmPasswordChange={setConfirmPassword}
          autoFocus
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
            {loading ? 'Saving…' : 'Set new password'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
