import { useState } from 'react';
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
  { label: 'Sun', date: 6 },
  { label: 'Mon', date: 7 },
  { label: 'Tue', date: 9 },
  { label: 'Wed', date: 10 },
  { label: 'Fri', date: 11 },
  { label: 'Sat', date: 12 },
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

  return (
    <div className="fv-page">
      <div className="fv-profile-header">
        <div className="fv-avatar">
          <UserIcon />
        </div>
        <div className="fv-header-text">
          <h1>{facultyName}</h1>
          <p>Faculty ID: {facultyId}</p>
          <p>{facultyEmail}</p>
          <span className="fv-active-badge">Active</span>
        </div>
      </div>

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

      {activeTab === 'schedule' && <ScheduleTab />}

      {activeTab === 'appointments' && (
        <div className="fv-placeholder">
          <p>Appointment history for {facultyName} goes here.</p>
        </div>
      )}

      {activeTab === 'settings' && <AvailabilityTab />}
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

function ScheduleTab() {
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
            {SCHEDULE_ROWS.map((row) => (
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

function AvailabilityTab() {
  const [recurring] = useState<RecurringSchedule[]>(INITIAL_RECURRING);
  const [slots, setSlots] = useState<TimeSlot[]>(INITIAL_SLOTS);
  const [selectedDate, setSelectedDate] = useState(7);

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

function UserIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="#ffffff" strokeWidth="1.7" />
      <path
        d="M4 20c1-4 4.5-6 8-6s7 2 8 6"
        stroke="#ffffff"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
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