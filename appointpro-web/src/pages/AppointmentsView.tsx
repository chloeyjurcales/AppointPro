import { useMemo, useState } from 'react';
import './AppointmentsView.css';

type AppointmentStatus = 'Upcoming' | 'Completed' | 'Cancelled';

type Appointment = {
  id: string;
  date: string;
  time: string;
  studentName: string;
  reason: string;
  status: AppointmentStatus;
};

type TabId = 'all' | 'upcoming' | 'completed' | 'cancelled';

const APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    date: 'Sep 7, 2026',
    time: '10:00 AM - 10:30 AM',
    studentName: 'Maria Clara',
    reason: 'Academic Advising',
    status: 'Upcoming',
  },
  {
    id: '2',
    date: 'Sep 8, 2026',
    time: '11:30 AM - 12:00 PM',
    studentName: 'John Doe',
    reason: 'Faculty Consultation',
    status: 'Upcoming',
  },
  {
    id: '3',
    date: 'Sep 9, 2026',
    time: '2:00 PM - 2:30 PM',
    studentName: 'Anna Reyes',
    reason: 'Thesis Consultation',
    status: 'Completed',
  },
  {
    id: '4',
    date: 'Sep 16, 2026',
    time: '1:00 PM - 1:30 PM',
    studentName: 'James Santos',
    reason: 'Course Inquiry',
    status: 'Completed',
  },
  {
    id: '5',
    date: 'Sep 12, 2026',
    time: '2:00 PM - 2:30 PM',
    studentName: 'Lisa Garcia',
    reason: 'Academic Advising',
    status: 'Cancelled',
  },
];

export default function AppointmentsView() {
  const [activeTab, setActiveTab] = useState<TabId>('all');

  const counts = useMemo(
    () => ({
      all: APPOINTMENTS.length,
      upcoming: APPOINTMENTS.filter((a) => a.status === 'Upcoming').length,
      completed: APPOINTMENTS.filter((a) => a.status === 'Completed').length,
      cancelled: APPOINTMENTS.filter((a) => a.status === 'Cancelled').length,
    }),
    [],
  );

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
    { id: 'completed', label: 'Completed', count: counts.completed },
    { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
  ];

  const filtered =
    activeTab === 'all'
      ? APPOINTMENTS
      : APPOINTMENTS.filter((a) => a.status.toLowerCase() === activeTab);

  const handleNewAppointment = () => {
    window.alert('The new-appointment form is not built yet.');
  };

  const handleEdit = (appt: Appointment) => {
    window.alert(`Editing "${appt.studentName}" isn't wired up yet.`);
  };

  const handleDelete = (appt: Appointment) => {
    window.alert(`Deleting "${appt.studentName}" isn't wired up yet.`);
  };

  const handleMore = (appt: Appointment) => {
    window.alert(`More options for "${appt.studentName}" aren't wired up yet.`);
  };

  return (
    <div className="av-page">
      <div className="av-header">
        <div>
          <h1>Appointments</h1>
          <p>View and manage your appointments.</p>
        </div>

        <button
          type="button"
          className="av-new-btn"
          onClick={handleNewAppointment}
        >
          <PlusIcon />
          New Appointment
        </button>
      </div>

      <div className="av-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`av-tab${
              activeTab === tab.id ? ' av-tab-active' : ''
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="av-table-card">
        <table className="av-table">
          <thead>
            <tr>
              <th>Date &amp; Time</th>
              <th>Student</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((appt) => (
              <tr key={appt.id}>
                <td>
                  <div className="av-datetime">
                    <span className="av-date">{appt.date}</span>
                    <span className="av-time">{appt.time}</span>
                  </div>
                </td>

                <td className="av-student">
                  {appt.studentName}
                </td>

                <td className="av-reason">
                  {appt.reason}
                </td>

                <td>
                  <span
                    className={`av-status av-status-${appt.status.toLowerCase()}`}
                  >
                    {appt.status}
                  </span>
                </td>

                <td>
                  <div className="av-actions">
                    <button
                      type="button"
                      className="av-action-btn"
                      aria-label={`Edit ${appt.studentName}`}
                      onClick={() => handleEdit(appt)}
                    >
                      <EditIcon />
                    </button>

                    <button
                      type="button"
                      className="av-action-btn"
                      aria-label={`Delete ${appt.studentName}`}
                      onClick={() => handleDelete(appt)}
                    >
                      <DeleteIcon />
                    </button>

                    <button
                      type="button"
                      className="av-action-btn"
                      aria-label={`More options for ${appt.studentName}`}
                      onClick={() => handleMore(appt)}
                    >
                      <MoreIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="av-empty">
                  <div className="av-empty-inner">
                    <span
                      className="av-empty-icon"
                      aria-hidden="true"
                    >
                      <CalendarEmptyIcon />
                    </span>

                    <span className="av-empty-title">
                      No appointments in this category
                    </span>

                    <span className="av-empty-subtitle">
                      New bookings will show up here as students schedule
                      them.
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="av-footer">
          Showing {filtered.length === 0 ? 0 : 1}-{filtered.length} of{' '}
          {filtered.length}
        </div>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20h9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.7 12.1a2 2 0 0 1-2 1.9H8.7a2 2 0 0 1-2-1.9L6 7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarEmptyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect
        x="3.5"
        y="5.5"
        width="17"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />

      <path
        d="M3.5 9.5h17M8 3.5v4M16 3.5v4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      <path
        d="M9 14.5h6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="5"
        r="1.6"
        fill="currentColor"
      />

      <circle
        cx="12"
        cy="12"
        r="1.6"
        fill="currentColor"
      />

      <circle
        cx="12"
        cy="19"
        r="1.6"
        fill="currentColor"
      />
    </svg>
  );
}