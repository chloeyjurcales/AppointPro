import { useState } from 'react';
import './NotificationsView.css';

type NotificationType =
  | 'appointment'
  | 'schedule'
  | 'student'
  | 'system'
  | 'reminder';

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  unread: boolean;
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'new-appointment',
    type: 'appointment',
    title: 'New Appointment',
    message: 'Maria Clara has booked an appointment.',
    time: '8:30 AM',
    unread: true,
  },
  {
    id: 'reschedule-request',
    type: 'schedule',
    title: 'Reschedule Request',
    message: 'John Doe requested to reschedule.',
    time: '10:20 AM',
    unread: true,
  },
  {
    id: 'new-group-update',
    type: 'student',
    title: 'New Group Update',
    message: 'Faculty meeting on Sep 16, 2026.',
    time: '11:45 AM',
    unread: true,
  },
  {
    id: 'system-update',
    type: 'system',
    title: 'System Update',
    message: 'The system will be offline tonight.',
    time: '5:00 PM',
    unread: false,
  },
  {
    id: 'reminder',
    type: 'reminder',
    title: 'Reminder',
    message: 'You have 3 appointments tomorrow.',
    time: '11:30 AM',
    unread: false,
  },
];

export default function NotificationsView() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        unread: false,
      })),
    );
  };

  const unreadCount = notifications.filter(
    (notification) => notification.unread,
  ).length;

  return (
    <section className="nv-page" aria-labelledby="notifications-heading">
      <div className="nv-notifications-card">
        <div className="nv-card-heading">
          <div>
            <h1 id="notifications-heading">Notifications</h1>
            <p>
              {unreadCount > 0
                ? `${unreadCount} unread notifications`
                : 'You are all caught up.'}
            </p>
          </div>

          <button
            type="button"
            className="nv-mark-read"
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>
        </div>

        <div className="nv-notification-list">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`nv-notification${
                notification.unread ? ' nv-notification-unread' : ''
              }`}
            >
              <span className="nv-notification-icon" aria-hidden="true">
                <NotificationIcon type={notification.type} />
              </span>

              <div className="nv-notification-copy">
                <h2>{notification.title}</h2>
                <p>{notification.message}</p>
              </div>

              <time>{notification.time}</time>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function NotificationIcon({ type }: { type: NotificationType }) {
  if (type === 'appointment') return <BellIcon />;
  if (type === 'schedule') return <CalendarIcon />;
  if (type === 'student') return <UsersIcon />;
  if (type === 'system') return <InfoIcon />;
  return <ReminderIcon />;
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M6.5 10a5.5 5.5 0 1 1 11 0c0 3.7 1.5 5.2 1.5 5.2H5S6.5 13.7 6.5 10Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M10.2 18a2 2 0 0 0 3.6 0"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <rect
        x="3.5"
        y="5.5"
        width="17"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M3.5 9.5h17M8 3.5v4M16 3.5v4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
      <circle
        cx="17"
        cy="9"
        r="2.3"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M3 20c.8-3.6 3.3-5.5 6-5.5s5.2 1.9 6 5.5M15.7 14.8c2.1.4 3.6 2 4.2 4.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M12 10.5v5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="7.3" r="1" fill="currentColor" />
    </svg>
  );
}

function ReminderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M7 3.5h10v17H7z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 8h5M9.5 12h5M9.5 16h3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}