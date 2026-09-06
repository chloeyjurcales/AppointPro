export type ConsultationMode = 'Face-to-Face' | 'Online';

export type ScheduleSlot = {
  id: string;
  time: string;
  mode: ConsultationMode;
  location: string;
  totalMinutes: number;
  bookedMinutes: number;
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

export function getRemainingMinutes(slot: ScheduleSlot): number {
  return Math.max(slot.totalMinutes - slot.bookedMinutes, 0);
}

export function isSlotFull(slot: ScheduleSlot): boolean {
  return getRemainingMinutes(slot) < SMALLEST_DURATION_MINUTES;
}

export function getFittingDurationOptions(slot: ScheduleSlot): DurationOption[] {
  const remaining = getRemainingMinutes(slot);
  return DURATION_OPTIONS.filter((d) => d.minutes <= remaining);
}

export function bookMinutes(
  scheduleByDate: Record<number, ScheduleSlot[]>,
  date: number,
  slotId: string,
  minutes: number
): Record<number, ScheduleSlot[]> {
  return {
    ...scheduleByDate,
    [date]: (scheduleByDate[date] ?? []).map((slot) =>
      slot.id === slotId
        ? { ...slot, bookedMinutes: slot.bookedMinutes + minutes }
        : slot
    ),
  };
}

export function releaseMinutes(
  scheduleByDate: Record<number, ScheduleSlot[]>,
  date: number,
  slotId: string,
  minutes: number
): Record<number, ScheduleSlot[]> {
  return {
    ...scheduleByDate,
    [date]: (scheduleByDate[date] ?? []).map((slot) =>
      slot.id === slotId
        ? { ...slot, bookedMinutes: Math.max(slot.bookedMinutes - minutes, 0) }
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
      mode: 'Face-to-Face',
      location: 'Office Room 204',
      totalMinutes: 120,
      bookedMinutes: 0,
    },
    {
      id: 'slot-12-2',
      time: '1:00 PM - 3:00 PM',
      mode: 'Online',
      location: 'Online (Google Meet)',
      totalMinutes: 120,
      bookedMinutes: 0,
    },
  ],
  13: [
    {
      id: 'slot-13-1',
      time: '9:00 AM - 10:00 AM',
      mode: 'Face-to-Face',
      location: 'Room 305, CHMC Main Campus',
      totalMinutes: 60,
      bookedMinutes: 60,
    },
    {
      id: 'slot-13-2',
      time: '10:00 AM - 11:00 AM',
      mode: 'Face-to-Face',
      location: 'Room 305, CHMC Main Campus',
      totalMinutes: 60,
      bookedMinutes: 0,
    },
    {
      id: 'slot-13-3',
      time: '2:00 PM - 3:00 PM',
      mode: 'Online',
      location: 'Online (Zoom)',
      totalMinutes: 60,
      bookedMinutes: 0,
    },
  ],
  14: [],
  15: [
    {
      id: 'slot-15-1',
      time: '11:00 AM - 2:00 PM',
      mode: 'Face-to-Face',
      location: 'Library - Study Room 1',
      totalMinutes: 180,
      bookedMinutes: 0,
    },
  ],
  16: [
    {
      id: 'slot-16-1',
      time: '9:00 AM - 11:00 AM',
      mode: 'Face-to-Face',
      location: 'Lab Room 3',
      totalMinutes: 120,
      bookedMinutes: 0,
    },
  ],
  17: [],
};