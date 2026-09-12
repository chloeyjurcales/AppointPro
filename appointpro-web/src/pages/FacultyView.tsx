import { useMemo, useState } from 'react';
import { usePersistentState } from '../lib/usePersistentState';
import './FacultyView.css';

export type FacultyTab = 'profile' | 'schedule' | 'settings';

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

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Native JS Date.getDay() order (0 = Sunday ... 6 = Saturday), used only by
// the recurring-schedule form below since it iterates real calendar dates.
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ---------- Real calendar date helpers ----------
// Everything below works with genuine Date objects so week navigation and
// "today" are always correct, instead of a single hardcoded demo week.

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function addDaysToDate(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Monday of the week containing `date`.
function startOfWeek(date: Date): Date {
  const base = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const mondayOffset = (base.getDay() + 6) % 7; // Sun=0..Sat=6 -> Mon=0..Sun=6
  return addDaysToDate(base, -mondayOffset);
}

function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, index) => addDaysToDate(weekStart, index));
}

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatMonthDay(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatWeekRangeLabel(weekDates: Date[]): string {
  const start = weekDates[0];
  const end = weekDates[6];
  return `${formatMonthDay(start)} – ${formatMonthDay(end)}, ${end.getFullYear()}`;
}

// ---------- Philippine holiday calendar ----------
// Fixed-date holidays apply every year. Movable ones (tied to Easter) and
// National Heroes Day (last Monday of August) are computed, so this stays
// correct no matter which year the faculty member navigates to.

const FIXED_PH_HOLIDAYS: { month: number; day: number; name: string }[] = [
  { month: 1, day: 1, name: "New Year's Day" },
  { month: 4, day: 9, name: 'Araw ng Kagitingan' },
  { month: 5, day: 1, name: 'Labor Day' },
  { month: 6, day: 12, name: 'Independence Day' },
  { month: 8, day: 21, name: 'Ninoy Aquino Day' },
  { month: 11, day: 1, name: "All Saints' Day" },
  { month: 11, day: 30, name: 'Bonifacio Day' },
  { month: 12, day: 25, name: 'Christmas Day' },
  { month: 12, day: 30, name: 'Rizal Day' },
  { month: 12, day: 31, name: "New Year's Eve" },
];

// Meeus/Jones/Butcher algorithm for the Gregorian Easter Sunday.
function computeEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function getLastMondayOfAugust(year: number): Date {
  const lastDayOfAugust = new Date(year, 8, 0); // Aug 31
  const mondayOffset = (lastDayOfAugust.getDay() + 6) % 7;
  return addDaysToDate(lastDayOfAugust, -mondayOffset);
}

function getHolidayName(date: Date): string | null {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const fixed = FIXED_PH_HOLIDAYS.find(
    (holiday) => holiday.month === month && holiday.day === day,
  );
  if (fixed) return fixed.name;

  const year = date.getFullYear();
  const easterSunday = computeEasterSunday(year);
  if (isSameDay(date, addDaysToDate(easterSunday, -3))) return 'Maundy Thursday';
  if (isSameDay(date, addDaysToDate(easterSunday, -2))) return 'Good Friday';
  if (isSameDay(date, getLastMondayOfAugust(year))) return 'National Heroes Day';

  return null;
}

const SCHEDULE_ROWS: ScheduleRow[] = [
  {
    time: '7:00 AM – 8:00 AM',
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
  {
    time: '8:00 AM – 9:00 AM',
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
    time: '9:00 AM – 10:00 AM',
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
    time: '10:00 AM – 11:00 AM',
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
    time: '11:00 AM – 12:00 PM',
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
    time: '12:00 PM – 1:00 PM',
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
  {
    time: '1:00 PM – 2:00 PM',
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
    time: '2:00 PM – 3:00 PM',
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
    time: '3:00 PM – 4:00 PM',
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
    time: '4:00 PM – 5:00 PM',
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
    time: '5:00 PM – 6:00 PM',
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
  {
    time: '6:00 PM – 7:00 PM',
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
  {
    time: '7:00 PM – 8:00 PM',
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
  {
    time: '8:00 PM – 9:00 PM',
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

// Faculty availability lives in `daySlots`, keyed by real ISO calendar date
// (e.g. "2026-09-08"). This overlays enabled slots onto the fixed weekly
// grid so a newly added time slot shows up as "Available" on the Faculty
// Schedule tab for the matching real date, without touching cells that
// already have a class or office hours. `weekDates` is the 7 real Date
// objects (Mon..Sun) currently being displayed.
function buildDisplayRows(
  daySlots: Record<string, TimeSlot[]>,
  weekDates: Date[],
): ScheduleRow[] {
  return SCHEDULE_ROWS.map((row, rowIndex) => {
    const range = TIME_ROW_RANGES[rowIndex];

    const cells = row.cells.map((cell, colIndex) => {
      if (cell.status !== 'unavailable' || !range) return cell;

      const dateForColumn = weekDates[colIndex];
      if (!dateForColumn) return cell;

      const slotsForDay = daySlots[toISODate(dateForColumn)] ?? [];

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
  initialTab?: FacultyTab;
};

export default function FacultyView({
  facultyName = 'Maria Clara',
  facultyId = 'F001',
  facultyEmail = 'maria.clara@school.edu',
  initialTab = 'profile',
}: FacultyViewProps) {
  const [activeTab, setActiveTab] = useState<FacultyTab>(initialTab);
  const [daySlots, setDaySlots] = usePersistentState<
    Record<string, TimeSlot[]>
  >('appointpro.daySlots', () => ({
    [toISODate(new Date())]: INITIAL_SLOTS,
  }));

  return (
    <div className="fv-page">
      <div className="fv-tabs">
        {(
          [
            { id: 'profile', label: 'Profile' },
            { id: 'schedule', label: 'Schedule' },
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

      {activeTab === 'settings' && (
        <AvailabilityTab daySlots={daySlots} onDaySlotsChange={setDaySlots} />
      )}
    </div>
  );
}

type PersonalInfo = {
  name: string;
  email: string;
  department: string;
  consultationTypes: string;
};

function ProfileTab({
  facultyName,
  facultyId,
  facultyEmail,
}: {
  facultyName: string;
  facultyId: string;
  facultyEmail: string;
}) {
  const [savedInfo, setSavedInfo] = usePersistentState<PersonalInfo>(
    'appointpro.personalInfo',
    () => ({
      name: facultyName,
      email: facultyEmail,
      department: 'CITE Department',
      consultationTypes: 'Face-to-Face, Online',
    }),
  );
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<PersonalInfo>(savedInfo);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = usePersistentState<string | null>(
    'appointpro.avatarUrl',
    null,
  );

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const updateField = (field: keyof PersonalInfo) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const startEditing = () => {
    setForm(savedInfo);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
  };

  const handleSave = () => {
    const wantsPasswordChange = !!(
      currentPassword ||
      newPassword ||
      confirmPassword
    );

    if (wantsPasswordChange) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setPasswordError(
          'Fill in all three password fields, or leave them all blank.',
        );
        return;
      }
      if (newPassword.length < 8) {
        setPasswordError('New password must be at least 8 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError('New passwords do not match.');
        return;
      }
    }

    setSavedInfo(form);
    setPasswordError(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsEditing(false);
  };

  return (
    <div className="fv-grid-two">
      <div className="fv-card">
        <h2>Personal Information</h2>

        <div className="fv-avatar-block">
          <div className="fv-avatar-photo">
            {avatarUrl ? (
              <img src={avatarUrl} alt={`${savedInfo.name}'s profile photo`} />
            ) : (
              <UserIcon />
            )}
            <label className="fv-avatar-edit-btn" title="Change photo">
              <CameraIcon />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                hidden
              />
            </label>
          </div>

          {avatarUrl && (
            <button
              type="button"
              className="fv-avatar-remove"
              onClick={() => setAvatarUrl(null)}
            >
              Remove photo
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="fv-edit-form">
            <div className="fv-edit-field">
              <label htmlFor="pi-id">Employee ID</label>
              <input id="pi-id" type="text" value={facultyId} disabled />
            </div>

            <div className="fv-edit-field">
              <label htmlFor="pi-name">Full Name</label>
              <input
                id="pi-name"
                type="text"
                value={form.name}
                onChange={(event) => updateField('name')(event.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="fv-edit-field">
              <label htmlFor="pi-email">Email</label>
              <input
                id="pi-email"
                type="email"
                value={form.email}
                onChange={(event) => updateField('email')(event.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div className="fv-edit-field">
              <label htmlFor="pi-department">Department</label>
              <input
                id="pi-department"
                type="text"
                value={form.department}
                onChange={(event) =>
                  updateField('department')(event.target.value)
                }
                placeholder="Enter your department"
              />
            </div>

            <div className="fv-edit-field">
              <label htmlFor="pi-consultation">Consultation Type</label>
              <input
                id="pi-consultation"
                type="text"
                value={form.consultationTypes}
                onChange={(event) =>
                  updateField('consultationTypes')(event.target.value)
                }
                placeholder="e.g. Face-to-Face, Online"
              />
            </div>

            <div className="fv-edit-divider" />

            <div className="fv-edit-section-header">
              <LockIcon /> <span>Change Password</span>
            </div>
            <p className="fv-edit-section-subtext">
              Leave these blank if you don't want to change your password.
            </p>

            <div className="fv-edit-field">
              <label htmlFor="pi-current-password">Current Password</label>
              <input
                id="pi-current-password"
                type="password"
                value={currentPassword}
                onChange={(event) => {
                  setCurrentPassword(event.target.value);
                  setPasswordError(null);
                }}
                placeholder="Enter your current password"
              />
            </div>

            <div className="fv-edit-field">
              <label htmlFor="pi-new-password">New Password</label>
              <input
                id="pi-new-password"
                type="password"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  setPasswordError(null);
                }}
                placeholder="Create a new password"
              />
            </div>

            <div className="fv-edit-field">
              <label htmlFor="pi-confirm-password">
                Confirm New Password
              </label>
              <input
                id="pi-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setPasswordError(null);
                }}
                placeholder="Confirm your new password"
              />
            </div>

            <div className="fv-edit-info-box">
              <ShieldIcon />
              <p>
                Use at least 8 characters with a mix of letters, numbers, and
                symbols.
              </p>
            </div>

            {passwordError && (
              <p className="fv-edit-error">{passwordError}</p>
            )}

            <div className="fv-edit-actions">
              <button
                type="button"
                className="fv-edit-save"
                onClick={handleSave}
              >
                Save Changes
              </button>
              <button
                type="button"
                className="fv-edit-cancel"
                onClick={cancelEditing}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <dl className="fv-info-list">
              <div className="fv-info-row">
                <dt>Name:</dt>
                <dd>{savedInfo.name}</dd>
              </div>
              <div className="fv-info-row">
                <dt>Faculty ID:</dt>
                <dd>{facultyId}</dd>
              </div>
              <div className="fv-info-row">
                <dt>Email:</dt>
                <dd>{savedInfo.email}</dd>
              </div>
              <div className="fv-info-row">
                <dt>Department:</dt>
                <dd>{savedInfo.department}</dd>
              </div>
              <div className="fv-info-row">
                <dt>Consultation Type:</dt>
                <dd>{savedInfo.consultationTypes}</dd>
              </div>
              <div className="fv-info-row">
                <dt>Position:</dt>
                <dd>Professor</dd>
              </div>
            </dl>

            <button
              type="button"
              className="fv-edit-button"
              onClick={startEditing}
            >
              <EditIcon /> Edit
            </button>
          </>
        )}
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
          <span>{savedInfo.email}</span>
        </div>
        <div className="fv-contact-row">
          <BuildingIcon />
          <span>{savedInfo.department}</span>
        </div>
      </div>
    </div>
  );
}

function ScheduleTab({ daySlots }: { daySlots: Record<string, TimeSlot[]> }) {
  const weekDates = useMemo(() => getWeekDates(startOfWeek(new Date())), []);
  const displayRows = useMemo(
    () => buildDisplayRows(daySlots, weekDates),
    [daySlots, weekDates],
  );

  return (
    <div className="fv-card fv-schedule-card">
      <div className="fv-schedule-header">
        <div>
          <h2>Faculty Schedule</h2>
          <p className="fv-schedule-subtitle">
            Manage your weekly schedule and availability.
          </p>
        </div>

        <button
          type="button"
          className="fv-add-schedule-button"
          onClick={() =>
            window.alert('The add-schedule form is not built yet.')
          }
        >
          <PlusIcon /> Add Schedule
        </button>
      </div>

      <div className="fv-schedule-table-wrap">
        <table className="fv-schedule-table">
          <thead>
            <tr>
              <th></th>
              {weekDates.map((date, index) => {
                const holiday = getHolidayName(date);

                return (
                  <th key={toISODate(date)}>
                    <span className="fv-th-day">{WEEKDAY_HEADERS[index]}</span>
                    <span className="fv-th-date">{formatMonthDay(date)}</span>
                    {holiday && (
                      <span className="fv-th-holiday">{holiday}</span>
                    )}
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
  daySlots: Record<string, TimeSlot[]>;
  onDaySlotsChange: (
    updater: (prev: Record<string, TimeSlot[]>) => Record<string, TimeSlot[]>,
  ) => void;
}) {
  const [recurring, setRecurring] = usePersistentState<RecurringSchedule[]>(
    'appointpro.recurringSchedules',
    INITIAL_RECURRING,
  );
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [recurringDays, setRecurringDays] = useState<number[]>([1, 3]);
  const [recurringStartText, setRecurringStartText] = useState('1:00 PM');
  const [recurringEndText, setRecurringEndText] = useState('3:00 PM');
  const [recurringMode, setRecurringMode] =
    useState<ConsultationMode>('Face-to-Face');
  const [recurringLocation, setRecurringLocation] = useState('');
  const [recurringWeeks, setRecurringWeeks] = useState('16');
  const [recurringError, setRecurringError] = useState<string | null>(null);

  const today = new Date();
  const [weekAnchor, setWeekAnchor] = useState(() => startOfWeek(today));
  const [selectedDate, setSelectedDate] = useState(() => today);

  const weekDates = useMemo(() => getWeekDates(weekAnchor), [weekAnchor]);
  const selectedISO = toISODate(selectedDate);

  const goPrevWeek = () => {
    const newAnchor = addDaysToDate(weekAnchor, -7);
    setWeekAnchor(newAnchor);
    setSelectedDate(newAnchor);
  };

  const goNextWeek = () => {
    const newAnchor = addDaysToDate(weekAnchor, 7);
    setWeekAnchor(newAnchor);
    setSelectedDate(newAnchor);
  };

  const selectedHoliday = getHolidayName(selectedDate);

  // The Schedule tab only ever shows the current real week, so let people
  // know when they're editing availability for a week it won't reflect on.
  const isCurrentWeek = isSameDay(weekAnchor, startOfWeek(today));

  const toggleRecurringDay = (dayIndex: number) => {
    setRecurringDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex],
    );
  };

  const openRecurringForm = () => {
    setRecurringError(null);
    setShowRecurringForm((prev) => !prev);
  };

  const deleteRecurring = (id: string) => {
    setRecurring((prev) => prev.filter((rule) => rule.id !== id));
  };

  const canCreateRecurring =
    recurringDays.length > 0 &&
    recurringLocation.trim().length > 0 &&
    (parseInt(recurringWeeks, 10) || 0) > 0;

  const handleCreateRecurring = () => {
    if (!canCreateRecurring) return;

    const startMinutes = parseTimeInput(recurringStartText);
    const endMinutes = parseTimeInput(recurringEndText);

    if (startMinutes === null || endMinutes === null) {
      setRecurringError('Enter valid start and end times, e.g. "1:00 PM".');
      return;
    }
    if (endMinutes <= startMinutes) {
      setRecurringError('End time must be after the start time.');
      return;
    }

    const rangeStart = new Date();
    rangeStart.setHours(0, 0, 0, 0);
    const numWeeks = parseInt(recurringWeeks, 10) || 16;
    const rangeEnd = addDaysToDate(rangeStart, numWeeks * 7 - 1);
    const timeLabel = `${formatTime(startMinutes)} - ${formatTime(endMinutes)}`;
    const ruleId = `rule-${Date.now()}`;

    const generatedDates: string[] = [];
    const cursor = new Date(rangeStart);
    let safety = 0;
    while (cursor <= rangeEnd && safety < 400) {
      safety += 1;
      if (recurringDays.includes(cursor.getDay())) {
        generatedDates.push(toISODate(cursor));
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    onDaySlotsChange((prev) => {
      const next = { ...prev };
      generatedDates.forEach((iso) => {
        const newSlot: TimeSlot = {
          id: `${ruleId}-${iso}`,
          time: timeLabel,
          mode: recurringMode,
          location: recurringLocation.trim(),
          enabled: true,
        };
        next[iso] = [...(next[iso] ?? []), newSlot];
      });
      return next;
    });

    const daysLabel = [...recurringDays]
      .sort((a, b) => a - b)
      .map((d) => DAY_NAMES_SHORT[d])
      .join(', ');
    const formatFullDate = (date: Date) =>
      date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

    setRecurring((prev) => [
      ...prev,
      {
        id: ruleId,
        days: daysLabel,
        time: `${timeLabel} · ${recurringMode}`,
        mode: recurringMode,
        dateRange: `${formatFullDate(rangeStart)} – ${formatFullDate(rangeEnd)}`,
      },
    ]);

    setRecurringError(null);
    setRecurringLocation('');
    setShowRecurringForm(false);
  };

  const slots = daySlots[selectedISO] ?? [];

  const setSlots = (updater: (prev: TimeSlot[]) => TimeSlot[]) => {
    onDaySlotsChange((prev) => ({
      ...prev,
      [selectedISO]: updater(prev[selectedISO] ?? []),
    }));
  };

  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [newSlotStart, setNewSlotStart] = useState('');
  const [newSlotEnd, setNewSlotEnd] = useState('');
  const [newSlotMode, setNewSlotMode] =
    useState<ConsultationMode>('Face-to-Face');
  const [newSlotLocation, setNewSlotLocation] = useState('');
  const [slotError, setSlotError] = useState<string | null>(null);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

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
    setAddedNotice(null);
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
    setAddedNotice(
      isCurrentWeek
        ? `Added ${time} — it now shows as Available on the Schedule tab.`
        : `Added ${time} for ${selectedDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}.`,
    );
  };

  return (
    <div className="fv-availability">
      <div className="fv-avail-header">
        <h2>Faculty Availability &amp; Location</h2>
        <p>Set your office hours and where students can find you.</p>
      </div>

      <button
        type="button"
        className="fv-recurring-banner"
        onClick={openRecurringForm}
      >
        <span className="fv-recurring-banner-text">
          <StarIcon /> Get a Recurring Weekly Schedule
        </span>
        <ChevronRightIcon />
      </button>

      {showRecurringForm && (
        <div className="fv-card fv-recurring-form">
          <h3>Recurring Weekly Schedule</h3>
          <p className="fv-recurring-form-intro">
            Set a schedule that repeats automatically every week for the
            rest of the semester — no need to add it week by week.
          </p>

          <p className="fv-select-day-label">Repeat on these days</p>
          <div className="fv-day-chips">
            {DAY_NAMES_SHORT.map((label, index) => (
              <button
                key={label}
                type="button"
                className={`fv-day-chip${
                  recurringDays.includes(index) ? ' fv-day-chip-active' : ''
                }`}
                onClick={() => toggleRecurringDay(index)}
              >
                <span className="fv-day-chip-label">{label}</span>
              </button>
            ))}
          </div>

          <div className="fv-add-slot-row">
            <div className="fv-add-slot-field">
              <label htmlFor="rec-start">Start Time</label>
              <input
                id="rec-start"
                type="text"
                placeholder="1:00 PM"
                value={recurringStartText}
                onChange={(event) =>
                  setRecurringStartText(event.target.value)
                }
              />
            </div>
            <div className="fv-add-slot-field">
              <label htmlFor="rec-end">End Time</label>
              <input
                id="rec-end"
                type="text"
                placeholder="3:00 PM"
                value={recurringEndText}
                onChange={(event) => setRecurringEndText(event.target.value)}
              />
            </div>
          </div>

          <p className="fv-select-day-label">Consultation Type</p>
          <div className="fv-modal-mode-toggle">
            <button
              type="button"
              className={`fv-mode-btn${
                recurringMode === 'Face-to-Face' ? ' fv-mode-btn-active' : ''
              }`}
              onClick={() => setRecurringMode('Face-to-Face')}
            >
              Face-to-Face
            </button>
            <button
              type="button"
              className={`fv-mode-btn${
                recurringMode === 'Online' ? ' fv-mode-btn-active' : ''
              }`}
              onClick={() => setRecurringMode('Online')}
            >
              Online
            </button>
          </div>

          <div className="fv-add-slot-field fv-add-slot-field-wide">
            <label htmlFor="rec-location">
              {recurringMode === 'Online' ? 'Meeting Link' : 'Location'}
            </label>
            <input
              id="rec-location"
              type="text"
              placeholder={
                recurringMode === 'Online'
                  ? 'Enter meeting link (e.g. Google Meet, Zoom)'
                  : 'Enter room or location (e.g. Room 204)'
              }
              value={recurringLocation}
              onChange={(event) => setRecurringLocation(event.target.value)}
            />
          </div>

          <div className="fv-add-slot-field fv-recurring-weeks-field">
            <label htmlFor="rec-weeks">Repeat for how many weeks</label>
            <input
              id="rec-weeks"
              type="number"
              min={1}
              max={30}
              value={recurringWeeks}
              onChange={(event) => setRecurringWeeks(event.target.value)}
            />
          </div>
          <p className="fv-slots-hint">
            A typical semester runs about 16 weeks. Slots will be created
            automatically for every matching day until then.
          </p>

          {recurringError && (
            <p className="fv-slot-error">{recurringError}</p>
          )}

          <div className="fv-add-slot-actions">
            <button
              type="button"
              className="fv-add-slot-cancel"
              onClick={() => setShowRecurringForm(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="fv-add-slot-confirm"
              disabled={!canCreateRecurring}
              onClick={handleCreateRecurring}
            >
              Create Recurring Schedule
            </button>
          </div>
        </div>
      )}

      <div
        className={`fv-availability-columns${
          recurring.length === 0 ? ' fv-availability-columns-single' : ''
        }`}
      >
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
                  onClick={() => deleteRecurring(rule.id)}
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="fv-card fv-day-picker-card">
        <div className="fv-week-nav">
          <button
            type="button"
            aria-label="Previous week"
            onClick={goPrevWeek}
          >
            <ChevronLeftIcon />
          </button>
          <span>{formatWeekRangeLabel(weekDates)}</span>
          <button type="button" aria-label="Next week" onClick={goNextWeek}>
            <ChevronRightIcon />
          </button>
        </div>

        <p className="fv-select-day-label">Select Day</p>

        <div className="fv-day-chips">
          {weekDates.map((date, index) => {
            const iso = toISODate(date);
            const holiday = getHolidayName(date);
            const isSelected = selectedISO === iso;
            const isToday = isSameDay(date, today);

            return (
              <button
                key={iso}
                type="button"
                className={`fv-day-chip${
                  isSelected ? ' fv-day-chip-active' : ''
                }${isToday && !isSelected ? ' fv-day-chip-today' : ''}${
                  holiday ? ' fv-day-chip-holiday' : ''
                }`}
                title={holiday ?? undefined}
                onClick={() => {
                  setSelectedDate(date);
                  setAddedNotice(null);
                }}
              >
                <span className="fv-day-chip-label">
                  {WEEKDAY_HEADERS[index]}
                </span>
                <span className="fv-day-chip-date">{date.getDate()}</span>
                {holiday && <span className="fv-day-chip-holiday-dot" />}
              </button>
            );
          })}
        </div>

        {selectedHoliday && (
          <p className="fv-holiday-banner">
            <StarIcon /> {selectedHoliday} — this day is a Philippine holiday.
          </p>
        )}

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

        <p className="fv-slots-hint">
          {isCurrentWeek
            ? 'Slots you add here automatically appear as “Available” for that day on the Schedule tab.'
            : 'This slot will be saved, but the Schedule tab only shows the current week — come back to it once this week arrives.'}
        </p>

        {addedNotice && (
          <div className="fv-slots-added-notice">
            <CheckSmallIcon />
            <span>{addedNotice}</span>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setAddedNotice(null)}
            >
              <XSmallIcon />
            </button>
          </div>
        )}

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

function UserIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8.5" r="3.6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M4.5 19.2c1.1-3.6 4.2-5.4 7.5-5.4s6.4 1.8 7.5 5.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-1.6A1.5 1.5 0 0 1 9.8 4.6h4.4a1.5 1.5 0 0 1 1.3.8L16.5 7h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12.5" r="3" stroke="currentColor" strokeWidth="1.5" />
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

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect
        x="5"
        y="10.5"
        width="14"
        height="9.5"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 10.5V8a4 4 0 0 1 8 0v2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3.5l7 2.5v5c0 4.5-3 7.8-7 9.5-4-1.7-7-5-7-9.5V6l7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
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