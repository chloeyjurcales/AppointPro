export type ConsultationMode = 'Face-to-Face' | 'Online';

export type ScheduleSlot = {
  id: string;
  time: string;
  mode: ConsultationMode;
  location: string;
  available: boolean;
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

export const SCHEDULE_BY_DATE: Record<number, ScheduleSlot[]> = {
  11: [],
  12: [
    {
      id: 'slot-12-1',
      time: '9:00 AM - 11:00 AM',
      mode: 'Face-to-Face',
      location: 'Office Room 204',
      available: true,
    },
    {
      id: 'slot-12-2',
      time: '1:00 PM - 3:00 PM',
      mode: 'Online',
      location: 'Online (Google Meet)',
      available: true,
    },
  ],
  13: [
    {
      id: 'slot-13-1',
      time: '9:00 AM - 10:00 AM',
      mode: 'Face-to-Face',
      location: 'Room 305, CHMC Main Campus',
      available: false,
    },
    {
      id: 'slot-13-2',
      time: '10:00 AM - 11:00 AM',
      mode: 'Face-to-Face',
      location: 'Room 305, CHMC Main Campus',
      available: true,
    },
    {
      id: 'slot-13-3',
      time: '2:00 PM - 3:00 PM',
      mode: 'Online',
      location: 'Online (Zoom)',
      available: true,
    },
  ],
  14: [],
  15: [
    {
      id: 'slot-15-1',
      time: '11:00 AM - 2:00 PM',
      mode: 'Face-to-Face',
      location: 'Library - Study Room 1',
      available: true,
    },
  ],
  16: [
    {
      id: 'slot-16-1',
      time: '9:00 AM - 11:00 AM',
      mode: 'Face-to-Face',
      location: 'Lab Room 3',
      available: true,
    },
  ],
  17: [],
};