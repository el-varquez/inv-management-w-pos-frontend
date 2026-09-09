import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../../../hooks/useSettings';
import { utangOutstandingService } from '../../../services/utangOutstandingService';
import { AcceptUtangRow } from '../components/AcceptUtangRow';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { PaymentMethodsSection } from '../components/PaymentMethodsSection';
import { TurnUtangOffModal } from '../components/TurnUtangOffModal';
import { UndoZReadSection } from '../components/UndoZReadSection';
import { UtangMarkupRow } from '../components/UtangMarkupRow';
import type { UtangOutstanding } from '../../../types';

export const SettingsScreen = () => {
  const {
    settings,
    loading,
    error,
    saving,
    saveError,
    clearSaveError,
    setDefaultUtangMarkup,
    setUtangReminderDays,
    setAcceptUtang,
  } = useSettings();

  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [outstanding, setOutstanding] = useState<UtangOutstanding | null>(null);
  const [turningOff, setTurningOff] = useState(false);

  const loadOutstanding = async (): Promise<UtangOutstanding | null> => {
    try {
      const data = await utangOutstandingService.get();
      setOutstanding(data);
      return data;
    } catch {
      setOutstanding(null);
      return null;
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadOutstanding();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleToggle = async (next: boolean) => {
    clearSaveError();
    if (next) {
      await setAcceptUtang(true);
      return;
    }
    const owed = await loadOutstanding();
    if (owed && owed.totalOwed > 0) {
      setTurningOff(true);
      return;
    }
    const ok = await setAcceptUtang(false);
    if (ok) loadOutstanding();
  };

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
            {saveError && !turningOff && (
              <div className="login-error" role="alert">
                <span aria-hidden="true">⚠</span>
                {saveError}
              </div>
            )}

            <AcceptUtangRow
              acceptUtang={settings?.acceptUtang ?? false}
              reminderDays={settings?.utangReminderDays ?? 7}
              outstanding={outstanding}
              disabled={loading || saving || !settings}
              onToggle={handleToggle}
              onReminderDaysSave={setUtangReminderDays}
            />

            {settings?.acceptUtang && (
              <UtangMarkupRow
                value={settings.defaultUtangMarkup}
                disabled={loading || saving}
                onSave={setDefaultUtangMarkup}
              />
            )}

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

      {turningOff && outstanding && (
        <TurnUtangOffModal
          totalOwed={outstanding.totalOwed}
          owingCount={outstanding.owingCount}
          saving={saving}
          saveError={saveError}
          onClose={() => {
            clearSaveError();
            setTurningOff(false);
          }}
          onConfirm={async (username, password) => {
            const ok = await setAcceptUtang(false, { username, password });
            if (ok) await loadOutstanding();
            return ok;
          }}
        />
      )}

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
