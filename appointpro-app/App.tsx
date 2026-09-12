import React, { useState, useRef, useEffect } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { colors, spacing } from './theme';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './screens/LoginScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import SettingsScreen from './screens/SettingsScreen';
import AccountTypeScreen from './screens/AccountTypeScreen';
import StudentSignUpScreen from './screens/StudentSignUpScreen';
import FacultySignUpScreen from './screens/FacultySignUpScreen';
import HomeScreen from './screens/HomeScreen';
import DirectoryScreen, { FacultyMember } from './screens/DirectoryScreen';
import FacultyProfileScreen from './screens/FacultyProfileScreen';
import BookAppointmentScreen, { BookingSelection } from './screens/BookAppointmentScreen';
import BookingConfirmationScreen from './screens/BookingConfirmationScreen';
import BookingCancellationScreen from './screens/BookingCancellationScreen';
import AppointmentDetailsScreen from './screens/AppointmentDetailsScreen';
import AppointmentsScreen from './screens/AppointmentsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import ProfileScreen from './screens/ProfileScreen';
import FacultyHomeScreen from './screens/FacultyHomeScreen';
import FacultyDirectoryScreen, {
  StudentAppointment,
  DEFAULT_APPOINTMENTS,
} from './screens/FacultyDirectoryScreen';
import StudentProfileScreen from './screens/StudentProfileScreen';
import FacultyAvailabilityScreen from './screens/FacultyAvailabilityScreen';
import AddTimeSlotScreen, { NewFacultySlotInput } from './screens/AddTimeSlotScreen';
import FacultyNotificationsScreen from './screens/FacultyNotificationsScreen';
import FacultyProfileMenuScreen from './screens/FacultyProfileMenuScreen';
import FacultyScheduleCalendarScreen from './screens/FacultyScheduleCalendarScreen';
import PersonalInformationScreen, {
  PersonalInformation,
} from './screens/PersonalInformationScreen';
import FacultyPersonalInformationScreen, {
  FacultyPersonalInformation,
} from './screens/FacultyPersonalInformationScreen';
import AboutScreen from './screens/AboutScreen';
import QueueScreen from './screens/QueueScreen';
import FacultyRescheduleAppointmentScreen from './screens/FacultyRescheduleAppointmentScreen';
import RescheduleProposalScreen from './screens/RescheduleProposalScreen';
import FacultyCancelAppointmentScreen from './screens/FacultyCancelAppointmentScreen';
import FacultyActionSuccessScreen, {
  FacultyActionSuccessType,
} from './screens/FacultyActionSuccessScreen';
import BookingRescheduleScreen from './screens/BookingRescheduleScreen';
import RecurringScheduleScreen from './screens/RecurringScheduleScreen';
import SideMenu, { SideMenuKey, SideMenuRole } from './components/SideMenu';
import { TabKey } from './components/BottomTabBar';
import { FacultyTabKey } from './components/FacultyBottomTabBar';
import {
  ScheduleSlot,
  BookedRange,
  WEEK_DAYS,
  INITIAL_SCHEDULE_BY_DATE,
  bookMinutes,
  releaseMinutes,
  getBookedTimeRangeLabel,
} from './data/facultySchedule';
import {
  FacultySlot,
  INITIAL_FACULTY_SLOTS_BY_DATE,
  toDateKey,
} from './data/facultySlots';
import { RecurringRule } from './data/recurringSchedule';
import { QueueEntry, INITIAL_QUEUE, AVERAGE_WAIT_MINUTES_PER_STUDENT } from './data/queue';
import {
  NotificationItem,
  DbNotification,
  mapDbNotification,
} from './data/notifications';

type Screen =
  | 'login'
  | 'forgotPassword'
  | 'accountType'
  | 'studentSignUp'
  | 'facultySignUp'
  | 'home'
  | 'directory'
  | 'facultyProfile'
  | 'bookAppointment'
  | 'rescheduleAppointment'
  | 'bookingConfirmation'
  | 'bookingCancellation'
  | 'bookingReschedule'
  | 'appointmentDetails'
  | 'appointments'
  | 'notifications'
  | 'profile'
  | 'facultyHome'
  | 'facultyDirectory'
  | 'studentProfile'
  | 'facultyAvailability'
  | 'addTimeSlot'
  | 'facultyNotifications'
  | 'facultyProfileMenu'
  | 'facultySchedule'
  | 'settings'
  | 'personalInformation'
  | 'facultyPersonalInformation'
  | 'about'
  | 'queue'
  | 'facultyRescheduleAppointment'
  | 'rescheduleProposal'
  | 'facultyCancelAppointment'
  | 'facultyActionSuccess'
  | 'recurringSchedule';

type StudentProfileData = PersonalInformation & { studentId: string; role: string };
type FacultyProfileData = FacultyPersonalInformation & { employeeId: string; department: string };

type PendingReschedule = {
  reason: string;
  originalDateLabel: string;
  originalTime: string;
  originalLocation: string;
  originalMode: string;
  proposedDateLabel: string;
  proposedTime: string;
  proposedLocation: string;
  proposedMode: string;
};

// Drives the confirmation screen shown to the faculty member right after
// they cancel or reschedule a student's appointment.
type FacultyActionResult = {
  type: FacultyActionSuccessType;
  studentName: string;
  category: string;
  dateLabel: string;
  timeLabel: string;
  location: string;
  mode: string;
  reason?: string;
  meetingLink?: string;
  referenceNo: string;
};

// Drives the confirmation screen shown to the student right after they
// cancel or reschedule their own appointment.
type StudentBookingResult = {
  type: 'cancelled' | 'rescheduled';
  doctorName: string;
  department: string;
  dateLabel: string;
  timeLabel: string;
  category: string;
  location: string;
  mode: string;
  referenceNo: string;
};


// Turns a bookingId (e.g. "slot-3-1725720000000") into a stable, readable
// reference number like "APP-2026-720000" for the confirmation screens.
function toReferenceNo(bookingId: string): string {
  const digits = bookingId.replace(/\D/g, '').slice(-6).padStart(6, '0');
  return `APP-2026-${digits}`;
}

// Parses the start time out of a booked time-range label like
// "9:00 AM - 9:30 AM" and reports whether that moment has arrived yet.
// Used to only surface the Home screen's Queue card once a student's
// appointment window has actually begun.
function hasTimeArrived(bookedTimeRangeLabel: string | undefined, now: Date): boolean {
  if (!bookedTimeRangeLabel) return false;
  const startPart = bookedTimeRangeLabel.split('-')[0]?.trim();
  const match = startPart?.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return false;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  const startTime = new Date(now);
  startTime.setHours(hours, minutes, 0, 0);
  return now.getTime() >= startTime.getTime();
}

// --- Faculty availability: DB row shapes + mapping to/from the local
// FacultySlot/RecurringRule shapes the rest of the app already uses ---
type AvailabilitySlotRow = {
  id: string;
  faculty_id: string;
  rule_id: string | null;
  date: string; // 'YYYY-MM-DD'
  start_time: string; // 'HH:MM:SS'
  end_time: string;
  mode: 'Face-to-Face' | 'Online';
  location: string;
  total_minutes: number;
  enabled: boolean;
};

type RecurringRuleRow = {
  id: string;
  faculty_id: string;
  days_of_week: number[];
  start_time: string;
  end_time: string;
  mode: 'Face-to-Face' | 'Online';
  location: string;
  start_date: string;
  end_date: string;
};

// Builds a "HH:MM:00" 24h time string from 12h form input (accepts either
// numbers from a RecurringRule or raw strings from the Add Slot form).
function to24hTime(hour: number | string, minute: number | string, period: 'AM' | 'PM'): string {
  let h = parseInt(String(hour), 10) % 12;
  if (period === 'PM') h += 12;
  const m = parseInt(String(minute), 10);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
}

function minutesBetween(startTime24: string, endTime24: string): number {
  const [sh, sm] = startTime24.split(':').map(Number);
  const [eh, em] = endTime24.split(':').map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

function formatTime12h(time24: string): { display: string; period: 'AM' | 'PM'; hour: number; minute: number } {
  const [hStr, mStr] = time24.split(':');
  const h24 = parseInt(hStr, 10);
  const minute = parseInt(mStr, 10);
  const period: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
  let hour = h24 % 12;
  if (hour === 0) hour = 12;
  return { display: `${hour}:${minute.toString().padStart(2, '0')} ${period}`, period, hour, minute };
}

function mapAvailabilitySlotRow(row: AvailabilitySlotRow): FacultySlot {
  const start = formatTime12h(row.start_time);
  const end = formatTime12h(row.end_time);
  return {
    id: row.id,
    label: `${start.display} - ${end.display}`,
    mode: row.mode,
    location: row.location,
    enabled: row.enabled,
    recurring: !!row.rule_id,
    ruleId: row.rule_id ?? undefined,
  };
}

function mapRecurringRuleRow(row: RecurringRuleRow): RecurringRule {
  const start = formatTime12h(row.start_time);
  const end = formatTime12h(row.end_time);
  return {
    id: row.id,
    daysOfWeek: row.days_of_week,
    startHour: start.hour,
    startMinute: start.minute,
    startPeriod: start.period,
    endHour: end.hour,
    endMinute: end.minute,
    endPeriod: end.period,
    mode: row.mode,
    location: row.location,
    createdDateKey: row.start_date,
    semesterEndDateKey: row.end_date,
  };
}

// --- Real per-faculty bookable schedule (what students see/book) ---
type SlotBookingRow = {
  id: string;
  slot_id: string;
  appointment_id: string;
  start_minute: number;
  duration_minutes: number;
};

// Parses a 12h label like "9:30 AM" into a "HH:MM:00" 24h time string.
function labelTo24h(label: string): string {
  const match = label.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return '00:00:00';
  let h = parseInt(match[1], 10) % 12;
  if (match[3].toUpperCase() === 'PM') h += 12;
  return `${h.toString().padStart(2, '0')}:${match[2]}:00`;
}

// Fetches a specific faculty's real availability for the current real
// week (WEEK_DAYS), plus everyone's existing slot_bookings so remaining
// capacity is accurate — not just "the one demo faculty's" fake calendar.
async function fetchFacultyWeekSchedule(
  facultyId: string
): Promise<Record<number, ScheduleSlot[]>> {
  const dateKeys = WEEK_DAYS.map((d) => d.dateKey);
  const dateKeyToDayNum = new Map(WEEK_DAYS.map((d) => [d.dateKey, d.date]));

  const { data: slotRows, error } = await supabase
    .from('availability_slots')
    .select('*')
    .eq('faculty_id', facultyId)
    .eq('enabled', true)
    .in('date', dateKeys);

  if (error || !slotRows || slotRows.length === 0) return {};

  const rows = slotRows as AvailabilitySlotRow[];
  const slotIds = rows.map((r) => r.id);
  const { data: bookingRows } = await supabase
    .from('slot_bookings')
    .select('*')
    .in('slot_id', slotIds);

  const byDayNum: Record<number, ScheduleSlot[]> = {};
  rows.forEach((row) => {
    const dayNum = dateKeyToDayNum.get(row.date);
    if (dayNum === undefined) return;

    const start = formatTime12h(row.start_time);
    const end = formatTime12h(row.end_time);
    const bookings: BookedRange[] = ((bookingRows ?? []) as SlotBookingRow[])
      .filter((b) => b.slot_id === row.id)
      .map((b) => ({
        bookingId: b.id,
        startMinuteOffset: b.start_minute,
        durationMinutes: b.duration_minutes,
        // Other students' names aren't needed for capacity math and
        // shouldn't be exposed to whoever's browsing this slot.
        studentName: 'Booked',
      }));

    const slot: ScheduleSlot = {
      id: row.id,
      time: `${start.display} - ${end.display}`,
      startLabel: start.display,
      mode: row.mode,
      location: row.location,
      totalMinutes: row.total_minutes,
      bookings,
    };
    byDayNum[dayNum] = [...(byDayNum[dayNum] ?? []), slot];
  });

  return byDayNum;
}

// Directory appointments store mode/room in a compact shape; these turn
// them into the plain display strings the reschedule/cancel/success
// screens expect.
function directoryLocationLabel(appt: StudentAppointment): string {
  if (appt.mode === 'online') return 'Online';
  return appt.room ?? 'Face-to-Face';
}

function directoryModeLabel(appt: StudentAppointment): string {
  return appt.mode === 'online' ? 'Online' : 'Face-to-Face';
}

function AppContent() {
  const [screen, setScreen] = useState<Screen>('login');
  const [previousScreen, setPreviousScreen] = useState<Screen>('profile');
  const [userRole, setUserRole] = useState<SideMenuRole>('student');
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  // Whether a chime plays when a new student notification arrives —
  // toggled from Settings. Defaults on so the feature is discoverable.
  const [soundEnabled, setSoundEnabled] = useState(true);
  const notificationSoundPlayer = useAudioPlayer(
    require('./assets/sounds/notification.wav')
  );

  // Lightweight app-wide toast for actions that are wired up but don't
  // have a real destination yet (e.g. "Filters", "More options") — so
  // every button gives real feedback on tap instead of doing nothing.
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 2200);
  };


  const [studentProfile, setStudentProfile] = useState<StudentProfileData>({
    name: '',
    role: 'Student',
    studentId: '',
    email: '',
    department: '',
    yearLevel: '',
  });

  const [facultyProfile, setFacultyProfile] = useState<FacultyProfileData>({
    name: '',
    department: '',
    employeeId: '',
    email: '',
    fullDepartment: '',
    consultationTypes: 'Face-to-Face   Online',
  });

  // --- Real auth/session, backed by Supabase ---
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  // Guards against double-tapping a login/signup button firing the
  // request twice (e.g. a second signUp for the same email landing a
  // split second after the first one already succeeded, which Supabase
  // correctly — but confusingly — reports as "already registered").
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Pulls the signed-in user's real profile (+ role-specific student/
  // faculty row) from Supabase and populates studentProfile/facultyProfile
  // — this is what makes the displayed name match what they typed at
  // sign-up instead of a hardcoded placeholder.
  const loadProfileForUser = async (userId: string): Promise<'student' | 'faculty' | null> => {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      setAuthError(profileError?.message ?? 'Could not load your profile.');
      return null;
    }

    if (profile.role === 'student') {
      const { data: student } = await supabase
        .from('students')
        .select('*')
        .eq('profile_id', userId)
        .single();

      setStudentProfile({
        name: profile.full_name,
        role: student?.year_level ? `${student.year_level} Student` : 'Student',
        studentId: student?.student_id ?? '',
        email: profile.email,
        department: student?.department ?? '',
        yearLevel: student?.year_level ?? '',
      });
      setUserRole('student');
      return 'student';
    }

    const { data: faculty } = await supabase
      .from('faculty')
      .select('*')
      .eq('profile_id', userId)
      .single();

    setFacultyProfile({
      name: profile.full_name,
      department: faculty?.department ?? '',
      employeeId: faculty?.faculty_id ?? '',
      email: profile.email,
      fullDepartment: faculty?.department ?? '',
      consultationTypes: 'Face-to-Face   Online',
    });
    setUserRole('faculty');
    return 'faculty';
  };

  // Restore an existing session on app launch, and keep profile data in
  // sync with auth state (login, logout, token refresh) from anywhere.
  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      if (data.session) {
        loadProfileForUser(data.session.user.id).then((role) => {
          if (!isMounted) return;
          // Session restored on app relaunch — go straight to that
          // role's home screen instead of leaving them on Login.
          if (role) setScreen(role === 'faculty' ? 'facultyHome' : 'home');
          setAuthLoading(false);
        });
      } else {
        setAuthLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, newSession: Session | null) => {
        if (!isMounted) return;
        setSession(newSession);
        if (newSession) {
          loadProfileForUser(newSession.user.id);
        } else {
          // Signed out from anywhere (including token expiry) — make sure
          // the UI actually returns to the login screen.
          setScreen('login');
        }
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Ref so the realtime subscription below doesn't need to resubscribe
  // every time the Notification Sound setting is flipped.
  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Loads this student's real notifications on login, then keeps them
  // live via Supabase Realtime — new rows (including ones your DB
  // triggers insert automatically, e.g. on appointment status changes)
  // appear immediately without polling, and only ever append once.
  useEffect(() => {
    if (!session) {
      setStudentNotifications([]);
      return;
    }

    let isMounted = true;

    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          console.log('Failed to load notifications:', error.message);
          return;
        }
        setStudentNotifications((data as DbNotification[]).map(mapDbNotification));
      });

    const channel = supabase
      .channel(`notifications-${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          const newItem = mapDbNotification(payload.new as DbNotification);
          setStudentNotifications((prev) => [newItem, ...prev]);
          if (soundEnabledRef.current) {
            try {
              notificationSoundPlayer.seekTo(0);
              notificationSoundPlayer.play();
            } catch {
              // Never let sound playback failures (e.g. unsupported
              // simulator) block the notification itself.
            }
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [session]);

  // --- Faculty directory (real data) ---
  const [facultyDirectory, setFacultyDirectory] = useState<FacultyMember[]>([]);
  const [facultyDirectoryLoading, setFacultyDirectoryLoading] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);

  useEffect(() => {
    if (!session) {
      setFacultyDirectory([]);
      return;
    }

    let isMounted = true;
    setFacultyDirectoryLoading(true);

    supabase
      .from('faculty')
      .select('profile_id, department, role_title, is_available, profiles(full_name)')
      .then(({ data, error }) => {
        if (!isMounted) return;
        setFacultyDirectoryLoading(false);
        if (error) {
          console.log('Failed to load faculty directory:', error.message);
          return;
        }
        type FacultyRow = {
          profile_id: string;
          department: string | null;
          role_title: string;
          is_available: boolean;
          profiles: { full_name: string } | { full_name: string }[] | null;
        };
        const rows = (data ?? []) as FacultyRow[];
        setFacultyDirectory(
          rows.map((row) => {
            const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
            return {
              id: row.profile_id,
              name: profile?.full_name ?? 'Unknown Faculty',
              role: row.role_title,
              department: row.department ?? '',
              status: row.is_available ? 'available' : 'unavailable',
            };
          })
        );
      });

    return () => {
      isMounted = false;
    };
  }, [session]);

  const [scheduleByDate, setScheduleByDate] =
    useState<Record<number, ScheduleSlot[]>>(INITIAL_SCHEDULE_BY_DATE);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // Whenever a student picks a specific faculty from the Directory,
  // fetch THAT faculty's real bookable schedule for the current week —
  // scheduleByDate now represents whoever's actually selected, not a
  // single hardcoded demo faculty.
  useEffect(() => {
    if (!selectedFaculty) {
      setScheduleByDate({});
      return;
    }
    let isMounted = true;
    setScheduleLoading(true);
    fetchFacultyWeekSchedule(selectedFaculty.id).then((byDayNum) => {
      if (!isMounted) return;
      setScheduleByDate(byDayNum);
      setScheduleLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [selectedFaculty]);

  const [facultySlotsByDate, setFacultySlotsByDate] =
    useState<Record<string, FacultySlot[]>>(INITIAL_FACULTY_SLOTS_BY_DATE);
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([]);
  const [addSlotForDate, setAddSlotForDate] = useState<string>(toDateKey(new Date()));

  // Loads the logged-in faculty's real availability slots + recurring
  // rules from Supabase so "My Schedule"/the Availability screen show
  // what they've actually set up, not local mock data.
  useEffect(() => {
    if (!session || userRole !== 'faculty') return;
    let isMounted = true;

    supabase
      .from('availability_slots')
      .select('*')
      .eq('faculty_id', session.user.id)
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          console.log('Failed to load availability slots:', error.message);
          return;
        }
        const byDate: Record<string, FacultySlot[]> = {};
        (data as AvailabilitySlotRow[]).forEach((row) => {
          byDate[row.date] = [...(byDate[row.date] ?? []), mapAvailabilitySlotRow(row)];
        });
        setFacultySlotsByDate(byDate);
      });

    supabase
      .from('recurring_rules')
      .select('*')
      .eq('faculty_id', session.user.id)
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          console.log('Failed to load recurring rules:', error.message);
          return;
        }
        setRecurringRules((data as RecurringRuleRow[]).map(mapRecurringRuleRow));
      });

    return () => {
      isMounted = false;
    };
  }, [session, userRole]);

  const [bookingPreselect, setBookingPreselect] = useState<{
    date?: number;
    slotId?: string;
  } | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingSelection | null>(null);
  const [isChoosingAfterReject, setIsChoosingAfterReject] = useState(false);
  const [pendingReschedule, setPendingReschedule] = useState<PendingReschedule | null>(null);
  const [cancelledNotice, setCancelledNotice] = useState<string | null>(null);
  const [facultyActionResult, setFacultyActionResult] = useState<FacultyActionResult | null>(
    null
  );
  const [studentBookingResult, setStudentBookingResult] = useState<StudentBookingResult | null>(
    null
  );

  const [studentNotifications, setStudentNotifications] = useState<NotificationItem[]>([]);

  const [queue, setQueue] = useState<QueueEntry[]>(INITIAL_QUEUE);
  const [currentStudentQueueId, setCurrentStudentQueueId] = useState<string | null>(null);

  // Ticks every second so the live countdowns (session time remaining,
  // estimated wait) actually move in real time, and so a booked
  // appointment's start time gets picked up right on time.
  const [nowTick, setNowTick] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNowTick(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hasAppointmentStarted = confirmedBooking
    ? hasTimeArrived(confirmedBooking.bookedTimeRangeLabel, nowTick)
    : false;

  // Once the booked start time arrives, the student is automatically
  // placed in today's queue (if they aren't already) — carrying their
  // actual chosen appointment duration so the countdown is real.
  useEffect(() => {
    if (hasAppointmentStarted && confirmedBooking && !currentStudentQueueId) {
      const newEntry: QueueEntry = {
        id: `q-${Date.now()}`,
        studentName: studentProfile.name,
        durationMinutes: confirmedBooking.durationMinutes,
        startedAt: null,
      };
      setQueue((prev) => [...prev, newEntry]);
      setCurrentStudentQueueId(newEntry.id);
    }
  }, [hasAppointmentStarted, confirmedBooking, currentStudentQueueId]);

  // Whoever reaches the front of the queue is marked "now serving" (their
  // countdown starts) the moment it happens, and — if that's the demo
  // student — gets notified it's their turn, for their full chosen
  // duration (e.g. "you have 60 minutes").
  useEffect(() => {
    if (queue.length === 0) return;
    const front = queue[0];
    if (front.startedAt !== null) return;

    const startedAt = Date.now();
    setQueue((prev) =>
      prev.map((entry) => (entry.id === front.id ? { ...entry, startedAt } : entry))
    );

    if (front.id === currentStudentQueueId) {
      addStudentNotification({
        icon: 'time-outline',
        title: "It's Your Turn",
        description: `Your appointment with ${facultyProfile.name} has started — you have ${front.durationMinutes} minute${front.durationMinutes === 1 ? '' : 's'}.`,
      });
    }
  }, [queue, currentStudentQueueId, facultyProfile.name]);


  const [selectedStudent, setSelectedStudent] = useState<StudentAppointment | null>(null);

  // The faculty member's list of student appointments shown in the
  // Directory tab. Kept in state (rather than a static constant) so that
  // faculty-initiated reschedules/cancellations actually update what's
  // shown there.
  const [facultyAppointments, setFacultyAppointments] =
    useState<StudentAppointment[]>(DEFAULT_APPOINTMENTS);
  // The specific appointment a faculty member tapped "Reschedule" or
  // "Cancel" on from the Directory — this is what the reschedule/cancel
  // screens and their confirm handlers operate on.
  const [facultyActionAppointment, setFacultyActionAppointment] =
    useState<StudentAppointment | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Stop any in-flight transition before starting the next one so rapid
    // screen switches (e.g. fast tab taps) don't fight each other or jump.
    fadeAnim.stopAnimation();
    slideAnim.stopAnimation();
    fadeAnim.setValue(0);
    slideAnim.setValue(28);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [screen]);

  const handleTabChange = (tab: TabKey) => {
    switch (tab) {
      case 'home':
        setScreen('home');
        break;
      case 'directory':
        setScreen('directory');
        break;
      case 'appointments':
        setScreen('appointments');
        break;
      case 'notifications':
        setScreen('notifications');
        break;
      case 'profile':
        setScreen('profile');
        break;
    }
  };

  const handleFacultyTabChange = (tab: FacultyTabKey) => {
    switch (tab) {
      case 'home':
        setScreen('facultyHome');
        break;
      case 'appointment':
        setScreen('facultyAvailability');
        break;
      case 'directory':
        setScreen('facultyDirectory');
        break;
      case 'notifications':
        setScreen('facultyNotifications');
        break;
      case 'profile':
        setScreen('facultyProfileMenu');
        break;
    }
  };

  const goToPersonalInformation = (from: Screen) => {
    setPreviousScreen(from);
    setScreen('personalInformation');
  };

  const goToFacultyPersonalInformation = (from: Screen) => {
    setPreviousScreen(from);
    setScreen('facultyPersonalInformation');
  };

  const goToAbout = (from: Screen) => {
    setPreviousScreen(from);
    setScreen('about');
  };

  // --- Side menu handlers ---
  const openSideMenu = (role: SideMenuRole) => {
    setUserRole(role);
    setSideMenuOpen(true);
  };

  const handleSideMenuNavigate = (key: SideMenuKey) => {
    setSideMenuOpen(false);
    if (key === 'helpSupport') {
      goToAbout(screen);
      return;
    }
    if (key === 'settings') {
      setPreviousScreen(screen);
      setScreen('settings');
      return;
    }
    setScreen(key);
  };

  // Maps the current app screen back to a SideMenu key so the matching
  // row can be highlighted while the menu is open.
  const sideMenuActiveKey: SideMenuKey | undefined = (
    [
      'home',
      'directory',
      'appointments',
      'notifications',
      'profile',
      'facultyHome',
      'facultyDirectory',
      'facultyAvailability',
      'facultyNotifications',
      'facultyProfileMenu',
      'settings',
    ] as SideMenuKey[]
  ).includes(screen as SideMenuKey)
    ? (screen as SideMenuKey)
    : undefined;

  const handleSideMenuLogout = () => {
    setSideMenuOpen(false);
    supabase.auth.signOut();
    setScreen('login');
  };

  // --- Faculty availability editing handlers (one-off slots) ---
  const handleToggleFacultySlot = async (dateKey: string, slotId: string) => {
    const current = facultySlotsByDate[dateKey]?.find((s) => s.id === slotId);
    if (!current) return;
    const nextEnabled = !current.enabled;

    setFacultySlotsByDate((prev) => ({
      ...prev,
      [dateKey]: (prev[dateKey] ?? []).map((s) =>
        s.id === slotId ? { ...s, enabled: nextEnabled } : s
      ),
    }));

    const { error } = await supabase
      .from('availability_slots')
      .update({ enabled: nextEnabled })
      .eq('id', slotId);
    if (error) showToast('Could not update slot.');
  };

  const handleDeleteFacultySlot = async (dateKey: string, slotId: string) => {
    setFacultySlotsByDate((prev) => ({
      ...prev,
      [dateKey]: (prev[dateKey] ?? []).filter((s) => s.id !== slotId),
    }));

    const { error } = await supabase.from('availability_slots').delete().eq('id', slotId);
    if (error) showToast('Could not delete slot.');
  };

  const handleAddTimeSlot = (dateKey: string) => {
    setAddSlotForDate(dateKey);
    setScreen('addTimeSlot');
  };

  const handleConfirmNewFacultySlot = async (data: NewFacultySlotInput) => {
    if (!session) return;
    const startTime = to24hTime(data.startHour, data.startMinute, data.startPeriod);
    const endTime = to24hTime(data.endHour, data.endMinute, data.endPeriod);

    const { data: inserted, error } = await supabase
      .from('availability_slots')
      .insert({
        faculty_id: session.user.id,
        date: addSlotForDate,
        start_time: startTime,
        end_time: endTime,
        mode: data.mode,
        location: data.location,
        total_minutes: minutesBetween(startTime, endTime),
      })
      .select()
      .single();

    if (error || !inserted) {
      showToast(error?.message ?? 'Could not add time slot.');
      return;
    }

    const newSlot = mapAvailabilitySlotRow(inserted as AvailabilitySlotRow);
    setFacultySlotsByDate((prev) => ({
      ...prev,
      [addSlotForDate]: [...(prev[addSlotForDate] ?? []), newSlot],
    }));
    setScreen('facultyAvailability');
  };

  // --- Recurring weekly schedule handlers ---
  const handleCreateRecurringRule = async (rule: RecurringRule) => {
    if (!session) return;
    const startTime = to24hTime(rule.startHour, rule.startMinute, rule.startPeriod);
    const endTime = to24hTime(rule.endHour, rule.endMinute, rule.endPeriod);
    const totalMinutes = minutesBetween(startTime, endTime);

    const { data: insertedRule, error: ruleError } = await supabase
      .from('recurring_rules')
      .insert({
        faculty_id: session.user.id,
        days_of_week: rule.daysOfWeek,
        start_time: startTime,
        end_time: endTime,
        mode: rule.mode,
        location: rule.location,
        start_date: rule.createdDateKey,
        end_date: rule.semesterEndDateKey,
      })
      .select()
      .single();

    if (ruleError || !insertedRule) {
      showToast(ruleError?.message ?? 'Could not save recurring schedule.');
      return;
    }

    // Generate one concrete availability_slots row per matching date in
    // the range, and insert them all in a single call.
    const start = new Date(rule.createdDateKey + 'T00:00:00');
    const end = new Date(rule.semesterEndDateKey + 'T00:00:00');
    const rowsToInsert: Record<string, unknown>[] = [];
    const cursor = new Date(start);
    let safety = 0;
    while (cursor <= end && safety < 400) {
      safety++;
      if (rule.daysOfWeek.includes(cursor.getDay())) {
        rowsToInsert.push({
          faculty_id: session.user.id,
          rule_id: insertedRule.id,
          date: toDateKey(cursor),
          start_time: startTime,
          end_time: endTime,
          mode: rule.mode,
          location: rule.location,
          total_minutes: totalMinutes,
        });
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    const { data: insertedSlots, error: slotsError } = await supabase
      .from('availability_slots')
      .insert(rowsToInsert)
      .select();

    if (slotsError) {
      showToast('Recurring schedule saved, but some slots failed to generate.');
    }

    const generatedSlots = (insertedSlots ?? []) as AvailabilitySlotRow[];
    setFacultySlotsByDate((prev) => {
      const merged = { ...prev };
      generatedSlots.forEach((row) => {
        merged[row.date] = [...(merged[row.date] ?? []), mapAvailabilitySlotRow(row)];
      });
      return merged;
    });
    setRecurringRules((prev) => [...prev, mapRecurringRuleRow(insertedRule as RecurringRuleRow)]);
    setScreen('facultyAvailability');
  };

  const handleDeleteRecurringRule = async (ruleId: string) => {
    setRecurringRules((prev) => prev.filter((r) => r.id !== ruleId));
    setFacultySlotsByDate((prev) => {
      const updated: Record<string, FacultySlot[]> = {};
      Object.entries(prev).forEach(([dateKey, slots]) => {
        updated[dateKey] = slots.filter((s) => s.ruleId !== ruleId);
      });
      return updated;
    });

    const { error: slotsError } = await supabase
      .from('availability_slots')
      .delete()
      .eq('rule_id', ruleId);
    if (slotsError) showToast('Could not delete the generated slots.');

    const { error: ruleError } = await supabase
      .from('recurring_rules')
      .delete()
      .eq('id', ruleId);
    if (ruleError) showToast('Could not delete recurring schedule.');
  };

  // --- Queue handlers ---
  // Faculty presses "Done" once a student's consultation wraps up
  // (including early finishes) — this removes them from the front of the
  // queue and shifts everyone else's position/estimated wait up.
  const handleCompleteCurrentQueue = () => {
    if (queue.length === 0) return;
    const completed = queue[0];
    setQueue((prev) => prev.slice(1));

    if (completed.id === currentStudentQueueId) {
      setCurrentStudentQueueId(null);
      addStudentNotification({
        icon: 'checkmark-circle-outline',
        title: 'Appointment Completed',
        description: `Your consultation with ${facultyProfile.name} is done. Thank you!`,
      });
    }
  };

  // --- Notifications ---
  // Pushes a new notification onto the student's notification feed. Used
  // to notify the student whenever a faculty member cancels or proposes a
  // reschedule for their appointment.
  // Inserts into the real notifications table — local state is updated by
  // the realtime subscription below (not here), so a notification only
  // ever gets appended/sounded once even though many places in the app
  // call this function.
  const addStudentNotification = async (
    input: Pick<NotificationItem, 'icon' | 'title' | 'description'>
  ) => {
    if (!session) return;
    const { error } = await supabase.from('notifications').insert({
      user_id: session.user.id,
      icon: input.icon,
      title: input.title,
      description: input.description,
    });
    if (error) {
      console.log('Failed to save notification:', error.message);
    }
  };

  const handleDeleteStudentNotifications = async (ids: string[]) => {
    setStudentNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));
    const { error } = await supabase.from('notifications').delete().in('id', ids);
    if (error) showToast('Could not delete notifications.');
  };

  const handleMarkAllStudentNotificationsRead = async () => {
    if (!session) return;
    setStudentNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', session.user.id)
      .eq('read', false);
    if (error) showToast('Could not update notifications.');
  };

  const handleMarkStudentNotificationRead = async (id: string) => {
    setStudentNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (error) showToast('Could not update notification.');
  };

  // --- Cancellation ---
  const releaseCurrentBooking = () => {
    if (!confirmedBooking) return;
    setScheduleByDate((prev) =>
      releaseMinutes(prev, confirmedBooking.date, confirmedBooking.slot.id, confirmedBooking.bookingId)
    );
  };

  const handleFacultyCancel = (reason: string) => {
    if (!facultyActionAppointment) return;
    const appt = facultyActionAppointment;

    setFacultyAppointments((prev) =>
      prev.map((a) => (a.id === appt.id ? { ...a, status: 'cancelled' } : a))
    );

    addStudentNotification({
      icon: 'close-circle-outline',
      title: 'Appointment Cancelled',
      description: `Your appointment on ${appt.date} at ${appt.time} was cancelled by the faculty. Reason: ${reason}`,
    });

    setFacultyActionResult({
      type: 'cancelled',
      studentName: appt.studentName,
      category: appt.category,
      dateLabel: appt.date,
      timeLabel: appt.time,
      location: directoryLocationLabel(appt),
      mode: directoryModeLabel(appt),
      reason,
      referenceNo: toReferenceNo(`${appt.id}-${Date.now()}`),
    });

    setFacultyActionAppointment(null);
    setScreen('facultyActionSuccess');
  };

  // --- Student-initiated cancellation ---
  const handleStudentCancel = () => {
    if (!confirmedBooking) return;

    const { dateLabel, bookedTimeRangeLabel: timeLabel, slot, bookingId } = confirmedBooking;

    releaseCurrentBooking();

    setStudentBookingResult({
      type: 'cancelled',
      doctorName: facultyProfile.name,
      department: facultyProfile.department,
      dateLabel,
      timeLabel,
      category: 'Academic Advising',
      location: slot.location,
      mode: slot.mode,
      referenceNo: toReferenceNo(bookingId),
    });

    setConfirmedBooking(null);
    setScreen('bookingCancellation');
  };

  // --- Student-initiated reschedule ---
  const handleStudentReschedule = (selection: BookingSelection) => {
    if (!confirmedBooking) return;

    const updated = releaseMinutes(
      scheduleByDate,
      confirmedBooking.date,
      confirmedBooking.slot.id,
      confirmedBooking.bookingId
    );

    const { scheduleByDate: afterBooking, startOffset } = bookMinutes(
      updated,
      selection.date,
      selection.slot.id,
      selection.durationMinutes,
      studentProfile.name
    );
    if (startOffset === null) return;

    setScheduleByDate(afterBooking);

    const bookedSlot = (afterBooking[selection.date] ?? []).find(
      (s) => s.id === selection.slot.id
    );
    const newBooking = bookedSlot?.bookings[bookedSlot.bookings.length - 1];
    const bookedTimeRangeLabel = bookedSlot
      ? getBookedTimeRangeLabel(bookedSlot, startOffset, selection.durationMinutes)
      : selection.slot.time;

    const newConfirmedBooking: BookingSelection = {
      ...selection,
      slot: bookedSlot ?? selection.slot,
      bookingId: newBooking?.bookingId ?? '',
      bookedTimeRangeLabel,
    };

    setConfirmedBooking(newConfirmedBooking);

    setStudentBookingResult({
      type: 'rescheduled',
      doctorName: facultyProfile.name,
      department: facultyProfile.department,
      dateLabel: newConfirmedBooking.dateLabel,
      timeLabel: bookedTimeRangeLabel,
      category: 'Academic Advising',
      location: newConfirmedBooking.slot.location,
      mode: newConfirmedBooking.slot.mode,
      referenceNo: toReferenceNo(newConfirmedBooking.bookingId),
    });

    setScreen('bookingReschedule');
  };

  // --- Faculty-initiated reschedule ---
  const handleFacultyReschedule = (data: {
    date: number;
    dateLabel: string;
    slot: ScheduleSlot;
    durationMinutes: number;
    reason: string;
    meetingLink?: string;
  }) => {
    if (!facultyActionAppointment) return;
    const appt = facultyActionAppointment;
    const isOnline = data.slot.mode === 'Online';

    const { scheduleByDate: afterBooking, startOffset } = bookMinutes(
      scheduleByDate,
      data.date,
      data.slot.id,
      data.durationMinutes,
      appt.studentName
    );
    if (startOffset === null) return;
    setScheduleByDate(afterBooking);

    const newSlot = (afterBooking[data.date] ?? []).find((s) => s.id === data.slot.id);
    const newBooking = newSlot?.bookings[newSlot.bookings.length - 1];
    const bookedTimeRangeLabel = newSlot
      ? getBookedTimeRangeLabel(newSlot, startOffset, data.durationMinutes)
      : data.slot.time;

    setFacultyAppointments((prev) =>
      prev.map((a) =>
        a.id === appt.id
          ? {
              ...a,
              date: data.dateLabel,
              time: bookedTimeRangeLabel,
              room: isOnline ? undefined : data.slot.location,
              mode: isOnline ? 'online' : 'face-to-face',
              meetingLink: isOnline ? data.meetingLink : undefined,
            }
          : a
      )
    );

    addStudentNotification({
      icon: 'calendar-outline',
      title: 'Appointment Rescheduled',
      description: isOnline
        ? `Your appointment with ${facultyProfile.name} was rescheduled to ${data.dateLabel} at ${bookedTimeRangeLabel}. Reason: ${data.reason}. New meeting link: ${data.meetingLink}`
        : `Your appointment with ${facultyProfile.name} was rescheduled to ${data.dateLabel} at ${bookedTimeRangeLabel}. Reason: ${data.reason}.`,
    });

    setFacultyActionResult({
      type: 'rescheduled',
      studentName: appt.studentName,
      category: appt.category,
      dateLabel: data.dateLabel,
      timeLabel: bookedTimeRangeLabel,
      location: data.slot.location,
      mode: data.slot.mode,
      reason: data.reason,
      meetingLink: isOnline ? data.meetingLink : undefined,
      referenceNo: toReferenceNo(newBooking?.bookingId ?? `${appt.id}-${Date.now()}`),
    });

    setFacultyActionAppointment(null);
    setScreen('facultyActionSuccess');
  };

  const handleAcceptReschedule = () => {
    setPendingReschedule(null);
    setScreen('home');
  };

  const handleRejectReschedule = () => {
    if (confirmedBooking) {
      setScheduleByDate((prev) =>
        releaseMinutes(prev, confirmedBooking.date, confirmedBooking.slot.id, confirmedBooking.bookingId)
      );
    }
    setPendingReschedule(null);
    setIsChoosingAfterReject(true);
    setBookingPreselect(null);
    setScreen('bookAppointment');
  };

  const isAuthScreen =
    screen === 'login' ||
    screen === 'forgotPassword' ||
    screen === 'accountType' ||
    screen === 'studentSignUp' ||
    screen === 'facultySignUp';

  if (authLoading) {
    return (
      <View style={appStyles.loadingScreen}>
        <Text style={appStyles.loadingText}>Loading…</Text>
      </View>
    );
  }

  return (
    <>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
        {screen === 'login' && (
          <LoginScreen
            onSignUp={() => {
              setAuthError(null);
              setScreen('accountType');
            }}
            onForgotPassword={() => setScreen('forgotPassword')}
            errorMessage={authError}
            submitting={authSubmitting}
            onLogin={async (role, identifier, password) => {
              if (authSubmitting) return;
              setAuthError(null);
              setAuthSubmitting(true);
              try {
                const { data, error } = await supabase.auth.signInWithPassword({
                  email: identifier,
                  password,
                });
                if (error) {
                  setAuthError(error.message);
                  showToast(error.message);
                  return;
                }
                const loadedRole = data.user ? await loadProfileForUser(data.user.id) : null;
                setScreen((loadedRole ?? role) === 'faculty' ? 'facultyHome' : 'home');
              } finally {
                setAuthSubmitting(false);
              }
            }}
          />
        )}

        {screen === 'forgotPassword' && (
          <ForgotPasswordScreen
            onBack={() => setScreen('login')}
            onBackToLogin={() => setScreen('login')}
            onSendResetLink={(email) => console.log('Password reset requested for:', email)}
          />
        )}

        {screen === 'accountType' && (
          <AccountTypeScreen
            onBack={() => setScreen('login')}
            onLogin={() => setScreen('login')}
            onSelectStudent={() => setScreen('studentSignUp')}
            onSelectFaculty={() => setScreen('facultySignUp')}
          />
        )}

        {screen === 'studentSignUp' && (
          <StudentSignUpScreen
            onBack={() => {
              setAuthError(null);
              setScreen('accountType');
            }}
            onLogin={() => {
              setAuthError(null);
              setScreen('login');
            }}
            errorMessage={authError}
            submitting={authSubmitting}
            onCreateAccount={async (data) => {
              if (authSubmitting) return;
              setAuthError(null);
              setAuthSubmitting(true);
              try {
                const { data: signUpData, error } = await supabase.auth.signUp({
                  email: data.email,
                  password: data.password,
                  options: {
                    data: {
                      role: 'student',
                      full_name: data.fullName,
                      student_id: data.studentId,
                      department: data.department,
                      year_level: data.yearLevel,
                    },
                  },
                });
                if (error) {
                  setAuthError(error.message);
                  showToast(error.message);
                  return;
                }
                if (!signUpData.session) {
                  // Email confirmation is required before they're signed in.
                  showToast('Account created — check your email to confirm before logging in.');
                  setScreen('login');
                  return;
                }
                await loadProfileForUser(signUpData.user!.id);
                setScreen('home');
              } finally {
                setAuthSubmitting(false);
              }
            }}
          />
        )}

        {screen === 'facultySignUp' && (
          <FacultySignUpScreen
            onBack={() => {
              setAuthError(null);
              setScreen('accountType');
            }}
            onLogin={() => {
              setAuthError(null);
              setScreen('login');
            }}
            errorMessage={authError}
            submitting={authSubmitting}
            onCreateAccount={async (data) => {
              if (authSubmitting) return;
              setAuthError(null);
              setAuthSubmitting(true);
              try {
                const { data: signUpData, error } = await supabase.auth.signUp({
                  email: data.email,
                  password: data.password,
                  options: {
                    data: {
                      role: 'faculty',
                      full_name: data.fullName,
                      faculty_id: data.facultyId,
                      department: data.department,
                    },
                  },
                });
                if (error) {
                  setAuthError(error.message);
                  showToast(error.message);
                  return;
                }
                if (!signUpData.session) {
                  showToast('Account created — check your email to confirm before logging in.');
                  setScreen('login');
                  return;
                }
                await loadProfileForUser(signUpData.user!.id);
                setScreen('facultyHome');
              } finally {
                setAuthSubmitting(false);
              }
            }}
          />
        )}

        {screen === 'home' && (
          <HomeScreen
            hasPendingReschedule={!!pendingReschedule}
            cancelledNotice={cancelledNotice}
            onDismissCancelledNotice={() => setCancelledNotice(null)}
            onReviewReschedule={() => setScreen('rescheduleProposal')}
            onMenuPress={() => openSideMenu('student')}
            onNotificationsPress={() => setScreen('notifications')}
            onViewAppointments={() => setScreen('appointments')}
            onViewNotifications={() => setScreen('notifications')}
            onViewQueue={() => setScreen('queue')}
            queue={queue}
            currentQueueId={currentStudentQueueId}
            now={nowTick}
            averageWaitMinutes={AVERAGE_WAIT_MINUTES_PER_STUDENT}
            showQueueCard={hasAppointmentStarted}
            onTabChange={handleTabChange}
          />
        )}

        {screen === 'directory' && (
          <DirectoryScreen
            faculty={facultyDirectory}
            loading={facultyDirectoryLoading}
            onMenuPress={() => openSideMenu('student')}
            onSelectFaculty={(faculty) => {
              setSelectedFaculty(faculty);
              setScreen('facultyProfile');
            }}
            onTabChange={handleTabChange}
          />
        )}

        {screen === 'facultyProfile' && (
          <FacultyProfileScreen
            scheduleByDate={scheduleByDate}
            facultyName={selectedFaculty?.name}
            facultyDepartment={selectedFaculty?.department}
            facultyRole={selectedFaculty?.role}
            facultyStatus={selectedFaculty?.status}
            onBack={() => setScreen('directory')}
            onMorePress={() => showToast('More options coming soon')}
            onSelectSlot={(date, slot) => {
              setBookingPreselect({ date, slotId: slot.id });
              setIsChoosingAfterReject(false);
              setScreen('bookAppointment');
            }}
            onContinue={() => {
              setBookingPreselect(null);
              setIsChoosingAfterReject(false);
              setScreen('bookAppointment');
            }}
            onJoinWalkInQueue={() => setScreen('queue')}
            onTabChange={handleTabChange}
          />
        )}

        {screen === 'bookAppointment' && (
          <BookAppointmentScreen
            scheduleByDate={scheduleByDate}
            studentName={studentProfile.name}
            mode="book"
            initialDate={bookingPreselect?.date}
            initialSlotId={bookingPreselect?.slotId}
            onBack={() => setScreen(isChoosingAfterReject ? 'home' : 'facultyProfile')}
            onContinue={async (selection) => {
              if (!session || !selectedFaculty) return;

              // Local capacity math decides WHERE in the slot this
              // booking fits (same engine as before) — only now the
              // slot itself came from a real availability_slots row.
              const { scheduleByDate: updated, startOffset } = bookMinutes(
                scheduleByDate,
                selection.date,
                selection.slot.id,
                selection.durationMinutes,
                studentProfile.name
              );
              if (startOffset === null) return;

              const bookedSlot = (updated[selection.date] ?? []).find(
                (s) => s.id === selection.slot.id
              );
              const bookedTimeRangeLabel = bookedSlot
                ? getBookedTimeRangeLabel(bookedSlot, startOffset, selection.durationMinutes)
                : selection.slot.time;

              const dayInfo = WEEK_DAYS.find((d) => d.date === selection.date);
              const realDateKey = dayInfo?.dateKey ?? toDateKey(new Date());
              const [startLabelPart, endLabelPart] = bookedTimeRangeLabel.split(' - ');

              const { data: insertedAppt, error: apptError } = await supabase
                .from('appointments')
                .insert({
                  student_id: session.user.id,
                  faculty_id: selectedFaculty.id,
                  slot_id: selection.slot.id,
                  date: realDateKey,
                  start_time: labelTo24h(startLabelPart),
                  end_time: labelTo24h(endLabelPart),
                  duration_minutes: selection.durationMinutes,
                  category: 'Consultation',
                  purpose: selection.purpose,
                  mode: selection.slot.mode,
                  location: selection.slot.location,
                })
                .select()
                .single();

              if (apptError || !insertedAppt) {
                showToast(apptError?.message ?? 'Could not book appointment.');
                return;
              }

              const { error: bookingRowError } = await supabase.from('slot_bookings').insert({
                slot_id: selection.slot.id,
                appointment_id: insertedAppt.id,
                start_minute: startOffset,
                duration_minutes: selection.durationMinutes,
              });
              if (bookingRowError) {
                showToast('Booked, but capacity tracking failed to save.');
              }

              setScheduleByDate(updated);
              setConfirmedBooking({
                ...selection,
                slot: bookedSlot ?? selection.slot,
                bookingId: insertedAppt.id,
                bookedTimeRangeLabel,
              });
              setIsChoosingAfterReject(false);
              setScreen('bookingConfirmation');
            }}
          />
        )}

        {screen === 'rescheduleAppointment' && (
          <BookAppointmentScreen
            scheduleByDate={scheduleByDate}
            studentName={studentProfile.name}
            mode="reschedule"
            onBack={() => setScreen('appointmentDetails')}
            onContinue={handleStudentReschedule}
          />
        )}

        {screen === 'bookingConfirmation' && (
          <BookingConfirmationScreen
            onBack={() => setScreen('bookAppointment')}
            onMorePress={() => showToast('More options coming soon')}
            onBookAnother={() => {
              setBookingPreselect(null);
              setScreen('bookAppointment');
            }}
            onBackToHome={() => setScreen('home')}
            date={confirmedBooking?.dateLabel}
            bookedTimeRangeLabel={confirmedBooking?.bookedTimeRangeLabel}
            duration={confirmedBooking?.duration}
            purpose={confirmedBooking?.purpose}
            location={confirmedBooking?.slot.location}
            mode={confirmedBooking?.slot.mode}
          />
        )}

        {screen === 'bookingCancellation' && studentBookingResult && (
          <BookingCancellationScreen
            onBack={() => setScreen('appointmentDetails')}
            onBackToHome={() => setScreen('home')}
            doctorName={studentBookingResult.doctorName}
            department={studentBookingResult.department}
            date={studentBookingResult.dateLabel}
            time={studentBookingResult.timeLabel}
            category={studentBookingResult.category}
            location={studentBookingResult.location}
            mode={studentBookingResult.mode}
            referenceNo={studentBookingResult.referenceNo}
          />
        )}

        {screen === 'bookingReschedule' && studentBookingResult && (
          <BookingRescheduleScreen
            onBack={() => setScreen('appointmentDetails')}
            onBackToHome={() => setScreen('home')}
            doctorName={studentBookingResult.doctorName}
            department={studentBookingResult.department}
            date={studentBookingResult.dateLabel}
            time={studentBookingResult.timeLabel}
            category={studentBookingResult.category}
            location={studentBookingResult.location}
            mode={studentBookingResult.mode}
            referenceNo={studentBookingResult.referenceNo}
          />
        )}

        {screen === 'appointmentDetails' && (
          <AppointmentDetailsScreen
            onBack={() => setScreen('appointments')}
            onMorePress={() => showToast('More options coming soon')}
            onReschedule={() => setScreen('rescheduleAppointment')}
            onCancelAppointment={handleStudentCancel}
          />
        )}

        {screen === 'appointments' && (
          <AppointmentsScreen
            onMenuPress={() => openSideMenu('student')}
            onSelectAppointment={(appointment) => {
              console.log('Selected appointment:', appointment);
              setScreen('appointmentDetails');
            }}
            onTabChange={handleTabChange}
          />
        )}

        {screen === 'notifications' && (
          <NotificationsScreen
            notifications={studentNotifications}
            onDeleteNotifications={handleDeleteStudentNotifications}
            onMenuPress={() => openSideMenu('student')}
            onMarkAllRead={handleMarkAllStudentNotificationsRead}
            onMarkAsRead={handleMarkStudentNotificationRead}
            onSelectNotification={(item) => console.log('Selected notification:', item)}
            onTabChange={handleTabChange}
          />
        )}

        {screen === 'profile' && (
          <ProfileScreen
            {...studentProfile}
            onBack={() => setScreen('home')}
            onPersonalInformation={() => goToPersonalInformation('profile')}
            onAbout={() => goToAbout('profile')}
            onLogout={() => setScreen('login')}
            onTabChange={handleTabChange}
          />
        )}

        {screen === 'facultyHome' && (
          <FacultyHomeScreen
            walkInQueueCount={queue.length}
            onMenuPress={() => openSideMenu('faculty')}
            onNotificationsPress={() => setScreen('facultyNotifications')}
            onViewSchedule={() => setScreen('facultyDirectory')}
            onOpenAppointments={() => setScreen('facultyDirectory')}
            onOpenPendingReschedules={() => setScreen('facultyDirectory')}
            onOpenAvailability={() => setScreen('facultyAvailability')}
            onOpenWalkInQueue={() => setScreen('queue')}
            onOpenSlotIQAI={() => console.log('Open SlotIQ AI')}
            onTabChange={handleFacultyTabChange}
          />
        )}

        {screen === 'facultyDirectory' && (
          <FacultyDirectoryScreen
            appointments={facultyAppointments}
            onSelectAppointment={(appointment) => {
              setSelectedStudent(appointment);
              setScreen('studentProfile');
            }}
            onReschedulePress={(appointment) => {
              setFacultyActionAppointment(appointment);
              setScreen('facultyRescheduleAppointment');
            }}
            onCancelPress={(appointment) => {
              setFacultyActionAppointment(appointment);
              setScreen('facultyCancelAppointment');
            }}
            onTabChange={handleFacultyTabChange}
          />
        )}

        {screen === 'studentProfile' && selectedStudent && (
          <StudentProfileScreen
            studentName={selectedStudent.studentName}
            studentId={selectedStudent.studentId}
            email={selectedStudent.email}
            department={selectedStudent.department}
            yearLevel={selectedStudent.yearLevel}
            photoUri={selectedStudent.photoUri}
            appointmentCategory={selectedStudent.category}
            appointmentDate={selectedStudent.date}
            appointmentTime={selectedStudent.time}
            appointmentMode={selectedStudent.mode}
            appointmentRoom={selectedStudent.room}
            onBack={() => setScreen('facultyDirectory')}
            onMessagePress={() => showToast('Messaging is not available yet')}
            onTabChange={handleFacultyTabChange}
          />
        )}

        {screen === 'facultyAvailability' && (
          <FacultyAvailabilityScreen
            slotsByDate={facultySlotsByDate}
            recurringRules={recurringRules}
            onBack={() => setScreen('facultyHome')}
            onInfoPress={() => showToast('Availability info coming soon')}
            onAddTimeSlot={handleAddTimeSlot}
            onToggleSlot={handleToggleFacultySlot}
            onDeleteTimeSlot={handleDeleteFacultySlot}
            onSetRecurringSchedule={() => setScreen('recurringSchedule')}
            onDeleteRecurringRule={handleDeleteRecurringRule}
            onSaveAvailability={() => {
              console.log('Save availability:', facultySlotsByDate);
              setScreen('facultyHome');
            }}
            onTabChange={handleFacultyTabChange}
          />
        )}

        {screen === 'addTimeSlot' && (
          <AddTimeSlotScreen
            onBack={() => setScreen('facultyAvailability')}
            onConfirm={handleConfirmNewFacultySlot}
            onTabChange={handleFacultyTabChange}
          />
        )}

        {screen === 'recurringSchedule' && (
          <RecurringScheduleScreen
            onBack={() => setScreen('facultyAvailability')}
            onConfirm={handleCreateRecurringRule}
          />
        )}

        {screen === 'facultyNotifications' && (
          <FacultyNotificationsScreen
            onBack={() => setScreen('facultyHome')}
            onMarkAllRead={() => console.log('Mark all as read')}
            onSelectNotification={(item) => console.log('Selected notification:', item)}
            onTabChange={handleFacultyTabChange}
          />
        )}

        {screen === 'facultyProfileMenu' && (
          <FacultyProfileMenuScreen
            {...facultyProfile}
            onBack={() => setScreen('facultyHome')}
            onPersonalInformation={() => goToFacultyPersonalInformation('facultyProfileMenu')}
            onMySchedule={() => setScreen('facultySchedule')}
            onAbout={() => goToAbout('facultyProfileMenu')}
            onLogout={() => setScreen('login')}
            onTabChange={handleFacultyTabChange}
          />
        )}

        {screen === 'facultySchedule' && (
          <FacultyScheduleCalendarScreen
            slotsByDate={facultySlotsByDate}
            onBack={() => setScreen('facultyProfileMenu')}
            onTabChange={handleFacultyTabChange}
          />
        )}

        {screen === 'personalInformation' && (
          <PersonalInformationScreen
            {...studentProfile}
            onBack={() => setScreen(previousScreen)}
            onSave={(data, passwordChange) => {
              setStudentProfile((prev) => ({ ...prev, ...data }));
              if (passwordChange) {
                // TODO: call your real change-password API here.
                console.log('Change password:', passwordChange);
              }
              setScreen(previousScreen);
            }}
          />
        )}

        {screen === 'facultyPersonalInformation' && (
          <FacultyPersonalInformationScreen
            {...facultyProfile}
            onBack={() => setScreen(previousScreen)}
            onSave={(data, passwordChange) => {
              setFacultyProfile((prev) => ({ ...prev, ...data }));
              if (passwordChange) {
                // TODO: call your real change-password API here.
                console.log('Change password:', passwordChange);
              }
              setScreen(previousScreen);
            }}
          />
        )}

        {screen === 'about' && <AboutScreen onBack={() => setScreen(previousScreen)} />}

        {screen === 'settings' && (
          <SettingsScreen
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled((prev) => !prev)}
            onBack={() => setScreen(previousScreen)}
          />
        )}

        {screen === 'queue' && (
          <QueueScreen
            queue={queue}
            currentQueueId={currentStudentQueueId}
            hasAppointment={!!confirmedBooking}
            role={userRole}
            doctorName={facultyProfile.name}
            doctorDepartment={facultyProfile.department}
            now={nowTick}
            onBack={() => setScreen(userRole === 'faculty' ? 'facultyHome' : 'home')}
            onReschedule={() => setScreen('rescheduleAppointment')}
            onCancelAppointment={handleStudentCancel}
            onCompleteCurrent={handleCompleteCurrentQueue}
            onTabChange={handleTabChange}
            onFacultyTabChange={handleFacultyTabChange}
          />
        )}

        {screen === 'facultyRescheduleAppointment' && facultyActionAppointment && (
          <FacultyRescheduleAppointmentScreen
            scheduleByDate={scheduleByDate}
            studentName={facultyActionAppointment.studentName}
            category={facultyActionAppointment.category}
            originalDateLabel={facultyActionAppointment.date}
            originalTime={facultyActionAppointment.time}
            originalLocation={directoryLocationLabel(facultyActionAppointment)}
            originalMode={directoryModeLabel(facultyActionAppointment)}
            durationMinutes={30}
            onBack={() => {
              setFacultyActionAppointment(null);
              setScreen('facultyDirectory');
            }}
            onConfirm={handleFacultyReschedule}
          />
        )}

        {screen === 'rescheduleProposal' && pendingReschedule && (
          <RescheduleProposalScreen
            reason={pendingReschedule.reason}
            originalDateLabel={pendingReschedule.originalDateLabel}
            originalTime={pendingReschedule.originalTime}
            originalLocation={pendingReschedule.originalLocation}
            proposedDateLabel={pendingReschedule.proposedDateLabel}
            proposedTime={pendingReschedule.proposedTime}
            proposedLocation={pendingReschedule.proposedLocation}
            proposedMode={pendingReschedule.proposedMode}
            onBack={() => setScreen('home')}
            onAccept={handleAcceptReschedule}
            onChooseAnother={handleRejectReschedule}
          />
        )}

        {screen === 'facultyCancelAppointment' && facultyActionAppointment && (
          <FacultyCancelAppointmentScreen
            studentName={facultyActionAppointment.studentName}
            dateLabel={facultyActionAppointment.date}
            bookedTimeRangeLabel={facultyActionAppointment.time}
            location={directoryLocationLabel(facultyActionAppointment)}
            mode={directoryModeLabel(facultyActionAppointment)}
            onBack={() => {
              setFacultyActionAppointment(null);
              setScreen('facultyDirectory');
            }}
            onConfirmCancel={handleFacultyCancel}
          />
        )}

        {screen === 'facultyActionSuccess' && facultyActionResult && (
          <FacultyActionSuccessScreen
            type={facultyActionResult.type}
            studentName={facultyActionResult.studentName}
            category={facultyActionResult.category}
            dateLabel={facultyActionResult.dateLabel}
            timeLabel={facultyActionResult.timeLabel}
            location={facultyActionResult.location}
            mode={facultyActionResult.mode}
            reason={facultyActionResult.reason}
            meetingLink={facultyActionResult.meetingLink}
            referenceNo={facultyActionResult.referenceNo}
            onBackToDirectory={() => {
              setFacultyActionResult(null);
              setScreen('facultyDirectory');
            }}
          />
        )}
      </Animated.View>

      <SideMenu
        visible={sideMenuOpen}
        role={userRole}
        userName={userRole === 'faculty' ? facultyProfile.name : studentProfile.name}
        activeKey={sideMenuActiveKey}
        // Real unread count for the student; faculty notifications are
        // still owned locally by FacultyNotificationsScreen, so this stays
        // a static fallback for that role.
        notificationCount={
          userRole === 'student'
            ? studentNotifications.filter((n) => !n.read).length
            : 3
        }
        onClose={() => setSideMenuOpen(false)}
        onNavigate={handleSideMenuNavigate}
        onLogout={handleSideMenuLogout}
      />

      <StatusBar style={isAuthScreen ? 'light' : 'dark'} />

      {toastMessage && (
        <View style={appStyles.toastWrap} pointerEvents="none">
          <View style={appStyles.toastPill}>
            <Text style={appStyles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}
    </>
  );
}

const appStyles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  toastWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 100,
    alignItems: 'center',
  },
  toastPill: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: '85%',
  },
  toastText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}