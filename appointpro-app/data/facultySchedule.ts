export type ConsultationMode = 'Face-to-Face' | 'Online';

export type BookedRange = {
  bookingId: string;
  startMinuteOffset: number; // minutes after slot start
  durationMinutes: number;
  studentName: string;
};

export type ScheduleSlot = {
  id: string;
  time: string; // display label, e.g. "8:00 AM - 10:00 AM"
  startLabel: string; // e.g. "8:00 AM" — needed to compute real clock times
  mode: ConsultationMode;
  location: string;
  totalMinutes: number;
  bookings: BookedRange[]; // replaces the old flat `bookedMinutes` number
};

export type WeekDay = {
  day: string;
  date: number;
  fullLabel: string;
};

export const WEEK_DAYS: WeekDay[] = [
  { day: 'Sun', date: 11, fullLabel: 'Sunday, May 11' },
  { day: 'Mon', date: 12, fullLabel: 'Monday, May 12' },
  { day: 'Tue', date: 13, fullLabel: 'Tuesday, May 13' },
  { day: 'Wed', date: 14, fullLabel: 'Wednesday, May 14' },
  { day: 'Thu', date: 15, fullLabel: 'Thursday, May 15' },
  { day: 'Fri', date: 16, fullLabel: 'Friday, May 16' },
  { day: 'Sat', date: 17, fullLabel: 'Saturday, May 17' },
];

export type DurationOption = { label: string; minutes: number };

export const DURATION_OPTIONS: DurationOption[] = [
  { label: '15 mins', minutes: 15 },
  { label: '30 mins', minutes: 30 },
  { label: '45 mins', minutes: 45 },
  { label: '1 hour', minutes: 60 },
];

export const SMALLEST_DURATION_MINUTES = Math.min(
  ...DURATION_OPTIONS.map((d) => d.minutes)
);

function getBookedMinutesTotal(slot: ScheduleSlot): number {
  return slot.bookings.reduce((sum, b) => sum + b.durationMinutes, 0);
}

export function getRemainingMinutes(slot: ScheduleSlot): number {
  return Math.max(slot.totalMinutes - getBookedMinutesTotal(slot), 0);
}

export function isSlotFull(slot: ScheduleSlot): boolean {
  return getRemainingMinutes(slot) < SMALLEST_DURATION_MINUTES;
}

export function getFittingDurationOptions(slot: ScheduleSlot): DurationOption[] {
  const remaining = getRemainingMinutes(slot);
  return DURATION_OPTIONS.filter((d) => d.minutes <= remaining);
}

// Finds the next open chunk of `minutes` length within the slot, in order.
// Returns the minute-offset from slot start where the booking should begin,
// or null if nothing large enough is free.
export function findNextAvailableOffset(slot: ScheduleSlot, minutes: number): number | null {
  const sorted = [...slot.bookings].sort((a, b) => a.startMinuteOffset - b.startMinuteOffset);
  let cursor = 0;
  for (const booking of sorted) {
    if (booking.startMinuteOffset - cursor >= minutes) {
      return cursor;
    }
    cursor = Math.max(cursor, booking.startMinuteOffset + booking.durationMinutes);
  }
  if (slot.totalMinutes - cursor >= minutes) {
    return cursor;
  }
  return null;
}

// Converts a minute-offset into an actual clock-time label, given the slot's start label.
// Assumes startLabel is like "8:00 AM" / "1:30 PM".
export function offsetToClockLabel(startLabel: string, offsetMinutes: number): string {
  const match = startLabel.match(/(\d+):(\d+)\s?(AM|PM)/i);
  if (!match) return startLabel;
  let [, hourStr, minuteStr, period] = match;
  let hour = parseInt(hourStr, 10) % 12;
  if (period.toUpperCase() === 'PM') hour += 12;
  let totalMinutes = hour * 60 + parseInt(minuteStr, 10) + offsetMinutes;
  totalMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  let outHour24 = Math.floor(totalMinutes / 60);
  const outMinute = totalMinutes % 60;
  const outPeriod = outHour24 >= 12 ? 'PM' : 'AM';
  let outHour12 = outHour24 % 12;
  if (outHour12 === 0) outHour12 = 12;
  return `${outHour12}:${outMinute.toString().padStart(2, '0')} ${outPeriod}`;
}

export function getBookedTimeRangeLabel(
  slot: ScheduleSlot,
  startOffset: number,
  durationMinutes: number
): string {
  const start = offsetToClockLabel(slot.startLabel, startOffset);
  const end = offsetToClockLabel(slot.startLabel, startOffset + durationMinutes);
  return `${start} - ${end}`;
}

export function bookMinutes(
  scheduleByDate: Record<number, ScheduleSlot[]>,
  date: number,
  slotId: string,
  minutes: number,
  studentName: string
): { scheduleByDate: Record<number, ScheduleSlot[]>; startOffset: number | null } {
  const slot = (scheduleByDate[date] ?? []).find((s) => s.id === slotId);
  if (!slot) return { scheduleByDate, startOffset: null };

  const startOffset = findNextAvailableOffset(slot, minutes);
  if (startOffset === null) return { scheduleByDate, startOffset: null };

  const newBooking: BookedRange = {
    bookingId: `${slotId}-${Date.now()}`,
    startMinuteOffset: startOffset,
    durationMinutes: minutes,
    studentName,
  };

  const updated = {
    ...scheduleByDate,
    [date]: (scheduleByDate[date] ?? []).map((s) =>
      s.id === slotId ? { ...s, bookings: [...s.bookings, newBooking] } : s
    ),
  };

  return { scheduleByDate: updated, startOffset };
}

export function releaseMinutes(
  scheduleByDate: Record<number, ScheduleSlot[]>,
  date: number,
  slotId: string,
  bookingId: string
): Record<number, ScheduleSlot[]> {
  return {
    ...scheduleByDate,
    [date]: (scheduleByDate[date] ?? []).map((slot) =>
      slot.id === slotId
        ? { ...slot, bookings: slot.bookings.filter((b) => b.bookingId !== bookingId) }
        : slot
    ),
  };
}

export const INITIAL_SCHEDULE_BY_DATE: Record<number, ScheduleSlot[]> = {
  11: [],
  12: [
    {
      id: 'slot-12-1',
      time: '9:00 AM - 11:00 AM',
      startLabel: '9:00 AM',
      mode: 'Face-to-Face',
      location: 'Office Room 204',
      totalMinutes: 120,
      bookings: [],
    },
    {
      id: 'slot-12-2',
      time: '1:00 PM - 3:00 PM',
      startLabel: '1:00 PM',
      mode: 'Online',
      location: 'Online (Google Meet)',
      totalMinutes: 120,
      bookings: [],
    },
  ],
  13: [
    {
      id: 'slot-13-1',
      time: '9:00 AM - 10:00 AM',
      startLabel: '9:00 AM',
      mode: 'Face-to-Face',
      location: 'Room 305, CHMC Main Campus',
      totalMinutes: 60,
      bookings: [
        { bookingId: 'demo-1', startMinuteOffset: 0, durationMinutes: 60, studentName: 'Demo Student' },
      ],
    },
    {
      id: 'slot-13-2',
      time: '10:00 AM - 11:00 AM',
      startLabel: '10:00 AM',
      mode: 'Face-to-Face',
      location: 'Room 305, CHMC Main Campus',
      totalMinutes: 60,
      bookings: [],
    },
    {
      id: 'slot-13-3',
      time: '2:00 PM - 3:00 PM',
      startLabel: '2:00 PM',
      mode: 'Online',
      location: 'Online (Zoom)',
      totalMinutes: 60,
      bookings: [],
    },
  ],
  14: [],
  15: [
    {
      id: 'slot-15-1',
      time: '11:00 AM - 2:00 PM',
      startLabel: '11:00 AM',
      mode: 'Face-to-Face',
      location: 'Library - Study Room 1',
      totalMinutes: 180,
      bookings: [],
    },
  ],
  16: [
    {
      id: 'slot-16-1',
      time: '9:00 AM - 11:00 AM',
      startLabel: '9:00 AM',
      mode: 'Face-to-Face',
      location: 'Lab Room 3',
      totalMinutes: 120,
      bookings: [],
    },
  ],
  17: [],
};