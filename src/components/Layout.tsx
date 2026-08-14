import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useIsAdmin } from '../store/authStore';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'nav-link is-active' : 'nav-link';

const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const ItemsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7-7V3.4h10.2l6.8 6.8a2 2 0 0 1 0 3.2Z" />
    <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

const InventoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 8.2 12 3.5 3 8.2v7.6l9 4.7 9-4.7Z" />
    <path d="M3.3 8.3 12 12.8l8.7-4.5" />
    <path d="M12 12.8V20" />
  </svg>
);

const ReportsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M4 20V10" />
    <path d="M10 20V4" />
    <path d="M16 20v-9" />
    <path d="M22 20H2" />
  </svg>
);

const CashiersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="8" r="3.4" />
    <path d="M2.8 20c.8-3.2 3.2-5 6.2-5s5.4 1.8 6.2 5" />
    <circle cx="17" cy="9" r="2.6" />
    <path d="M16.4 15.2c2.6.2 4.3 1.8 4.9 4.3" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 15a1.6 1.6 0 0 0 .32 1.77l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.77-.32 1.6 1.6 0 0 0-1 1.47V21a2 2 0 1 1-4 0v-.11a1.6 1.6 0 0 0-1.05-1.47 1.6 1.6 0 0 0-1.77.32l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.6 1.6 0 0 0 .32-1.77 1.6 1.6 0 0 0-1.47-1H3a2 2 0 1 1 0-4h.11a1.6 1.6 0 0 0 1.47-1.05 1.6 1.6 0 0 0-.32-1.77l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.6 1.6 0 0 0 1.77.32H9a1.6 1.6 0 0 0 1-1.47V3a2 2 0 1 1 4 0v.11a1.6 1.6 0 0 0 1 1.47 1.6 1.6 0 0 0 1.77-.32l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.6 1.6 0 0 0-.32 1.77V9a1.6 1.6 0 0 0 1.47 1H21a2 2 0 1 1 0 4h-.11a1.6 1.6 0 0 0-1.47 1z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="logout-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = useIsAdmin();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">T</div>
          <div className="brand-text">
            <div className="brand-name">
              Toyang's
              <br />
              Inventory
            </div>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/" end className={navLinkClass}>
            <DashboardIcon />
            <span className="nav-label">Dashboard</span>
            <span className="nav-tiny">Home</span>
          </NavLink>
          <NavLink to="/items" className={navLinkClass}>
            <ItemsIcon />
            <span className="nav-label">Items</span>
            <span className="nav-tiny">Items</span>
          </NavLink>
          <NavLink to="/inventory" className={navLinkClass}>
            <InventoryIcon />
            <span className="nav-label">Inventory</span>
            <span className="nav-tiny">Stock</span>
          </NavLink>
          <NavLink to="/reports" className={navLinkClass}>
            <ReportsIcon />
            <span className="nav-label">Reports</span>
            <span className="nav-tiny">Reports</span>
          </NavLink>
          {isAdmin && (
            <NavLink to="/cashiers" className={navLinkClass}>
              <CashiersIcon />
              <span className="nav-label">Cashiers</span>
              <span className="nav-tiny">Cashiers</span>
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/settings" className={navLinkClass}>
              <SettingsIcon />
              <span className="nav-label">Settings</span>
              <span className="nav-tiny">Settings</span>
            </NavLink>
          )}
        </nav>

        <div className="sidebar-foot">
          <div className="user-chip">
            <div className="user-name">{user?.name ?? 'Signed in'}</div>
            <div className="user-role">{user?.role ?? '—'}</div>
          </div>
          <button className="btn btn-ghost btn-logout" onClick={handleLogout}>
            <span className="logout-label">Log out</span>
            <LogoutIcon />
          </button>
        </div>
      </aside>

      <div className="page-wrap">
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
