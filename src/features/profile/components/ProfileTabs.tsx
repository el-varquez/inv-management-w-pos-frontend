import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/profile', label: 'Profile', end: true },
  { to: '/profile/billing', label: 'Billing', end: false },
];

export const ProfileTabs = () => (
  <div className="subnav">
    {tabs.map((tab) => (
      <NavLink
        key={tab.to}
        to={tab.to}
        end={tab.end}
        className={({ isActive }) =>
          isActive ? 'subnav-link is-active' : 'subnav-link'
        }
      >
        {tab.label}
      </NavLink>
    ))}
  </div>
);
