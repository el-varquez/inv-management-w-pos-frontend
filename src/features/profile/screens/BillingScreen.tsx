import { useProfile } from '../hooks/useProfile';
import { ProfileTabs } from '../components/ProfileTabs';
import { CreditCard, ReceiptText } from 'lucide-react';

export const BillingScreen = () => {
  const { profile } = useProfile();

  const used = profile?.business.activeCashiers ?? 0;
  const cap = profile?.business.cashierCap ?? 0;
  const pct = cap > 0 ? Math.min(100, Math.round((used / cap) * 100)) : 0;

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

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-section">
          <div className="card-head">
            <div>
              <div className="card-title">Current plan</div>
              <div className="card-sub">What this store is subscribed to.</div>
            </div>
            <span className="pill">Early access</span>
          </div>

          <p className="plan-value">
            Free<small>while we finish billing</small>
          </p>
          <p className="plan-copy">
            You’re on the house during early access. When subscriptions go live,
            you’ll choose a plan before anything is charged.
          </p>

          <div className="meter-head">
            <span className="meter-label">Cashier seats</span>
            <span className="meter-count tnum">
              {used} of {cap}
            </span>
          </div>
          <div className="meter">
            <div className="meter-fill" style={{ width: `${pct}%` }} />
          </div>

          <div className="plan-actions">
            <button className="btn btn-primary" disabled>
              Manage subscription <span className="pill pill-muted">Soon</span>
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-section">
          <div className="card-head">
            <div>
              <div className="card-title">Payment method</div>
              <div className="card-sub">How charges will be collected.</div>
            </div>
          </div>
          <div className="empty-inset">
            <span className="empty-inset-icon">
              <CreditCard size={20} strokeWidth={1.75} />
            </span>
            <div>
              <div className="empty-inset-title">No payment method yet</div>
              <div className="empty-inset-text">
                Add a card or e-wallet once billing is available. Nothing is
                charged during early access.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-section">
          <div className="card-head">
            <div>
              <div className="card-title">Billing history</div>
              <div className="card-sub">Invoices and receipts.</div>
            </div>
          </div>
          <div className="empty-inset">
            <span className="empty-inset-icon">
              <ReceiptText size={20} strokeWidth={1.75} />
            </span>
            <div>
              <div className="empty-inset-title">No invoices yet</div>
              <div className="empty-inset-text">
                Your receipts will appear here after your first billing cycle.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
