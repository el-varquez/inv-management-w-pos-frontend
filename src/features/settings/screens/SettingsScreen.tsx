import { useSettings } from '../../../hooks/useSettings';
import { GcashWalletRow } from '../components/GcashWalletRow';
import { UtangMarkupRow } from '../components/UtangMarkupRow';

export const SettingsScreen = () => {
  const {
    settings,
    loading,
    error,
    saving,
    saveError,
    setAcceptUtang,
    setDefaultUtangMarkup,
    setGcashWallet,
  } = useSettings();

  const accept = settings?.acceptUtang ?? false;

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

            <div className="setting-row">
              <div className="setting-copy">
                <div className="setting-name" id="accept-utang-label">
                  Accept utang
                </div>
                <p className="setting-desc">
                  When off, the register takes no new charges — collections are
                  still allowed.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={accept}
                aria-labelledby="accept-utang-label"
                className={`switch${accept ? ' switch-on' : ''}`}
                disabled={loading || saving || !settings}
                onClick={() => setAcceptUtang(!accept)}
              >
                <span className="switch-knob" />
              </button>
            </div>

            {accept && (
              <UtangMarkupRow
                value={settings ? settings.defaultUtangMarkup : null}
                disabled={loading || saving || !settings}
                onSave={setDefaultUtangMarkup}
              />
            )}

            <GcashWalletRow
              trackGcashWallet={settings?.trackGcashWallet ?? false}
              gcashFeeItemId={settings?.gcashFeeItemId ?? null}
              disabled={loading || saving || !settings}
              onSave={setGcashWallet}
            />
          </>
        )}
      </div>
    </>
  );
};
