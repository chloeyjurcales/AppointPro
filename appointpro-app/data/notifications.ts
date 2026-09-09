import { Ionicons } from '@expo/vector-icons';

export type NotificationItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  time: string;
  read: boolean;
};

export const INITIAL_STUDENT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    icon: 'notifications-outline',
    title: 'Appointment Reminder',
    description: 'You have an appointment today at 10:00 AM.',
    time: '8:00 AM',
    read: false,
  },
  {
    id: '2',
    icon: 'sync-outline',
    title: 'Queue Update',
    description: "You're next in line.",
    time: '9:30 AM',
    read: false,
  },
  {
    id: '3',
    icon: 'megaphone-outline',
    title: 'Faculty Announcement',
    description: 'New schedule for this week.',
    time: '7:30 AM',
    read: true,
  },
  {
    id: '4',
    icon: 'notifications-outline',
    title: 'Appointment Reminder',
    description: 'You have an appointment today at 11:00 AM.',
    time: '8:00 AM',
    read: false,
  },
  {
    id: '5',
    icon: 'sync-outline',
    title: 'Queue Update',
    description: "You're next in line.",
    time: '11:30 AM',
    read: true,
  },
];

// Formats the current time the same way the mock data above is formatted
// (e.g. "9:05 AM"), so notifications generated at runtime match the rest
// of the list.
export function formatNotificationTime(date: Date = new Date()): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const paddedMinutes = minutes.toString().padStart(2, '0');
  return `${hours}:${paddedMinutes} ${period}`;
}

// Builds a new notification with a unique id and the current time, so
// callers only need to supply the icon/title/description.
export function createNotification(
  input: Pick<NotificationItem, 'icon' | 'title' | 'description'>
): NotificationItem {
  return {
    id: `n-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    time: formatNotificationTime(),
    read: false,
    ...input,
  };
}