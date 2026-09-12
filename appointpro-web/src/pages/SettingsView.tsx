import { type ReactElement } from 'react';
import { usePersistentState } from '../lib/usePersistentState';
import './SettingsView.css';

type ToggleKey = 'pushNotifications' | 'emailNotifications' | 'notificationSound';

type ToggleRow = {
  key: ToggleKey;
  label: string;
  description: string;
  icon: () => ReactElement;
};

// Push/Email aren't backed by a real notifications backend in this demo,
// so they're local-only — flipping them just moves the toggle, same as
// the mobile app's SettingsScreen.
const TOGGLE_ROWS: ToggleRow[] = [
  {
    key: 'pushNotifications',
    label: 'Push Notifications',
    description:
      'Get notified about appointments, reschedules, and queue updates.',
    icon: BellIcon,
  },
  {
    key: 'emailNotifications',
    label: 'Email Notifications',
    description: 'Receive a copy of important updates by email.',
    icon: MailIcon,
  },
  {
    key: 'notificationSound',
    label: 'Notification Sound',
    description: 'Play a sound when a new notification arrives.',
    icon: VolumeIcon,
  },
];

export default function SettingsView() {
  const [values, setValues] = usePersistentState<Record<ToggleKey, boolean>>(
    'appointpro.notificationSettings',
    {
      pushNotifications: true,
      emailNotifications: true,
      notificationSound: true,
    },
  );

  const toggle = (key: ToggleKey) => {
    setValues((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="sv-page">
      <div className="sv-header">
        <h1>Settings</h1>
        <p>Manage how AppointPro notifies you.</p>
      </div>

      <div className="sv-card">
        <h2>Notifications</h2>

        {TOGGLE_ROWS.map((row) => (
          <div key={row.key} className="sv-row">
            <span className="sv-row-icon" aria-hidden="true">
              <row.icon />
            </span>

            <div className="sv-row-text">
              <p className="sv-row-label">{row.label}</p>
              <p className="sv-row-description">{row.description}</p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={values[row.key]}
              aria-label={row.label}
              className={`sv-toggle${values[row.key] ? ' sv-toggle-on' : ''}`}
              onClick={() => toggle(row.key)}
            >
              <span className="sv-toggle-knob" />
            </button>
          </div>
        ))}
      </div>

      <div className="sv-about-card">
        <div className="sv-about-logo">AP</div>
        <p className="sv-about-version">Version 1.0.0</p>
        <p className="sv-about-description">
          AppointPro gives faculty a simple way to publish their
          availability, manage appointment requests, and handle walk-in
          queues.
        </p>
        <p className="sv-about-footer">
          © 2026 AppointPro. All rights reserved.
        </p>
      </div>
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 10.5a6 6 0 1 1 12 0v3.5l1.5 3H4.5l1.5-3v-3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M10 20a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect
        x="3.5"
        y="5.5"
        width="17"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M4.5 6.5 12 12.5l7.5-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 9.5h3.2L11 6v12l-3.8-3.5H4v-5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M15 9a3.5 3.5 0 0 1 0 6M17.3 6.7a7 7 0 0 1 0 10.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}