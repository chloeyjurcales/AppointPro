import { useState, type ReactElement } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import AppointmentsView from './AppointmentsView';
import './Dashboard.css';

type DashboardProps = {
  session: Session;
  /** Optional hook for wiring up real navigation later (router, tabs, etc). */
  onNavigate?: (section: NavId) => void;
  /**
   * Optional override for logging out. Defaults to a real Supabase
   * signOut, but the demo (no-credentials) session needs its own logic
   * since there's no real Supabase session to sign out of.
   */
  onLogout?: () => void | Promise<void>;
};

export type NavId =
  | 'home'
  | 'appointments'
  | 'faculty'
  | 'reports'
  | 'notifications'
  | 'settings'
  | 'help';

type NavItem = {
  id: NavId;
  label: string;
  icon: () => ReactElement;
  badge?: number;
};

type ScheduleItem = {
  id: string;
  time: string;
  studentName: string;
  type: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
};

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'appointments', label: 'Appointments', icon: AppointmentsIcon },
  { id: 'faculty', label: 'Faculty', icon: FacultyIcon },
  { id: 'reports', label: 'Reports', icon: ReportsIcon },
  { id: 'notifications', label: 'Notifications', icon: BellIcon, badge: 2 },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
  { id: 'help', label: 'Help Center', icon: HelpIcon },
];

// Placeholder data — replace with real Supabase queries once the
// appointments/queue tables exist.
const STATS = { total: 5, upcoming: 2, completed: 1, cancelled: 0 };

const TODAY_SCHEDULE: ScheduleItem[] = [
  {
    id: '1',
    time: '10:00 AM – 10:30 AM',
    studentName: 'Maria Clara',
    type: 'Academic Advising',
    status: 'Upcoming',
  },
  {
    id: '2',
    time: '11:30 AM – 12:00 PM',
    studentName: 'John Doe',
    type: 'Faculty Consultation',
    status: 'Upcoming',
  },
  {
    id: '3',
    time: '2:00 PM – 2:30 PM',
    studentName: 'Anna Reyes',
    type: 'Thesis Consultation',
    status: 'Completed',
  },
];

const QUOTE = 'Better conversations build a brighter future.';

export default function Dashboard({ session, onNavigate, onLogout }: DashboardProps) {
  const user = session.user;
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ?? user.email ?? '';
  const firstAndLast = fullName.trim().split(/\s+/).slice(0, 2).join(' ');
  const initials =
    firstAndLast
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

  const [activeNav, setActiveNav] = useState<NavId>('home');

  const handleNavClick = (id: NavId) => {
    setActiveNav(id);
    onNavigate?.(id);
  };

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    } else {
      await supabase.auth.signOut();
    }
  };

  return (
    <div className="db-page">
      {/* ---------- Sidebar ---------- */}
      <aside className="db-sidebar">
        <div className="db-sidebar-brand">
          <div className="db-sidebar-brand-mark">
            <CapIcon />
          </div>
          <span>AppointPro</span>
        </div>

        <nav className="db-nav">
          {NAV_ITEMS.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              type="button"
              className={`db-nav-item${activeNav === id ? ' db-nav-item-active' : ''}`}
              onClick={() => handleNavClick(id)}
            >
              <Icon />
              <span>{label}</span>
              {typeof badge === 'number' && badge > 0 && (
                <span className="db-nav-badge">{badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="db-sidebar-footer">
          <button
            type="button"
            className="db-sidebar-profile"
            onClick={handleLogout}
            title="Log out"
          >
            <span className="db-sidebar-avatar">{initials}</span>
            <span className="db-sidebar-profile-text">
              <span className="db-sidebar-profile-name">
                {firstAndLast || user.email}
              </span>
              <span className="db-sidebar-profile-role">Faculty</span>
            </span>
            <LogoutIcon />
          </button>
        </div>
      </aside>

      {/* ---------- Main column ---------- */}
      <div className="db-body">
        <header className="db-topbar">
          <div className="db-search">
            <SearchIcon />
            <input type="text" placeholder="Search..." />
          </div>
          <div className="db-topbar-icons">
            <button type="button" className="db-icon-btn" aria-label="Notifications">
              <BellIcon />
              <span className="db-icon-dot" />
            </button>
            <span className="db-avatar">{initials}</span>
          </div>
        </header>

        <main className="db-main">
          {activeNav === 'home' && (
            <>
              <div className="db-main-col">
                <section className="db-welcome">
                  <h1>Welcome, {firstAndLast || 'Faculty'}!</h1>
                  <p>Here&apos;s your schedule and upcoming appointments.</p>
                </section>

                <section className="db-stats">
                  <div className="db-stat-card">
                    <div className="db-stat-icon">
                      <AppointmentsIcon />
                    </div>
                    <span className="db-stat-value">{STATS.total}</span>
                    <span className="db-stat-label">Total Appointments</span>
                  </div>
                  <div className="db-stat-card">
                    <div className="db-stat-icon">
                      <ClockIcon />
                    </div>
                    <span className="db-stat-value">{STATS.upcoming}</span>
                    <span className="db-stat-label">Upcoming</span>
                  </div>
                  <div className="db-stat-card">
                    <div className="db-stat-icon">
                      <CheckIcon />
                    </div>
                    <span className="db-stat-value">{STATS.completed}</span>
                    <span className="db-stat-label">Completed</span>
                  </div>
                  <div className="db-stat-card">
                    <div className="db-stat-icon">
                      <CancelIcon />
                    </div>
                    <span className="db-stat-value">{STATS.cancelled}</span>
                    <span className="db-stat-label">Cancelled</span>
                  </div>
                </section>

                <section className="db-schedule-card">
                  <div className="db-schedule-header">
                    <h2>Today&apos;s Schedule</h2>
                    <button
                      type="button"
                      className="db-view-all"
                      onClick={() => handleNavClick('appointments')}
                    >
                      View All
                    </button>
                  </div>

                  {TODAY_SCHEDULE.length === 0 ? (
                    <p className="db-schedule-empty">
                      No appointments scheduled for today.
                    </p>
                  ) : (
                    <ul className="db-schedule-list">
                      {TODAY_SCHEDULE.map((item) => (
                        <li key={item.id} className="db-schedule-item">
                          <span className="db-schedule-time">{item.time}</span>
                          <span className="db-schedule-name">{item.studentName}</span>
                          <span className="db-schedule-type">{item.type}</span>
                          <span
                            className={`db-status-badge db-status-${item.status.toLowerCase()}`}
                          >
                            {item.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>

              <div className="db-right-rail">
                <CalendarCard />

                <div className="db-quote-card">
                  <QuoteIcon />
                  <p>&ldquo;{QUOTE}&rdquo;</p>
                </div>
              </div>
            </>
          )}

          {activeNav === 'appointments' && (
            <div className="db-main-col">
              <AppointmentsView />
            </div>
          )}

          {activeNav !== 'home' && activeNav !== 'appointments' && (
            <div className="db-main-col">
              <div className="db-placeholder">
                <h1>{NAV_ITEMS.find((item) => item.id === activeNav)?.label}</h1>
                <p>This section is coming soon.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ---------- Calendar widget ---------- */

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function CalendarCard() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const cells: { day: number; inMonth: boolean; isToday: boolean }[] = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, inMonth: false, isToday: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      day,
      inMonth: true,
      isToday:
        day === today.getDate() &&
        viewMonth === today.getMonth() &&
        viewYear === today.getFullYear(),
    });
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    cells.push({
      day: cells.length - (startOffset + daysInMonth) + 1,
      inMonth: false,
      isToday: false,
    });
  }

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  return (
    <div className="db-calendar-card">
      <div className="db-calendar-header">
        <button type="button" onClick={goPrevMonth} aria-label="Previous month">
          <ChevronLeftIcon />
        </button>
        <span>
          {MONTH_LABELS[viewMonth]} {viewYear}
        </span>
        <button type="button" onClick={goNextMonth} aria-label="Next month">
          <ChevronRightIcon />
        </button>
      </div>

      <div className="db-calendar-weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="db-calendar-grid">
        {cells.map((cell, i) => (
          <span
            key={i}
            className={`db-calendar-day${cell.inMonth ? '' : ' db-calendar-day-muted'}${
              cell.isToday ? ' db-calendar-day-today' : ''
            }`}
          >
            {cell.day}
          </span>
        ))}
      </div>
    </div>
  );
}

/* Small inline icons so this component has zero extra icon-library
   dependencies (the web app doesn't currently install one). */

function CapIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 3 1 8l11 5 9-4.09V17h2V8L12 3Z" fill="#ffffff" />
      <path
        d="M5 10.5V15c0 1.5 3 3.5 7 3.5s7-2 7-3.5v-4.5"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="m3 11 9-7 9 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AppointmentsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 9.5h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function FacultyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M15.5 14.8c2.3.3 4 1.9 4.6 4.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 20V10M11 20V4M18 20v-7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M10 18.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4.5a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H10.5a1.7 1.7 0 0 0 1-1.6V4.5a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V10.5a1.7 1.7 0 0 0 1.6 1h.2a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M9.5 9.2a2.5 2.5 0 1 1 3.7 2.2c-.8.5-1.2.9-1.2 1.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 15l4-3-4-3M18 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
      <path d="m21 21-4.3-4.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="m8 12.5 2.5 2.5L16 9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CancelIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="m9 9 6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 8c-2 0-3.5 1.5-3.5 3.7 0 2 1.3 3.4 3.1 3.4.4 0 .8-.1 1-.2C7.2 17 6 18.3 4.3 18.9l.6 1.3c3-1 4.8-3.4 4.8-6.6C9.7 10.7 8.6 8 7 8Z"
        fill="currentColor"
      />
      <path
        d="M16.3 8c-2 0-3.5 1.5-3.5 3.7 0 2 1.3 3.4 3.1 3.4.4 0 .8-.1 1-.2-.4 2.1-1.6 3.4-3.3 4l.6 1.3c3-1 4.8-3.4 4.8-6.6C19 10.7 17.9 8 16.3 8Z"
        fill="currentColor"
      />
    </svg>
  );
}