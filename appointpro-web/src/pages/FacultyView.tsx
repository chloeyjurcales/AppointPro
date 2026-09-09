import { useMemo, useState } from 'react';
import './FacultyView.css';

type FacultyTab = 'profile' | 'schedule' | 'appointments' | 'settings';

type SlotStatus = 'available' | 'class' | 'office-hours' | 'unavailable';

type ScheduleCell = {
  status: SlotStatus;
};

type ScheduleRow = {
  time: string;
  cells: ScheduleCell[]; // Mon..Sun
};

type ConsultationMode = 'Face-to-Face' | 'Online';

type TimeSlot = {
  id: string;
  time: string;
  mode: ConsultationMode;
  location: string;
  enabled: boolean;
};

type RecurringSchedule = {
  id: string;
  days: string;
  time: string;
  mode: ConsultationMode;
  dateRange: string;
};

type FacultyAppointmentStatus = 'upcoming' | 'cancelled';

type FacultyAppointment = {
  id: string;
  studentName: string;
  category: string;
  dateLabel: string;
  timeLabel: string;
  location: string;
  mode: ConsultationMode;
  status: FacultyAppointmentStatus;
};

const WEEK_LABELS = [
  'Mon\nSep 7',
  'Tue\nSep 8',
  'Wed\nSep 9',
  'Thu\nSep 10',
  'Fri\nSep 11',
  'Sat\nSep 12',
  'Sun\nSep 13',
];

const SCHEDULE_ROWS: ScheduleRow[] = [
  {
    time: '8:00 AM – 10:00 AM',
    cells: [
      { status: 'available' },
      { status: 'unavailable' },
      { status: 'available' },
      { status: 'unavailable' },
      { status: 'unavailable' },
      { status: 'unavailable' },
      { status: 'unavailable' },
    ],
  },
  {
    time: '10:00 AM – 12:00 PM',
    cells: [
      { status: 'unavailable' },
      { status: 'class' },
      { status: 'unavailable' },
      { status: 'class' },
      { status: 'unavailable' },
      { status: 'unavailable' },
      { status: 'unavailable' },
    ],
  },
  {
    time: '1:00 PM – 3:00 PM',
    cells: [
      { status: 'available' },
      { status: 'unavailable' },
      { status: 'unavailable' },
      { status: 'unavailable' },
      { status: 'available' },
      { status: 'unavailable' },
      { status: 'unavailable' },
    ],
  },
  {
    time: '3:00 PM – 5:00 PM',
    cells: [
      { status: 'unavailable' },
      { status: 'unavailable' },
      { status: 'office-hours' },
      { status: 'unavailable' },
      { status: 'office-hours' },
      { status: 'unavailable' },
      { status: 'unavailable' },
    ],
  },
  {
    time: '5:00 PM – 7:00 PM',
    cells: [
      { status: 'unavailable' },
      { status: 'unavailable' },
      { status: 'unavailable' },
      { status: 'unavailable' },
      { status: 'unavailable' },
      { status: 'unavailable' },
      { status: 'unavailable' },
    ],
  },
];

const DAY_CHIPS = [
  { label: 'Mon', date: 7 },
  { label: 'Tue', date: 8 },
  { label: 'Wed', date: 9 },
  { label: 'Thu', date: 10 },
  { label: 'Fri', date: 11 },
  { label: 'Sat', date: 12 },
  { label: 'Sun', date: 13 },
];

const INITIAL_RECURRING: RecurringSchedule[] = [
  {
    id: 'r1',
    days: 'Mon, Sat',
    time: '1:00 PM – 3:00 PM · Online',
    mode: 'Online',
    dateRange: 'Sep 7, 2026 – Dec 27, 2026',
  },
];

const INITIAL_SLOTS: TimeSlot[] = [
  {
    id: 's1',
    time: '1:00 PM - 3:00 PM',
    mode: 'Online',
    location: 'Google Meet',
    enabled: true,
  },
];

const INITIAL_FACULTY_APPOINTMENTS: FacultyAppointment[] = [
  {
    id: 'a1',
    studentName: 'Chloey Lyca Jurcales',
    category: 'Academic Advising',
    dateLabel: 'May 13, 2026 (Tue)',
    timeLabel: '10:00 AM - 10:30 AM',
    location: 'Room 305, CITE Building',
    mode: 'Face-to-Face',
    status: 'upcoming',
  },
  {
    id: 'a2',
    studentName: 'Miguel Santos',
    category: 'Thesis Consultation',
    dateLabel: 'May 14, 2026 (Wed)',
    timeLabel: '1:00 PM - 1:30 PM',
    location: 'Google Meet',
    mode: 'Online',
    status: 'upcoming',
  },
  {
    id: 'a3',
    studentName: 'Anna Bautista',
    category: 'Grade Concern',
    dateLabel: 'May 15, 2026 (Thu)',
    timeLabel: '3:00 PM - 3:30 PM',
    location: 'Room 305, CITE Building',
    mode: 'Face-to-Face',
    status: 'upcoming',
  },
];

// Parses a range string that uses either an en dash ("8:00 AM – 10:00 AM",
// used by the fixed schedule rows) or a hyphen ("1:00 PM - 3:00 PM", used by
// availability slots) into start/end minutes-after-midnight.
function parseTimeRangeString(range: string): { start: number; end: number } | null {
  const parts = range.split(/\s[–-]\s/).map((part) => part.trim());
  if (parts.length !== 2) return null;

  const start = parseTimeInput(parts[0]);
  const end = parseTimeInput(parts[1]);
  if (start === null || end === null) return null;

  return { start, end };
}

function timeRangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
) {
  return aStart < bEnd && bStart < aEnd;
}

const TIME_ROW_RANGES = SCHEDULE_ROWS.map((row) =>
  parseTimeRangeString(row.time),
);

// Faculty availability lives in `daySlots` (keyed by calendar date, matching
// DAY_CHIPS/WEEK_LABELS). This overlays enabled slots onto the fixed weekly
// grid so a newly added time slot shows up as "Available" on the Faculty
// Schedule calendar, without touching cells that already have a class or
// office hours.
function buildDisplayRows(daySlots: Record<number, TimeSlot[]>): ScheduleRow[] {
  return SCHEDULE_ROWS.map((row, rowIndex) => {
    const range = TIME_ROW_RANGES[rowIndex];

    const cells = row.cells.map((cell, colIndex) => {
      if (cell.status !== 'unavailable' || !range) return cell;

      const date = colIndex + 7; // colIndex 0 = Mon (date 7) ... 6 = Sun (date 13)
      const slotsForDay = daySlots[date] ?? [];

      const hasAvailableSlot = slotsForDay.some((slot) => {
        if (!slot.enabled) return false;
        const slotRange = parseTimeRangeString(slot.time);
        if (!slotRange) return false;
        return timeRangesOverlap(
          range.start,
          range.end,
          slotRange.start,
          slotRange.end,
        );
      });

      return hasAvailableSlot ? { status: 'available' as SlotStatus } : cell;
    });

    return { time: row.time, cells };
  });
}

type FacultyViewProps = {
  facultyName?: string;
  facultyId?: string;
  facultyEmail?: string;
};

export default function FacultyView({
  facultyName = 'Maria Clara',
  facultyId = 'F001',
  facultyEmail = 'maria.clara@school.edu',
}: FacultyViewProps) {
  const [activeTab, setActiveTab] = useState<FacultyTab>('profile');
  const [daySlots, setDaySlots] = useState<Record<number, TimeSlot[]>>({
    7: INITIAL_SLOTS,
  });

  return (
    <div className="fv-page">
      <div className="fv-tabs">
        {(
          [
            { id: 'profile', label: 'Profile' },
            { id: 'schedule', label: 'Schedule' },
            { id: 'appointments', label: 'Appointments' },
            { id: 'settings', label: 'Availability' },
          ] as { id: FacultyTab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`fv-tab${activeTab === tab.id ? ' fv-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <ProfileTab
          facultyName={facultyName}
          facultyId={facultyId}
          facultyEmail={facultyEmail}
        />
      )}

      {activeTab === 'schedule' && <ScheduleTab daySlots={daySlots} />}

      {activeTab === 'appointments' && (
        <AppointmentsTab facultyName={facultyName} daySlots={daySlots} />
      )}

      {activeTab === 'settings' && (
        <AvailabilityTab daySlots={daySlots} onDaySlotsChange={setDaySlots} />
      )}
    </div>
  );
}

function ProfileTab({
  facultyName,
  facultyId,
  facultyEmail,
}: {
  facultyName: string;
  facultyId: string;
  facultyEmail: string;
}) {
  return (
    <div className="fv-grid-two">
      <div className="fv-card">
        <h2>Personal Information</h2>
        <dl className="fv-info-list">
          <div className="fv-info-row">
            <dt>Name:</dt>
            <dd>{facultyName}</dd>
          </div>
          <div className="fv-info-row">
            <dt>Faculty ID:</dt>
            <dd>{facultyId}</dd>
          </div>
          <div className="fv-info-row">
            <dt>Email:</dt>
            <dd>{facultyEmail}</dd>
          </div>
          <div className="fv-info-row">
            <dt>Department:</dt>
            <dd>CITE</dd>
          </div>
          <div className="fv-info-row">
            <dt>Position:</dt>
            <dd>Professor</dd>
          </div>
        </dl>

        <button type="button" className="fv-edit-button">
          <EditIcon /> Edit
        </button>
      </div>

      <div className="fv-card">
        <h2>About</h2>
        <p className="fv-about-text">
          A dedicated educator with a passion for student success and academic
          excellence. Specializes in computer science and information systems.
        </p>

        <h3 className="fv-subheading">Contact Information</h3>
        <div className="fv-contact-row">
          <PhoneIcon />
          <span>+63 912 345 6789</span>
        </div>
        <div className="fv-contact-row">
          <MailIcon />
          <span>maria.clara@school.edu</span>
        </div>
        <div className="fv-contact-row">
          <BuildingIcon />
          <span>CITE Department</span>
        </div>
      </div>
    </div>
  );
}

function AppointmentsTab({
  facultyName,
  daySlots,
}: {
  facultyName: string;
  daySlots: Record<number, TimeSlot[]>;
}) {
  const [appointments, setAppointments] = useState<FacultyAppointment[]>(
    INITIAL_FACULTY_APPOINTMENTS,
  );
  const [view, setView] = useState<
    'list' | 'cancel' | 'cancel-success' | 'reschedule' | 'reschedule-success'
  >('list');
  const [activeAppointmentId, setActiveAppointmentId] = useState<
    string | null
  >(null);
  const [reason, setReason] = useState('');
  const [lastCancelReason, setLastCancelReason] = useState('');

  const [rescheduleDate, setRescheduleDate] = useState(7);
  const [rescheduleSlotId, setRescheduleSlotId] = useState<string | null>(
    null,
  );
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [lastReschedule, setLastReschedule] = useState<{
    dateLabel: string;
    timeLabel: string;
    location: string;
    mode: ConsultationMode;
    reason: string;
  } | null>(null);

  const activeAppointment =
    appointments.find((appt) => appt.id === activeAppointmentId) ?? null;

  const openCancel = (id: string) => {
    setActiveAppointmentId(id);
    setReason('');
    setView('cancel');
  };

  const keepAppointment = () => {
    setActiveAppointmentId(null);
    setReason('');
    setView('list');
  };

  const confirmCancel = () => {
    if (!activeAppointmentId || !reason.trim()) return;

    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === activeAppointmentId
          ? { ...appt, status: 'cancelled' }
          : appt,
      ),
    );
    setLastCancelReason(reason.trim());
    setView('cancel-success');
  };

  const openReschedule = (id: string) => {
    const firstDateWithSlot =
      DAY_CHIPS.find((chip) =>
        (daySlots[chip.date] ?? []).some((slot) => slot.enabled),
      )?.date ?? DAY_CHIPS[0].date;

    setActiveAppointmentId(id);
    setRescheduleDate(firstDateWithSlot);
    setRescheduleSlotId(null);
    setRescheduleReason('');
    setView('reschedule');
  };

  const cancelReschedule = () => {
    setActiveAppointmentId(null);
    setRescheduleSlotId(null);
    setRescheduleReason('');
    setView('list');
  };

  const rescheduleSlotsForDate = (daySlots[rescheduleDate] ?? []).filter(
    (slot) => slot.enabled,
  );
  const selectedRescheduleSlot =
    rescheduleSlotsForDate.find((slot) => slot.id === rescheduleSlotId) ??
    null;
  const canConfirmReschedule =
    rescheduleReason.trim().length > 0 && !!selectedRescheduleSlot;

  const confirmReschedule = () => {
    if (!activeAppointmentId || !selectedRescheduleSlot || !canConfirmReschedule)
      return;

    const dayChip = DAY_CHIPS.find((chip) => chip.date === rescheduleDate);
    const weekLabel = WEEK_LABELS[rescheduleDate - 7];
    const [, monthDay] = weekLabel ? weekLabel.split('\n') : [undefined, ''];
    const newDateLabel = `${monthDay}, 2026 (${dayChip?.label ?? ''})`;

    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === activeAppointmentId
          ? {
              ...appt,
              dateLabel: newDateLabel,
              timeLabel: selectedRescheduleSlot.time,
              location: selectedRescheduleSlot.location,
              mode: selectedRescheduleSlot.mode,
            }
          : appt,
      ),
    );

    setLastReschedule({
      dateLabel: newDateLabel,
      timeLabel: selectedRescheduleSlot.time,
      location: selectedRescheduleSlot.location,
      mode: selectedRescheduleSlot.mode,
      reason: rescheduleReason.trim(),
    });
    setView('reschedule-success');
  };

  const backToAppointments = () => {
    setActiveAppointmentId(null);
    setReason('');
    setRescheduleSlotId(null);
    setRescheduleReason('');
    setView('list');
  };

  if (view === 'cancel' && activeAppointment) {
    const canCancel = reason.trim().length > 0;

    return (
      <div className="fv-card fv-appt-cancel-card">
        <h2>Cancel Appointment</h2>

        <div className="fv-appt-summary">
          <p className="fv-appt-summary-name">
            {activeAppointment.studentName}
          </p>
          <p className="fv-appt-summary-line">
            {activeAppointment.dateLabel} · {activeAppointment.timeLabel}
          </p>
          <p className="fv-appt-summary-muted">
            {activeAppointment.location}
          </p>
          <p className="fv-appt-summary-muted">{activeAppointment.mode}</p>
        </div>

        <label className="fv-appt-reason-label" htmlFor="cancel-reason">
          Reason for Cancellation
        </label>
        <textarea
          id="cancel-reason"
          className="fv-appt-reason-input"
          placeholder="e.g. Emergency, unavailability..."
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={4}
        />

        <div className="fv-appt-warning">
          <AlertIcon />
          <p>
            The student will be notified immediately once this appointment
            is cancelled.
          </p>
        </div>

        <div className="fv-appt-cancel-actions">
          <button
            type="button"
            className="fv-appt-cancel-confirm"
            disabled={!canCancel}
            onClick={confirmCancel}
          >
            Cancel Appointment
          </button>
          <button
            type="button"
            className="fv-appt-cancel-keep"
            onClick={keepAppointment}
          >
            Keep Appointment
          </button>
        </div>
      </div>
    );
  }

  if (view === 'cancel-success' && activeAppointment) {
    return (
      <div className="fv-card fv-appt-success-card">
        <div className="fv-appt-success-icon">
          <XIcon />
        </div>
        <h2>Appointment Canceled!</h2>
        <p className="fv-appt-success-subtitle">
          The appointment has been successfully canceled.
        </p>

        <div className="fv-appt-summary fv-appt-summary-bordered">
          <p className="fv-appt-summary-name">
            {activeAppointment.studentName}
          </p>
          <p className="fv-appt-summary-muted">{activeAppointment.category}</p>
          <p className="fv-appt-summary-line">
            {activeAppointment.dateLabel} · {activeAppointment.timeLabel}
          </p>
          <p className="fv-appt-summary-muted">
            {activeAppointment.location} · {activeAppointment.mode}
          </p>
          <p className="fv-appt-summary-reason">
            Reason: {lastCancelReason}
          </p>
        </div>

        <button
          type="button"
          className="fv-appt-back-button"
          onClick={backToAppointments}
        >
          Back to Appointments
        </button>
      </div>
    );
  }

  if (view === 'reschedule' && activeAppointment) {
    return (
      <div className="fv-card fv-appt-reschedule-card">
        <h2>Reschedule Appointment</h2>

        <div className="fv-appt-summary">
          <p className="fv-appt-summary-name">
            {activeAppointment.studentName}
          </p>
          <p className="fv-appt-summary-muted">{activeAppointment.category}</p>
        </div>

        <p className="fv-appt-subheading">Current Schedule</p>
        <div className="fv-appt-summary">
          <p className="fv-appt-summary-line">
            {activeAppointment.dateLabel} · {activeAppointment.timeLabel}
          </p>
          <p className="fv-appt-summary-muted">
            {activeAppointment.location}
          </p>
          <p className="fv-appt-summary-muted">{activeAppointment.mode}</p>
        </div>

        <label className="fv-appt-reason-label" htmlFor="reschedule-reason">
          Reason for Reschedule
        </label>
        <textarea
          id="reschedule-reason"
          className="fv-appt-reason-input"
          placeholder="e.g. Emergency meeting, schedule conflict..."
          value={rescheduleReason}
          onChange={(event) => setRescheduleReason(event.target.value)}
          rows={3}
        />

        <p className="fv-appt-subheading">Select New Date</p>
        <div className="fv-day-chips">
          {DAY_CHIPS.map((chip) => {
            const hasFit = (daySlots[chip.date] ?? []).some(
              (slot) => slot.enabled,
            );

            return (
              <button
                key={chip.date}
                type="button"
                className={`fv-day-chip${
                  rescheduleDate === chip.date ? ' fv-day-chip-active' : ''
                }${!hasFit ? ' fv-day-chip-disabled' : ''}`}
                disabled={!hasFit}
                onClick={() => {
                  setRescheduleDate(chip.date);
                  setRescheduleSlotId(null);
                }}
              >
                <span className="fv-day-chip-label">{chip.label}</span>
                <span className="fv-day-chip-date">{chip.date}</span>
              </button>
            );
          })}
        </div>

        <p className="fv-appt-subheading">Select New Time</p>
        {rescheduleSlotsForDate.length === 0 ? (
          <p className="fv-empty-slots">No available slots on this day.</p>
        ) : (
          <div className="fv-appt-slot-list">
            {rescheduleSlotsForDate.map((slot) => {
              const isSelected = slot.id === rescheduleSlotId;

              return (
                <button
                  type="button"
                  key={slot.id}
                  className={`fv-appt-slot-card${
                    isSelected ? ' fv-appt-slot-card-selected' : ''
                  }`}
                  onClick={() => setRescheduleSlotId(slot.id)}
                >
                  <span
                    className={`fv-appt-radio${
                      isSelected ? ' fv-appt-radio-active' : ''
                    }`}
                  >
                    {isSelected && <span className="fv-appt-radio-dot" />}
                  </span>
                  <span className="fv-appt-slot-text">
                    <span className="fv-appt-slot-time">{slot.time}</span>
                    <span className="fv-appt-slot-location">
                      {slot.mode} · {slot.location}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="fv-appt-cancel-actions">
          <button
            type="button"
            className="fv-appt-reschedule-confirm"
            disabled={!canConfirmReschedule}
            onClick={confirmReschedule}
          >
            Confirm Reschedule
          </button>
          <button
            type="button"
            className="fv-appt-cancel-keep"
            onClick={cancelReschedule}
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  if (view === 'reschedule-success' && activeAppointment && lastReschedule) {
    return (
      <div className="fv-card fv-appt-success-card">
        <div className="fv-appt-success-icon fv-appt-success-icon-positive">
          <CheckIcon />
        </div>
        <h2>Appointment Rescheduled!</h2>
        <p className="fv-appt-success-subtitle">
          The appointment has been successfully rescheduled.
        </p>

        <div className="fv-appt-summary fv-appt-summary-bordered">
          <p className="fv-appt-summary-name">
            {activeAppointment.studentName}
          </p>
          <p className="fv-appt-summary-muted">{activeAppointment.category}</p>
          <p className="fv-appt-summary-line">
            {lastReschedule.dateLabel} · {lastReschedule.timeLabel}
          </p>
          <p className="fv-appt-summary-muted">
            {lastReschedule.location} · {lastReschedule.mode}
          </p>
          <p className="fv-appt-summary-reason">
            Reason: {lastReschedule.reason}
          </p>
        </div>

        <button
          type="button"
          className="fv-appt-back-button"
          onClick={backToAppointments}
        >
          Back to Appointments
        </button>
      </div>
    );
  }

  return (
    <div className="fv-card fv-appt-list-card">
      <h2>Appointments for {facultyName}</h2>

      {appointments.length === 0 ? (
        <p className="fv-empty-slots">No appointments scheduled.</p>
      ) : (
        <div className="fv-appt-list">
          {appointments.map((appt) => (
            <div key={appt.id} className="fv-appt-row">
              <div className="fv-appt-row-main">
                <p className="fv-appt-row-name">{appt.studentName}</p>
                <p className="fv-appt-row-detail">{appt.category}</p>
                <p className="fv-appt-row-detail">
                  {appt.dateLabel} · {appt.timeLabel}
                </p>
                <p className="fv-appt-row-muted">
                  {appt.location} · {appt.mode}
                </p>
              </div>

              <div className="fv-appt-row-side">
                <span
                  className={`fv-appt-status fv-appt-status-${appt.status}`}
                >
                  {appt.status === 'upcoming' ? 'Upcoming' : 'Cancelled'}
                </span>

                {appt.status === 'upcoming' && (
                  <div className="fv-appt-row-actions">
                    <button
                      type="button"
                      className="fv-appt-reschedule-btn"
                      onClick={() => openReschedule(appt.id)}
                    >
                      Reschedule
                    </button>
                    <button
                      type="button"
                      className="fv-appt-cancel-btn"
                      onClick={() => openCancel(appt.id)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScheduleTab({ daySlots }: { daySlots: Record<number, TimeSlot[]> }) {
  const displayRows = useMemo(() => buildDisplayRows(daySlots), [daySlots]);

  return (
    <div className="fv-card fv-schedule-card">
      <div className="fv-schedule-header">
        <div>
          <h2>Faculty Schedule</h2>
          <p className="fv-schedule-subtitle">
            Manage your weekly schedule and availability.
          </p>
        </div>

        <button type="button" className="fv-add-schedule-button">
          <PlusIcon /> Add Schedule
        </button>
      </div>

      <div className="fv-schedule-table-wrap">
        <table className="fv-schedule-table">
          <thead>
            <tr>
              <th></th>
              {WEEK_LABELS.map((label) => {
                const [day, date] = label.split('\n');

                return (
                  <th key={label}>
                    <span className="fv-th-day">{day}</span>
                    <span className="fv-th-date">{date}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row) => (
              <tr key={row.time}>
                <td className="fv-schedule-time">{row.time}</td>
                {row.cells.map((cell, index) => (
                  <td key={index}>
                    <ScheduleCellBadge status={cell.status} />
                  </td>
                ))}
                <td className="fv-schedule-actions">
                  <button type="button" aria-label="Edit row">
                    <EditIcon />
                  </button>
                  <button type="button" aria-label="Delete row">
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="fv-legend">
        <span className="fv-legend-item">
          <span className="fv-legend-dot fv-dot-class" /> Class
        </span>
        <span className="fv-legend-item">
          <span className="fv-legend-dot fv-dot-office" /> Office Hours
        </span>
        <span className="fv-legend-item">
          <span className="fv-legend-dot fv-dot-available" /> Available
        </span>
        <span className="fv-legend-item">
          <span className="fv-legend-dot fv-dot-unavailable" /> Unavailable
        </span>
      </div>
    </div>
  );
}

function ScheduleCellBadge({ status }: { status: SlotStatus }) {
  if (status === 'unavailable') {
    return <span className="fv-cell-dash">–</span>;
  }

  const labelByStatus: Record<Exclude<SlotStatus, 'unavailable'>, string> = {
    available: 'Available',
    class: 'Class',
    'office-hours': 'Office Hours',
  };

  return (
    <span className={`fv-cell-badge fv-cell-${status}`}>
      {labelByStatus[status as Exclude<SlotStatus, 'unavailable'>]}
    </span>
  );
}

// Accepts typed times such as "9:00 AM", "9 PM", "09:00", and "13:00".
function parseTimeInput(value: string): number | null {
  const input = value.trim().replace(/\s+/g, ' ');

  if (!input) return null;

  const twelveHourMatch = input.match(
    /^(\d{1,2})(?::([0-5]\d))?\s*(AM|PM)$/i,
  );

  if (twelveHourMatch) {
    const hour = Number(twelveHourMatch[1]);
    const minute = Number(twelveHourMatch[2] ?? '0');
    const period = twelveHourMatch[3].toUpperCase();

    if (hour < 1 || hour > 12) return null;

    const hourIn24HourTime =
      period === 'AM'
        ? hour === 12
          ? 0
          : hour
        : hour === 12
          ? 12
          : hour + 12;

    return hourIn24HourTime * 60 + minute;
  }

  const twentyFourHourMatch = input.match(
    /^([01]?\d|2[0-3]):([0-5]\d)$/,
  );

  if (twentyFourHourMatch) {
    return (
      Number(twentyFourHourMatch[1]) * 60 +
      Number(twentyFourHourMatch[2])
    );
  }

  return null;
}

function formatTime(minutesAfterMidnight: number): string {
  const hour = Math.floor(minutesAfterMidnight / 60);
  const minute = minutesAfterMidnight % 60;
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
}

function AvailabilityTab({
  daySlots,
  onDaySlotsChange,
}: {
  daySlots: Record<number, TimeSlot[]>;
  onDaySlotsChange: (
    updater: (prev: Record<number, TimeSlot[]>) => Record<number, TimeSlot[]>,
  ) => void;
}) {
  const [recurring] = useState<RecurringSchedule[]>(INITIAL_RECURRING);
  const [selectedDate, setSelectedDate] = useState(7);

  const slots = daySlots[selectedDate] ?? [];

  const setSlots = (updater: (prev: TimeSlot[]) => TimeSlot[]) => {
    onDaySlotsChange((prev) => ({
      ...prev,
      [selectedDate]: updater(prev[selectedDate] ?? []),
    }));
  };

  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [newSlotStart, setNewSlotStart] = useState('');
  const [newSlotEnd, setNewSlotEnd] = useState('');
  const [newSlotMode, setNewSlotMode] =
    useState<ConsultationMode>('Face-to-Face');
  const [newSlotLocation, setNewSlotLocation] = useState('');
  const [slotError, setSlotError] = useState<string | null>(null);

  const toggleSlot = (id: string) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === id ? { ...slot, enabled: !slot.enabled } : slot,
      ),
    );
  };

  const deleteSlot = (id: string) => {
    setSlots((prev) => prev.filter((slot) => slot.id !== id));
  };

  const openAddSlot = () => {
    setSlotError(null);
    setNewSlotStart('');
    setNewSlotEnd('');
    setNewSlotMode('Face-to-Face');
    setNewSlotLocation('');
    setIsAddingSlot(true);
  };

  const cancelAddSlot = () => {
    setIsAddingSlot(false);
    setSlotError(null);
  };

  const confirmAddSlot = () => {
    const startMinutes = parseTimeInput(newSlotStart);
    const endMinutes = parseTimeInput(newSlotEnd);

    if (startMinutes === null || endMinutes === null) {
      setSlotError('Enter valid times, such as 9:00 AM or 13:00.');
      return;
    }

    if (startMinutes >= endMinutes) {
      setSlotError('End time must be after start time.');
      return;
    }

    if (!newSlotLocation.trim()) {
      setSlotError(
        newSlotMode === 'Online'
          ? 'Please enter a meeting link or platform (e.g. Google Meet, Zoom).'
          : 'Please enter a location (e.g. Room 204, CITE Building).',
      );
      return;
    }

    const time = `${formatTime(startMinutes)} - ${formatTime(endMinutes)}`;

    const isDuplicate = slots.some((slot) => slot.time === time);

    if (isDuplicate) {
      setSlotError('That time slot already exists for this day.');
      return;
    }

    const newSlot: TimeSlot = {
      id: `s-${Date.now()}`,
      time,
      mode: newSlotMode,
      location: newSlotLocation.trim(),
      enabled: true,
    };

    setSlots((prev) => [...prev, newSlot]);
    setIsAddingSlot(false);
    setSlotError(null);
  };

  return (
    <div className="fv-availability">
      <div className="fv-avail-header">
        <h2>Faculty Availability &amp; Location</h2>
        <p>Set your office hours and where students can find you.</p>
      </div>

      <button type="button" className="fv-recurring-banner">
        <span className="fv-recurring-banner-text">
          <StarIcon /> Get a Recurring Weekly Schedule
        </span>
        <ChevronRightIcon />
      </button>

      {recurring.length > 0 && (
        <div className="fv-card fv-active-schedules-card">
          <h3>Active Weekly Schedules</h3>

          {recurring.map((rule) => (
            <div key={rule.id} className="fv-recurring-row">
              <div>
                <p className="fv-recurring-days">{rule.days}</p>
                <p className="fv-recurring-detail">{rule.time}</p>
                <p className="fv-recurring-range">{rule.dateRange}</p>
              </div>

              <button
                type="button"
                aria-label="Delete schedule"
                className="fv-icon-danger"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="fv-card fv-day-picker-card">
        <div className="fv-week-nav">
          <button type="button" aria-label="Previous week">
            <ChevronLeftIcon />
          </button>
          <span>Sep 6 – Sep 12, 2036</span>
          <button type="button" aria-label="Next week">
            <ChevronRightIcon />
          </button>
        </div>

        <p className="fv-select-day-label">Select Day</p>

        <div className="fv-day-chips">
          {DAY_CHIPS.map((chip) => (
            <button
              key={chip.date}
              type="button"
              className={`fv-day-chip${
                selectedDate === chip.date ? ' fv-day-chip-active' : ''
              }`}
              onClick={() => setSelectedDate(chip.date)}
            >
              <span className="fv-day-chip-label">{chip.label}</span>
              <span className="fv-day-chip-date">{chip.date}</span>
            </button>
          ))}
        </div>

        <div className="fv-slots-header">
          <p>Time Slots</p>

          {!isAddingSlot && (
            <button
              type="button"
              className="fv-add-slot-button"
              onClick={openAddSlot}
            >
              <PlusIcon /> Add Time Slot
            </button>
          )}
        </div>

        {isAddingSlot && (
          <div className="fv-add-slot-form">
            <div className="fv-add-slot-row">
              <div className="fv-add-slot-field">
                <label htmlFor="new-slot-start">Start time</label>
                <input
                  id="new-slot-start"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  placeholder="e.g. 9:00 AM"
                  value={newSlotStart}
                  onChange={(event) => {
                    setNewSlotStart(event.target.value);
                    setSlotError(null);
                  }}
                />
              </div>

              <div className="fv-add-slot-field">
                <label htmlFor="new-slot-end">End time</label>
                <input
                  id="new-slot-end"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  placeholder="e.g. 10:30 AM"
                  value={newSlotEnd}
                  onChange={(event) => {
                    setNewSlotEnd(event.target.value);
                    setSlotError(null);
                  }}
                />
              </div>

              <div className="fv-add-slot-field">
                <label htmlFor="new-slot-mode">Mode</label>
                <select
                  id="new-slot-mode"
                  value={newSlotMode}
                  onChange={(event) => {
                    const mode = event.target.value as ConsultationMode;
                    setNewSlotMode(mode);
                    setNewSlotLocation('');
                  }}
                >
                  <option value="Face-to-Face">Face-to-Face</option>
                  <option value="Online">Online</option>
                </select>
              </div>
            </div>

            <p
              style={{
                margin: '0 0 10px',
                fontSize: '11.5px',
                color: '#6b7280',
              }}
            >
              Type a time like 9:00 AM, 9 PM, or 13:00.
            </p>

            <div className="fv-add-slot-row">
              <div className="fv-add-slot-field fv-add-slot-field-wide">
                <label htmlFor="new-slot-location">
                  {newSlotMode === 'Online'
                    ? 'Meeting link / platform'
                    : 'Location'}
                </label>

                <input
                  id="new-slot-location"
                  type="text"
                  placeholder={
                    newSlotMode === 'Online'
                      ? 'e.g. Google Meet, Zoom link'
                      : 'e.g. Room 204, CITE Building'
                  }
                  value={newSlotLocation}
                  onChange={(event) =>
                    setNewSlotLocation(event.target.value)
                  }
                />
              </div>
            </div>

            {slotError && <p className="fv-slot-error">{slotError}</p>}

            <div className="fv-add-slot-actions">
              <button
                type="button"
                className="fv-add-slot-cancel"
                onClick={cancelAddSlot}
              >
                Cancel
              </button>

              <button
                type="button"
                className="fv-add-slot-confirm"
                onClick={confirmAddSlot}
              >
                Add Slot
              </button>
            </div>
          </div>
        )}

        {slots.length === 0 ? (
          <p className="fv-empty-slots">No time slots for this day.</p>
        ) : (
          slots.map((slot) => (
            <div key={slot.id} className="fv-slot-row">
              <div>
                <p className="fv-slot-time">{slot.time}</p>
                <p className="fv-slot-mode">
                  {slot.mode}
                  {slot.location && ` · ${slot.location}`}
                </p>
              </div>

              <div className="fv-slot-actions">
                <button
                  type="button"
                  className={`fv-toggle${
                    slot.enabled ? ' fv-toggle-on' : ''
                  }`}
                  onClick={() => toggleSlot(slot.id)}
                  aria-label="Toggle slot"
                >
                  <span className="fv-toggle-knob" />
                </button>

                {!slot.enabled && (
                  <button
                    type="button"
                    className="fv-icon-danger"
                    onClick={() => deleteSlot(slot.id)}
                    aria-label="Delete slot"
                  >
                    <TrashIcon />
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        <button type="button" className="fv-save-button">
          Save Availability
        </button>
      </div>
    </div>
  );
}

function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 7h14M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0-.8 12.2a2 2 0 0 1-2 1.8H8.8a2 2 0 0 1-2-1.8L6 7h12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 3h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2C10.5 18 5 12.5 5 6a2 2 0 0 1 1-3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="m4 7 8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="3"
        width="12"
        height="18"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 7h4M8 11h4M8 15h4M16 10h4v11h-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="m12 3 2.6 5.7 6.2.6-4.6 4.2 1.3 6.1L12 16.8 6.5 19.6l1.3-6.1L3.2 9.3l6.2-.6L12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
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

function XIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12.5l4.5 4.5L19 7"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}