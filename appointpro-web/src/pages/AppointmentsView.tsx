import { useEffect, useMemo, useState } from 'react';
import './AppointmentsView.css';

type AppointmentStatus = 'Upcoming' | 'Completed' | 'Cancelled';

type MeetingMode = 'Face-to-Face' | 'Online';

type Appointment = {
  id: string;
  date: string;
  time: string;
  studentName: string;
  studentInfo: string;
  reason: string;
  status: AppointmentStatus;
  mode: MeetingMode;
  location: string;
  // Real Date fields power the reminder/queue features below. `startsAt` is
  // this student's own turn start; `blockStart`/`blockEnd` describe the
  // underlying faculty schedule block the appointment falls in (e.g. a
  // "9:00–10:00 AM" slot several students can share).
  startsAt: Date;
  durationMinutes: number;
  blockStart: Date;
  blockEnd: Date;
};

type TabId = 'all' | 'upcoming' | 'completed' | 'cancelled';

type ModalState =
  | { type: 'none' }
  | { type: 'cancel'; appointment: Appointment }
  | { type: 'reschedule'; appointment: Appointment };

type QueueGroup = {
  blockKey: string;
  blockStart: Date;
  blockEnd: Date;
  entries: Appointment[];
};

function pad2(value: number): string {
  return value.toString().padStart(2, '0');
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

// "2:30 PM" from a real Date, for the live-queue/reminder copy.
function formatClockTime(date: Date): string {
  let hour = date.getHours();
  const minute = date.getMinutes();
  const period = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${pad2(minute)} ${period}`;
}

// ---------- Queue timing (mirrors the mobile app's data/queue.ts) ----------

// Fallback shown in the queue stats card — matches the mobile app's own
// constant, used purely as a general average, not derived from live data.
const AVERAGE_WAIT_MINUTES_PER_STUDENT = 10;

// "5:09" from a total seconds count, for a live mm:ss countdown.
function formatCountdown(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${pad2(seconds)}`;
}

// Seconds left in the current student's turn, counting down from the
// moment their turn actually started (which may be earlier than scheduled
// if the previous student finished early).
function getRemainingSeconds(
  turnStartedAt: Date,
  durationMinutes: number,
  now: Date,
): number {
  const elapsedSeconds = Math.floor(
    (now.getTime() - turnStartedAt.getTime()) / 1000,
  );
  return Math.max(durationMinutes * 60 - elapsedSeconds, 0);
}

// Total estimated wait, in seconds, before the student at `index` in the
// group gets called: whatever time is left on whoever's being served now,
// plus the full reserved duration of everyone else ahead of them.
function getEstimatedWaitSeconds(
  group: QueueGroup,
  index: number,
  currentRemainingSeconds: number,
): number {
  if (index <= 0) return 0;
  let total = currentRemainingSeconds;
  for (let i = 1; i < index; i += 1) {
    total += group.entries[i].durationMinutes * 60;
  }
  return total;
}

function formatDateLabelFromDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Placeholder data — replace with real Supabase queries once the
// appointments table exists (same convention as Dashboard.tsx). Seeded
// relative to "now" so the reminder and live-queue demo below is always
// visible no matter when this page is opened.
function buildInitialAppointments(now: Date): Appointment[] {
  // A 60-minute schedule block that started 10 minutes ago, so there's
  // always a live queue to demonstrate: student 1 is 10 min into their
  // 30-min turn (20 min left), student 2 is still waiting.
  const liveBlockStart = addMinutes(now, -10);
  const liveBlockEnd = addMinutes(liveBlockStart, 60);

  // A second block starting in ~58 minutes, to demonstrate the "1 hour
  // before" reminder immediately on load.
  const soonStart = addMinutes(now, 58);
  const soonEnd = addMinutes(soonStart, 30);

  const pastCompleted = addMinutes(now, -2 * 24 * 60);
  const pastCancelled = addMinutes(now, -5 * 24 * 60);
  const farFuture = addMinutes(now, 3 * 24 * 60);

  const build = (
    id: string,
    studentName: string,
    studentInfo: string,
    reason: string,
    status: AppointmentStatus,
    startsAt: Date,
    durationMinutes: number,
    blockStart: Date,
    blockEnd: Date,
    mode: MeetingMode,
    location: string,
  ): Appointment => ({
    id,
    studentName,
    studentInfo,
    reason,
    status,
    mode,
    location,
    date: formatDateLabelFromDate(startsAt),
    time: `${formatClockTime(startsAt)} - ${formatClockTime(
      addMinutes(startsAt, durationMinutes),
    )}`,
    startsAt,
    durationMinutes,
    blockStart,
    blockEnd,
  });

  return [
    build(
      '1',
      'Maria Clara',
      'BSIT-3A · Student ID 2023-00456',
      'Academic Advising',
      'Upcoming',
      liveBlockStart,
      30,
      liveBlockStart,
      liveBlockEnd,
      'Face-to-Face',
      'Room 305, CITE Building',
    ),
    build(
      '2',
      'John Doe',
      'BSCS-2B · Student ID 2023-00812',
      'Faculty Consultation',
      'Upcoming',
      addMinutes(liveBlockStart, 30),
      30,
      liveBlockStart,
      liveBlockEnd,
      'Online',
      'https://meet.google.com/abc-defg-hij',
    ),
    build(
      '3',
      'Anna Reyes',
      'BSIT-4A · Student ID 2022-00193',
      'Thesis Consultation',
      'Upcoming',
      soonStart,
      30,
      soonStart,
      soonEnd,
      'Face-to-Face',
      'Room 305, CITE Building',
    ),
    build(
      '4',
      'James Santos',
      'BSCS-3A · Student ID 2023-00214',
      'Course Inquiry',
      'Completed',
      pastCompleted,
      30,
      pastCompleted,
      addMinutes(pastCompleted, 60),
      'Face-to-Face',
      'Room 305, CITE Building',
    ),
    build(
      '5',
      'Lisa Garcia',
      'BSIT-2A · Student ID 2024-00087',
      'Academic Advising',
      'Cancelled',
      pastCancelled,
      30,
      pastCancelled,
      addMinutes(pastCancelled, 60),
      'Online',
      'https://meet.google.com/xyz-uvwx-rst',
    ),
    build(
      '6',
      'Miguel Torres',
      'BSCS-4B · Student ID 2022-00341',
      'Grade Concern',
      'Upcoming',
      farFuture,
      30,
      farFuture,
      addMinutes(farFuture, 60),
      'Face-to-Face',
      'Room 305, CITE Building',
    ),
  ];
}

// Converts an <input type="date"> value ("2026-09-07") into the same
// display format the mock data uses ("Sep 7, 2026").
function formatDateLabel(value: string): string {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Converts an <input type="time"> value ("14:30") into "2:30 PM".
function formatTimeLabel(value: string): string {
  const [hourStr, minuteStr] = value.split(':');
  let hour = Number(hourStr);
  const minute = Number(minuteStr);
  const period = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
}

// Combines <input type="date"> + <input type="time"> values into a real
// Date, so a rescheduled appointment keeps working with the reminder and
// live-queue features below.
function combineDateAndTime(dateValue: string, timeValue: string): Date {
  const [year, month, day] = dateValue.split('-').map(Number);
  const [hour, minute] = timeValue.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

export default function AppointmentsView() {
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    buildInitialAppointments(new Date()),
  );
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [modal, setModal] = useState<ModalState>({ type: 'none' });

  const [cancelReason, setCancelReason] = useState('');

  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleStart, setRescheduleStart] = useState('');
  const [rescheduleEnd, setRescheduleEnd] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduleMode, setRescheduleMode] = useState<MeetingMode>(
    'Face-to-Face',
  );
  const [rescheduleMeetingLink, setRescheduleMeetingLink] = useState('');

  // ---------- Reminders + live queue ----------
  // `now` ticks every 15s so "starts in 1 hour" / "starting now" reminders
  // and the live-queue block stay accurate without needing a page refresh.
  const [now, setNow] = useState(() => new Date());
  const [dismissedReminders, setDismissedReminders] = useState<Set<string>>(
    new Set(),
  );
  const [turnStartedAt, setTurnStartedAt] = useState<Record<string, Date>>({});
  const [queueNotice, setQueueNotice] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const queueGroups = useMemo<QueueGroup[]>(() => {
    const groups = new Map<string, QueueGroup>();

    appointments
      .filter((appt) => appt.status === 'Upcoming')
      .forEach((appt) => {
        const key = `${appt.blockStart.getTime()}-${appt.blockEnd.getTime()}`;
        const existing = groups.get(key);
        if (existing) {
          existing.entries.push(appt);
        } else {
          groups.set(key, {
            blockKey: key,
            blockStart: appt.blockStart,
            blockEnd: appt.blockEnd,
            entries: [appt],
          });
        }
      });

    return Array.from(groups.values()).sort(
      (a, b) => a.blockStart.getTime() - b.blockStart.getTime(),
    );
  }, [appointments]);

  const liveGroups = useMemo(
    () => queueGroups.filter((g) => now >= g.blockStart && now < g.blockEnd),
    [queueGroups, now],
  );

  const reminders = useMemo(() => {
    const list: { key: string; message: string }[] = [];

    appointments.forEach((appt) => {
      if (appt.status !== 'Upcoming') return;
      const minutesUntil = (appt.startsAt.getTime() - now.getTime()) / 60000;

      const oneHourKey = `${appt.id}-1hr`;
      const startKey = `${appt.id}-start`;

      if (
        minutesUntil <= 60 &&
        minutesUntil > 50 &&
        !dismissedReminders.has(oneHourKey)
      ) {
        list.push({
          key: oneHourKey,
          message: `Reminder: ${appt.studentName}'s appointment starts in about 1 hour (${formatClockTime(
            appt.startsAt,
          )}).`,
        });
      }

      if (
        minutesUntil <= 0 &&
        minutesUntil > -10 &&
        !dismissedReminders.has(startKey)
      ) {
        list.push({
          key: startKey,
          message: `${appt.studentName}'s appointment is starting now.`,
        });
      }
    });

    return list;
  }, [appointments, now, dismissedReminders]);

  const dismissReminder = (key: string) => {
    setDismissedReminders((prev) => new Set(prev).add(key));
  };

  const advanceQueue = (group: QueueGroup, current: Appointment) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === current.id ? { ...a, status: 'Completed' } : a)),
    );
    setTurnStartedAt((prev) => ({ ...prev, [group.blockKey]: new Date() }));

    const remaining = group.entries.filter((entry) => entry.id !== current.id);
    setQueueNotice(
      remaining.length > 0
        ? `${remaining[0].studentName} has been notified — their turn has started.`
        : 'Queue complete for this time block.',
    );
  };

  const counts = useMemo(
    () => ({
      all: appointments.length,
      upcoming: appointments.filter((a) => a.status === 'Upcoming').length,
      completed: appointments.filter((a) => a.status === 'Completed').length,
      cancelled: appointments.filter((a) => a.status === 'Cancelled').length,
    }),
    [appointments],
  );

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
    { id: 'completed', label: 'Completed', count: counts.completed },
    { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
  ];

  const filtered =
    activeTab === 'all'
      ? appointments
      : appointments.filter((a) => a.status.toLowerCase() === activeTab);

  // This action has no backend wired up yet — swap the alert for a real
  // handler (open a modal, call Supabase, etc.) once that's ready.
  const handleNewAppointment = () => {
    window.alert('The new-appointment form is not built yet.');
  };

  const closeModal = () => setModal({ type: 'none' });

  const openCancel = (appointment: Appointment) => {
    setCancelReason('');
    setModal({ type: 'cancel', appointment });
  };

  const openReschedule = (appointment: Appointment) => {
    setRescheduleDate('');
    setRescheduleStart('');
    setRescheduleEnd('');
    setRescheduleReason('');
    setRescheduleMode(appointment.mode);
    setRescheduleMeetingLink('');
    setModal({ type: 'reschedule', appointment });
  };

  const confirmCancel = () => {
    if (modal.type !== 'cancel' || !cancelReason.trim()) return;

    const { id } = modal.appointment;
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Cancelled' } : a)),
    );
    closeModal();
  };

  const canConfirmReschedule =
    modal.type === 'reschedule' &&
    !!rescheduleDate &&
    !!rescheduleStart &&
    !!rescheduleEnd &&
    rescheduleReason.trim().length > 0 &&
    (rescheduleMode !== 'Online' || rescheduleMeetingLink.trim().length > 0);

  const confirmReschedule = () => {
    if (modal.type !== 'reschedule' || !canConfirmReschedule) return;

    const { id, durationMinutes, location } = modal.appointment;
    const newDate = formatDateLabel(rescheduleDate);
    const newTime = `${formatTimeLabel(rescheduleStart)} - ${formatTimeLabel(
      rescheduleEnd,
    )}`;
    const newStartsAt = combineDateAndTime(rescheduleDate, rescheduleStart);
    const newLocation =
      rescheduleMode === 'Online' ? rescheduleMeetingLink.trim() : location;

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              date: newDate,
              time: newTime,
              startsAt: newStartsAt,
              mode: rescheduleMode,
              location: newLocation,
              // Rescheduling moves the student out of their old shared
              // block into a standalone slot of their own.
              blockStart: newStartsAt,
              blockEnd: addMinutes(newStartsAt, durationMinutes),
            }
          : a,
      ),
    );
    closeModal();
  };

  return (
    <div className="av-page">
      <div className="av-header">
        <div>
          <h1>Appointments</h1>
          <p>View and manage your appointments.</p>
        </div>
        <button type="button" className="av-new-btn" onClick={handleNewAppointment}>
          <PlusIcon />
          New Appointment
        </button>
      </div>

      {reminders.length > 0 && (
        <div className="av-reminders">
          {reminders.map((reminder) => (
            <div key={reminder.key} className="av-reminder-banner">
              <BellIcon />
              <span>{reminder.message}</span>
              <button
                type="button"
                aria-label="Dismiss reminder"
                onClick={() => dismissReminder(reminder.key)}
              >
                <XSmallIcon />
              </button>
            </div>
          ))}
        </div>
      )}

      {queueNotice && (
        <div className="av-queue-toast">
          <CheckSmallIcon />
          <span>{queueNotice}</span>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setQueueNotice(null)}
          >
            <XSmallIcon />
          </button>
        </div>
      )}

      {liveGroups.length > 0 && (
        <div className="av-queue-section">
          {liveGroups.map((group) => {
            const current = group.entries[0];
            const upcomingInQueue = group.entries.slice(1);
            const turnStart = turnStartedAt[group.blockKey] ?? group.blockStart;
            const currentRemainingSeconds = getRemainingSeconds(
              turnStart,
              current.durationMinutes,
              now,
            );

            return (
              <div key={group.blockKey} className="av-queue-card">
                <div className="av-queue-card-header">
                  <span className="av-queue-live-dot" />
                  <h2>
                    Live Queue · {formatClockTime(group.blockStart)} –{' '}
                    {formatClockTime(group.blockEnd)}
                  </h2>
                </div>

                <div className="av-queue-stats-row">
                  <div className="av-queue-stat">
                    <span className="av-queue-stat-number">
                      {group.entries.length}
                    </span>
                    <span className="av-queue-stat-label">Waiting</span>
                  </div>
                  <div className="av-queue-stat">
                    <span className="av-queue-stat-number">
                      {AVERAGE_WAIT_MINUTES_PER_STUDENT}
                    </span>
                    <span className="av-queue-stat-label">
                      Avg. min/student
                    </span>
                  </div>
                </div>

                <div className="av-queue-current">
                  <span className="av-queue-current-badge">
                    Now Serving · #1
                  </span>
                  <p className="av-queue-current-name">
                    {current.studentName}
                  </p>
                  <p className="av-queue-current-info">
                    {current.studentInfo}
                  </p>
                  <p className="av-queue-current-reason">{current.reason}</p>
                  <p className="av-queue-current-timer">
                    Allotted {current.durationMinutes} min ·{' '}
                    {formatCountdown(currentRemainingSeconds)} remaining
                  </p>
                  <button
                    type="button"
                    className="av-queue-done-btn"
                    onClick={() => advanceQueue(group, current)}
                  >
                    <CheckSmallIcon /> Done — Next Student
                  </button>
                </div>

                {upcomingInQueue.length > 0 && (
                  <div className="av-queue-waiting-list">
                    <p className="av-queue-waiting-title">Waiting</p>
                    {upcomingInQueue.map((entry, index) => {
                      const estimatedWaitSeconds = getEstimatedWaitSeconds(
                        group,
                        index + 1,
                        currentRemainingSeconds,
                      );

                      return (
                        <div key={entry.id} className="av-queue-waiting-row">
                          <span className="av-queue-number">
                            #{index + 2}
                          </span>
                          <span className="av-queue-waiting-name">
                            {entry.studentName}
                          </span>
                          <span className="av-queue-waiting-duration">
                            {formatCountdown(estimatedWaitSeconds)} wait
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="av-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`av-tab${activeTab === tab.id ? ' av-tab-active' : ''}`}
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
                <td className="av-student">{appt.studentName}</td>
                <td className="av-reason">{appt.reason}</td>
                <td>
                  <span
                    className={`av-status av-status-${appt.status.toLowerCase()}`}
                  >
                    {appt.status}
                  </span>
                </td>
                <td>
                  {appt.status === 'Upcoming' ? (
                    <div className="av-actions">
                      <button
                        type="button"
                        className="av-row-btn"
                        onClick={() => openReschedule(appt)}
                      >
                        Reschedule
                      </button>
                      <button
                        type="button"
                        className="av-row-btn av-row-btn-danger"
                        onClick={() => openCancel(appt)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="av-actions">
                      <span className="av-actions-muted">—</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="av-empty">
                  <div className="av-empty-inner">
                    <span className="av-empty-icon" aria-hidden="true">
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

      {modal.type !== 'none' && (
        <div className="av-modal-overlay" onClick={closeModal}>
          <div
            className="av-modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            {modal.type === 'cancel' && (
              <>
                <h2>Cancel Appointment</h2>

                <div className="av-modal-summary">
                  <p className="av-modal-summary-name">
                    {modal.appointment.studentName}
                  </p>
                  <p className="av-modal-summary-line">
                    {modal.appointment.date} · {modal.appointment.time}
                  </p>
                  <p className="av-modal-summary-muted">
                    {modal.appointment.reason}
                  </p>
                </div>

                <label className="av-modal-label" htmlFor="av-cancel-reason">
                  Reason for Cancellation
                </label>
                <textarea
                  id="av-cancel-reason"
                  className="av-modal-textarea"
                  rows={4}
                  placeholder="e.g. Faculty unavailable, emergency..."
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                />

                <div className="av-modal-warning">
                  <AlertIcon />
                  <p>
                    The student will be notified immediately once this
                    appointment is cancelled.
                  </p>
                </div>

                <div className="av-modal-actions">
                  <button
                    type="button"
                    className="av-modal-btn av-modal-btn-danger"
                    disabled={!cancelReason.trim()}
                    onClick={confirmCancel}
                  >
                    Cancel Appointment
                  </button>
                  <button
                    type="button"
                    className="av-modal-btn av-modal-btn-secondary"
                    onClick={closeModal}
                  >
                    Keep Appointment
                  </button>
                </div>
              </>
            )}

            {modal.type === 'reschedule' && (
              <>
                <h2>Reschedule Appointment</h2>

                <div className="av-modal-summary">
                  <p className="av-modal-summary-name">
                    {modal.appointment.studentName}
                  </p>
                  <p className="av-modal-summary-line">
                    Currently: {modal.appointment.date} ·{' '}
                    {modal.appointment.time}
                  </p>
                  <p className="av-modal-summary-muted">
                    {modal.appointment.reason}
                  </p>
                  <p className="av-modal-summary-muted">
                    {modal.appointment.mode} · {modal.appointment.location}
                  </p>
                </div>

                <div className="av-modal-field">
                  <label htmlFor="av-res-date">New Date</label>
                  <input
                    id="av-res-date"
                    type="date"
                    value={rescheduleDate}
                    onChange={(event) => setRescheduleDate(event.target.value)}
                  />
                </div>

                <div className="av-modal-field-row">
                  <div className="av-modal-field">
                    <label htmlFor="av-res-start">Start Time</label>
                    <input
                      id="av-res-start"
                      type="time"
                      value={rescheduleStart}
                      onChange={(event) =>
                        setRescheduleStart(event.target.value)
                      }
                    />
                  </div>
                  <div className="av-modal-field">
                    <label htmlFor="av-res-end">End Time</label>
                    <input
                      id="av-res-end"
                      type="time"
                      value={rescheduleEnd}
                      onChange={(event) => setRescheduleEnd(event.target.value)}
                    />
                  </div>
                </div>

                <label className="av-modal-label" htmlFor="av-res-mode-ftf">
                  New Meeting Mode
                </label>
                <div className="av-modal-mode-toggle">
                  <button
                    type="button"
                    id="av-res-mode-ftf"
                    className={`av-modal-mode-btn${
                      rescheduleMode === 'Face-to-Face'
                        ? ' av-modal-mode-btn-active'
                        : ''
                    }`}
                    onClick={() => setRescheduleMode('Face-to-Face')}
                  >
                    Face-to-Face
                  </button>
                  <button
                    type="button"
                    className={`av-modal-mode-btn${
                      rescheduleMode === 'Online'
                        ? ' av-modal-mode-btn-active'
                        : ''
                    }`}
                    onClick={() => setRescheduleMode('Online')}
                  >
                    Online
                  </button>
                </div>

                {rescheduleMode === 'Online' && (
                  <>
                    <label className="av-modal-label" htmlFor="av-res-link">
                      New Meeting Link
                    </label>
                    <input
                      id="av-res-link"
                      type="url"
                      className="av-modal-link-input"
                      placeholder="e.g. https://meet.google.com/abc-defg-hij"
                      value={rescheduleMeetingLink}
                      onChange={(event) =>
                        setRescheduleMeetingLink(event.target.value)
                      }
                    />
                    <p className="av-modal-link-hint">
                      This appointment moved to an online slot — the student
                      needs a fresh link since the old one no longer applies.
                    </p>
                  </>
                )}

                <label className="av-modal-label" htmlFor="av-res-reason">
                  Reason for Reschedule
                </label>
                <textarea
                  id="av-res-reason"
                  className="av-modal-textarea"
                  rows={3}
                  placeholder="e.g. Schedule conflict, emergency..."
                  value={rescheduleReason}
                  onChange={(event) =>
                    setRescheduleReason(event.target.value)
                  }
                />

                <div className="av-modal-actions">
                  <button
                    type="button"
                    className="av-modal-btn av-modal-btn-primary"
                    disabled={!canConfirmReschedule}
                    onClick={confirmReschedule}
                  >
                    Confirm Reschedule
                  </button>
                  <button
                    type="button"
                    className="av-modal-btn av-modal-btn-secondary"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* Small inline icons so this component has zero extra icon-library
   dependencies (same convention as Dashboard.tsx / LoginPage.tsx). */

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

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 7.5v5.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.3" r="1" fill="currentColor" />
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

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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

function CheckSmallIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12.5l4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XSmallIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}