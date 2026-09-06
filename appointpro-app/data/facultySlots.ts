export type ConsultationMode = 'Face-to-Face' | 'Online';

export type FacultySlot = {
  id: string;
  label: string;
  mode: ConsultationMode;
  location: string;
  enabled: boolean;
  recurring: boolean;
};

export type FacultyWeekDay = {
  day: string;
  date: number;
  fullLabel: string;
};

export const FACULTY_WEEK_DAYS: FacultyWeekDay[] = [
  { day: 'Sun', date: 11, fullLabel: 'Sunday, May 11, 2025' },
  { day: 'Mon', date: 12, fullLabel: 'Monday, May 12, 2025' },
  { day: 'Tue', date: 13, fullLabel: 'Tuesday, May 13, 2025' },
  { day: 'Wed', date: 14, fullLabel: 'Wednesday, May 14, 2025' },
  { day: 'Thu', date: 15, fullLabel: 'Thursday, May 15, 2025' },
  { day: 'Fri', date: 16, fullLabel: 'Friday, May 16, 2025' },
  { day: 'Sat', date: 17, fullLabel: 'Saturday, May 17, 2025' },
];

export const INITIAL_FACULTY_SLOTS_BY_DATE: Record<number, FacultySlot[]> = {
  11: [],
  12: [
    {
      id: '1',
      label: '9:00 AM - 11:00 AM',
      mode: 'Face-to-Face',
      location: 'Office Room 204',
      enabled: true,
      recurring: true,
    },
    {
      id: '2',
      label: '1:00 PM - 3:00 PM',
      mode: 'Online',
      location: 'Online (Google Meet)',
      enabled: true,
      recurring: true,
    },
    {
      id: '3',
      label: '12:00 PM - 2:00 PM',
      mode: 'Face-to-Face',
      location: 'Library - Study Room 1',
      enabled: true,
      recurring: false,
    },
    {
      id: '4',
      label: '10:00 AM - 12:00 PM',
      mode: 'Face-to-Face',
      location: 'Lab Room 3',
      enabled: false,
      recurring: false,
    },
  ],
  13: [],
  14: [],
  15: [],
  16: [],
  17: [],
};