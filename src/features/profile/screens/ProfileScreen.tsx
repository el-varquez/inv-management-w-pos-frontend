import { useEffect, useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { useProfileMutations } from '../hooks/useProfileMutations';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { ProfileTabs } from '../components/ProfileTabs';
import { Mail, ShieldCheck, Lock, Store, Users, KeyRound } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

export const ProfileScreen = () => {
  const { profile, loading, error, refetch } = useProfile();
  const { updateName, loading: saving, error: saveError } = useProfileMutations();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (profile) setName(profile.account.name); }, [profile]);

  const nameChanged = profile != null && name.trim() !== profile.account.name;
  const canSave = nameChanged && name.trim().length > 0;

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    const ok = await updateName(name.trim());
    if (ok) {
      if (user) setUser({ ...user, name: name.trim() });
      refetch();
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Account</p>
          <h1 className="page-title">Profile</h1>
          <p className="page-lead">
            Manage your account and view your business details.
          </p>
        </div>
      </div>

      <ProfileTabs />

      {error ? (
        <div className="card state state-error">
          <div className="state-emoji">⚠️</div>
          <div className="state-title">Something went wrong</div>
          <p className="state-msg">{error}</p>
          <button className="btn btn-ghost" onClick={refetch}>
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 18 }}>
            <div className="card-section">
              <div className="card-head">
                <div>
                  <div className="card-title">My account</div>
                  <div className="card-sub">Your personal sign-in details.</div>
                </div>
              </div>

              <form onSubmit={handleSaveName}>
                {saveError && (
                  <div className="login-error" role="alert">
                    <span aria-hidden="true">⚠</span>
                    {saveError}
                  </div>
                )}

                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="profile-name">Name</label>
                    <input
                      id="profile-name"
                      className="input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading || saving}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Role</label>
                    <div className="input-affix has-left has-right">
                      <span className="affix-icon left clay">
                        <ShieldCheck size={16} strokeWidth={1.75} />
                      </span>
                      <div className="input is-readonly accent">
                        {profile?.account.role ?? '—'}
                      </div>
                      <span className="affix-icon right">
                        <Lock size={16} strokeWidth={1.75} />
                      </span>
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label>Email</label>
                  <div className="input-affix has-left">
                    <span className="affix-icon left">
                      <Mail size={16} strokeWidth={1.75} />
                    </span>
                    <div className="input is-readonly">
                      {profile?.account.email ?? '—'}
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setShowPassword(true)}
                    disabled={loading}
                  >
                    <KeyRound size={16} strokeWidth={1.75} /> Change password
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!canSave || saving}
                  >
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="card">
            <div className="card-section">
              <div className="card-head">
                <div>
                  <div className="card-title">Business</div>
                  <div className="card-sub">Details for this store.</div>
                </div>
              </div>

              <div className="field-grid">
                <div className="field" style={{ marginBottom: 0 }}>
                  <label>Business name</label>
                  <div className="input-affix has-left">
                    <span className="affix-icon left">
                      <Store size={16} strokeWidth={1.75} />
                    </span>
                    <div className="input is-readonly">
                      {profile?.business.name ?? '—'}
                    </div>
                  </div>
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label>Cashiers</label>
                  <div className="input-affix has-left">
                    <span className="affix-icon left">
                      <Users size={16} strokeWidth={1.75} />
                    </span>
                    <div className="input is-readonly">
                      {profile
                        ? `${profile.business.activeCashiers} / ${profile.business.cashierCap} seats used`
                        : '—'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showPassword && (
        <ChangePasswordModal
          onClose={() => setShowPassword(false)}
          onDone={() => setShowPassword(false)}
        />
      )}
    </>
  );
};
