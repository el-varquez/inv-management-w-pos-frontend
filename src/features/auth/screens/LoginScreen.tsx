import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../../../components/Modal';
import { NewPasswordFields } from '../../../components/NewPasswordFields';
import { PasswordInput } from '../../../components/PasswordInput';
import { validateNewPassword } from '../../../lib/validateNewPassword';
import { useAuth } from '../hooks/useAuth';

export const LoginScreen = () => {
  const {
    login,
    loading,
    error,
    token,
    pendingSetupUsername,
    confirmSetup,
    setupUsername,
    setupPassword,
    cancelSetup,
  } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (token) navigate('/', { replace: true });
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateNewPassword(newPassword, confirmPassword);
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError(null);
    await setupPassword(newPassword);
  };

  const handleCancelSetup = () => {
    setNewPassword('');
    setConfirmPassword('');
    setFormError(null);
    cancelSetup();
  };

  const shownError = formError ?? error;

  if (setupUsername) {
    return (
      <div className="login-wrap">
        <form className="login-card" onSubmit={handleSetup}>
          <div className="login-brand">
            <div className="brand-mark">T</div>
            <div>
              <div className="brand-name">
                Toyang's
                <br />
                Inventory
              </div>
            </div>
          </div>

          <h1 className="login-title">Set your password</h1>
          <p className="login-lead">
            First login for <strong>{setupUsername}</strong> — choose a password
            of at least 8 characters.
          </p>

          {shownError && (
            <div className="login-error" role="alert">
              <span aria-hidden="true">⚠</span>
              {shownError}
            </div>
          )}

          <NewPasswordFields
            idPrefix="setup"
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            onNewPasswordChange={setNewPassword}
            onConfirmPasswordChange={setConfirmPassword}
          />

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? <span className="spinner" aria-hidden="true" /> : null}
            {loading ? 'Saving…' : 'Set password'}
          </button>

          <button
            type="button"
            className="btn btn-block"
            onClick={handleCancelSetup}
            disabled={loading}
          >
            Back to sign in
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <div className="brand-mark">T</div>
          <div>
            <div className="brand-name">
              Toyang's
              <br />
              Inventory
            </div>
          </div>
        </div>

        <h1 className="login-title">Welcome back</h1>
        <p className="login-lead">
          Sign in to manage your items, stock, and reports.
        </p>

        {error && (
          <div className="login-error" role="alert">
            <span aria-hidden="true">⚠</span>
            {error}
          </div>
        )}

        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            className="input"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading ? <span className="spinner" aria-hidden="true" /> : null}
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      {pendingSetupUsername && (
        <Modal
          title="No password set"
          subtitle={pendingSetupUsername}
          onClose={handleCancelSetup}
        >
          <p className="state-msg" style={{ margin: '0 0 8px' }}>
            <strong>{pendingSetupUsername}</strong> doesn't have a password
            yet. Add a password to sign in.
          </p>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleCancelSetup}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={confirmSetup}
              autoFocus
            >
              Okay
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
