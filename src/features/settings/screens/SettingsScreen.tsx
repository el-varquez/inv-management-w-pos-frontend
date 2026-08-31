import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../../../hooks/useSettings';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { PaymentMethodsSection } from '../components/PaymentMethodsSection';
import { UndoZReadSection } from '../components/UndoZReadSection';
import { UtangMarkupRow } from '../components/UtangMarkupRow';

export const SettingsScreen = () => {
  const {
    settings,
    loading,
    error,
    saving,
    saveError,
    setDefaultUtangMarkup,
  } = useSettings();

  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const revealBypass = Boolean(
    (useLocation().state as { revealBypass?: boolean } | null)?.revealBypass
  );

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Store</p>
          <h1 className="page-title">Settings</h1>
          <p className="page-lead">
            {loading
              ? 'Loading settings…'
              : error
                ? 'Could not load settings.'
                : 'Configure how the register behaves.'}
          </p>
        </div>
      </div>

      <div className="card settings-card">
        {error ? (
          <div className="state state-error">
            <div className="state-emoji">⚠️</div>
            <div className="state-title">Something went wrong</div>
            <p className="state-msg">{error}</p>
          </div>
        ) : (
          <>
            {saveError && (
              <div className="login-error" role="alert">
                <span aria-hidden="true">⚠</span>
                {saveError}
              </div>
            )}

            <UtangMarkupRow
              value={settings ? settings.defaultUtangMarkup : null}
              disabled={loading || saving || !settings}
              onSave={setDefaultUtangMarkup}
            />

            <PaymentMethodsSection />

            <div className="setting-row">
              <div className="setting-copy">
                <div className="setting-name">Change password</div>
                <p className="setting-desc">
                  Update the password for this admin account.
                </p>
              </div>
              <div className="setting-control">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setChangingPassword(true)}
                >
                  Change password
                </button>
                {passwordSaved && <p className="setting-saved">Saved</p>}
              </div>
            </div>

            {revealBypass && <UndoZReadSection />}
          </>
        )}
      </div>

      {changingPassword && (
        <ChangePasswordModal
          onClose={() => setChangingPassword(false)}
          onDone={() => {
            setChangingPassword(false);
            setPasswordSaved(true);
            window.setTimeout(() => setPasswordSaved(false), 2000);
          }}
        />
      )}
    </>
  );
};
