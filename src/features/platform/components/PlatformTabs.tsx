import { NavLink } from 'react-router-dom';

const tabs = [{ to: '/platform/tenants', label: 'Tenants' }];

export const PlatformTabs = () => (
  <div className="subnav">
    {tabs.map((tab) => (
      <NavLink
        key={tab.to}
        to={tab.to}
        className={({ isActive }) =>
          isActive ? 'subnav-link is-active' : 'subnav-link'
        }
      >
        {tab.label}
      </NavLink>
    ))}
  </div>
);
