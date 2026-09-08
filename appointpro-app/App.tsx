import React, { useState, useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './screens/LoginScreen';
import AccountTypeScreen from './screens/AccountTypeScreen';
import StudentSignUpScreen from './screens/StudentSignUpScreen';
import FacultySignUpScreen from './screens/FacultySignUpScreen';
import HomeScreen from './screens/HomeScreen';
import DirectoryScreen from './screens/DirectoryScreen';
import FacultyProfileScreen from './screens/FacultyProfileScreen';
import BookAppointmentScreen, { BookingSelection } from './screens/BookAppointmentScreen';
import BookingConfirmationScreen from './screens/BookingConfirmationScreen';
import BookingCancellationScreen from './screens/BookingCancellationScreen';
import AppointmentDetailsScreen from './screens/AppointmentDetailsScreen';
import AppointmentsScreen from './screens/AppointmentsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import ProfileScreen from './screens/ProfileScreen';
import FacultyHomeScreen from './screens/FacultyHomeScreen';
import FacultyDirectoryScreen, { StudentAppointment } from './screens/FacultyDirectoryScreen';
import StudentProfileScreen from './screens/StudentProfileScreen';
import FacultyAvailabilityScreen from './screens/FacultyAvailabilityScreen';
import AddTimeSlotScreen, { NewFacultySlotInput } from './screens/AddTimeSlotScreen';
import FacultyNotificationsScreen from './screens/FacultyNotificationsScreen';
import FacultyProfileMenuScreen from './screens/FacultyProfileMenuScreen';
import PersonalInformationScreen, {
  PersonalInformation,
} from './screens/PersonalInformationScreen';
import FacultyPersonalInformationScreen, {
  FacultyPersonalInformation,
} from './screens/FacultyPersonalInformationScreen';
import AboutScreen from './screens/AboutScreen';
import WalkInQueueScreen from './screens/WalkInQueueScreen';
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
import { RecurringRule, generateSlotsFromRule } from './data/recurringSchedule';
import { QueueEntry, INITIAL_QUEUE } from './data/queue';
import {
  NotificationItem,
  INITIAL_STUDENT_NOTIFICATIONS,
  createNotification,
} from './data/notifications';

type Screen =
  | 'login'
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
  | 'personalInformation'
  | 'facultyPersonalInformation'
  | 'about'
  | 'walkInQueue'
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

const CURRENT_STUDENT_NAME = 'Chloey Lyca Jurcales';

// Turns a bookingId (e.g. "slot-3-1725720000000") into a stable, readable
// reference number like "APP-2026-720000" for the confirmation screens.
function toReferenceNo(bookingId: string): string {
  const digits = bookingId.replace(/\D/g, '').slice(-6).padStart(6, '0');
  return `APP-2026-${digits}`;
}

function AppContent() {
  const [screen, setScreen] = useState<Screen>('login');
  const [previousScreen, setPreviousScreen] = useState<Screen>('profile');
  const [userRole, setUserRole] = useState<SideMenuRole>('student');
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  const [studentProfile, setStudentProfile] = useState<StudentProfileData>({
    name: 'Chloey Lyca Jurcales',
    role: 'BSIT Student',
    studentId: '2023-00123',
    email: 'chloeyju@gmail.com',
    department: 'College of Computer Studies',
    yearLevel: '3rd Year',
  });

  const [facultyProfile, setFacultyProfile] = useState<FacultyProfileData>({
    name: 'Dr. Juan DelaCruz',
    department: 'Computer Studies',
    employeeId: '2023-00123',
    email: 'juandelacruz@gmail.com',
    fullDepartment: 'Computer Studies Socsiety',
    consultationTypes: 'Face-to-Face   Online',
  });

  const [scheduleByDate, setScheduleByDate] =
    useState<Record<number, ScheduleSlot[]>>(INITIAL_SCHEDULE_BY_DATE);

  const [facultySlotsByDate, setFacultySlotsByDate] =
    useState<Record<string, FacultySlot[]>>(INITIAL_FACULTY_SLOTS_BY_DATE);
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([]);
  const [addSlotForDate, setAddSlotForDate] = useState<string>(toDateKey(new Date()));

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

  const [studentNotifications, setStudentNotifications] = useState<NotificationItem[]>(
    INITIAL_STUDENT_NOTIFICATIONS
  );

  const [queue, setQueue] = useState<QueueEntry[]>(INITIAL_QUEUE);
  const [currentStudentQueueId, setCurrentStudentQueueId] = useState<string | null>(null);

  const [selectedStudent, setSelectedStudent] = useState<StudentAppointment | null>(null);

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
      // TODO: point this at a real Settings screen once one exists.
      console.log('Settings pressed — no Settings screen wired up yet.');
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
    ] as SideMenuKey[]
  ).includes(screen as SideMenuKey)
    ? (screen as SideMenuKey)
    : undefined;

  const handleSideMenuLogout = () => {
    setSideMenuOpen(false);
    setScreen('login');
  };

  // --- Faculty availability editing handlers (one-off slots) ---
  const handleToggleFacultySlot = (dateKey: string, slotId: string) => {
    setFacultySlotsByDate((prev) => ({
      ...prev,
      [dateKey]: (prev[dateKey] ?? []).map((s) =>
        s.id === slotId ? { ...s, enabled: !s.enabled } : s
      ),
    }));
  };

  const handleDeleteFacultySlot = (dateKey: string, slotId: string) => {
    setFacultySlotsByDate((prev) => ({
      ...prev,
      [dateKey]: (prev[dateKey] ?? []).filter((s) => s.id !== slotId),
    }));
  };

  const handleAddTimeSlot = (dateKey: string) => {
    setAddSlotForDate(dateKey);
    setScreen('addTimeSlot');
  };

  const handleConfirmNewFacultySlot = (data: NewFacultySlotInput) => {
    const label = `${data.startHour}:${data.startMinute} ${data.startPeriod} - ${data.endHour}:${data.endMinute} ${data.endPeriod}`;
    const newSlot: FacultySlot = {
      id: `slot-${addSlotForDate}-${Date.now()}`,
      label,
      mode: data.mode,
      location: data.location,
      enabled: true,
      recurring: data.recurring,
    };
    setFacultySlotsByDate((prev) => ({
      ...prev,
      [addSlotForDate]: [...(prev[addSlotForDate] ?? []), newSlot],
    }));
    setScreen('facultyAvailability');
  };

  // --- Recurring weekly schedule handlers ---
  const handleCreateRecurringRule = (rule: RecurringRule) => {
    const generated = generateSlotsFromRule(rule);
    setFacultySlotsByDate((prev) => {
      const merged = { ...prev };
      Object.entries(generated).forEach(([dateKey, slots]) => {
        merged[dateKey] = [...(merged[dateKey] ?? []), ...slots];
      });
      return merged;
    });
    setRecurringRules((prev) => [...prev, rule]);
    setScreen('facultyAvailability');
  };

  const handleDeleteRecurringRule = (ruleId: string) => {
    setRecurringRules((prev) => prev.filter((r) => r.id !== ruleId));
    setFacultySlotsByDate((prev) => {
      const updated: Record<string, FacultySlot[]> = {};
      Object.entries(prev).forEach(([dateKey, slots]) => {
        updated[dateKey] = slots.filter((s) => s.ruleId !== ruleId);
      });
      return updated;
    });
  };

  // --- Walk-in queue handlers ---
  const handleJoinQueue = () => {
    const newEntry: QueueEntry = { id: `q-${Date.now()}`, studentName: 'You' };
    setQueue((prev) => [...prev, newEntry]);
    setCurrentStudentQueueId(newEntry.id);
  };

  const handleLeaveQueue = () => {
    setQueue((prev) => prev.filter((q) => q.id !== currentStudentQueueId));
    setCurrentStudentQueueId(null);
  };

  // --- Notifications ---
  // Pushes a new notification onto the student's notification feed. Used
  // to notify the student whenever a faculty member cancels or proposes a
  // reschedule for their appointment.
  const addStudentNotification = (
    input: Pick<NotificationItem, 'icon' | 'title' | 'description'>
  ) => {
    setStudentNotifications((prev) => [createNotification(input), ...prev]);
  };

  const handleDeleteStudentNotifications = (ids: string[]) => {
    setStudentNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));
  };

  // --- Cancellation ---
  const releaseCurrentBooking = () => {
    if (!confirmedBooking) return;
    setScheduleByDate((prev) =>
      releaseMinutes(prev, confirmedBooking.date, confirmedBooking.slot.id, confirmedBooking.bookingId)
    );
  };

  const handleFacultyCancel = (reason: string) => {
    if (!confirmedBooking) return;

    const { dateLabel, bookedTimeRangeLabel: timeLabel, slot, bookingId } = confirmedBooking;

    releaseCurrentBooking();
    setCancelledNotice(`Your appointment was cancelled by the faculty. Reason: ${reason}`);

    addStudentNotification({
      icon: 'close-circle-outline',
      title: 'Appointment Cancelled',
      description: `Your appointment on ${dateLabel} at ${timeLabel} was cancelled by the faculty. Reason: ${reason}`,
    });

    setFacultyActionResult({
      type: 'cancelled',
      studentName: CURRENT_STUDENT_NAME,
      category: 'Academic Advising',
      dateLabel,
      timeLabel,
      location: slot.location,
      mode: slot.mode,
      reason,
      referenceNo: toReferenceNo(bookingId),
    });

    setConfirmedBooking(null);
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
      CURRENT_STUDENT_NAME
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
  }) => {
    if (!confirmedBooking) return;

    let updated = releaseMinutes(
      scheduleByDate,
      confirmedBooking.date,
      confirmedBooking.slot.id,
      confirmedBooking.bookingId
    );

    const { scheduleByDate: afterBooking, startOffset } = bookMinutes(
      updated,
      data.date,
      data.slot.id,
      data.durationMinutes,
      CURRENT_STUDENT_NAME
    );
    setScheduleByDate(afterBooking);

    if (startOffset === null) return;

    const newSlot = (afterBooking[data.date] ?? []).find((s) => s.id === data.slot.id);
    const newBooking = newSlot?.bookings[newSlot.bookings.length - 1];
    const bookedTimeRangeLabel = newSlot
      ? getBookedTimeRangeLabel(newSlot, startOffset, data.durationMinutes)
      : data.slot.time;

    setPendingReschedule({
      reason: data.reason,
      originalDateLabel: confirmedBooking.dateLabel,
      originalTime: confirmedBooking.bookedTimeRangeLabel,
      originalLocation: confirmedBooking.slot.location,
      originalMode: confirmedBooking.slot.mode,
      proposedDateLabel: data.dateLabel,
      proposedTime: bookedTimeRangeLabel,
      proposedLocation: data.slot.location,
      proposedMode: data.slot.mode,
    });

    setConfirmedBooking({
      date: data.date,
      dateLabel: data.dateLabel,
      slot: newSlot ?? data.slot,
      duration: confirmedBooking.duration,
      durationMinutes: data.durationMinutes,
      purpose: confirmedBooking.purpose,
      bookingId: newBooking?.bookingId ?? '',
      bookedTimeRangeLabel,
    });

    addStudentNotification({
      icon: 'calendar-outline',
      title: 'Appointment Rescheduled',
      description: `Your faculty proposed a new schedule: ${data.dateLabel} at ${bookedTimeRangeLabel}. Reason: ${data.reason}. Please review and confirm.`,
    });

    setFacultyActionResult({
      type: 'rescheduled',
      studentName: CURRENT_STUDENT_NAME,
      category: 'Academic Advising',
      dateLabel: data.dateLabel,
      timeLabel: bookedTimeRangeLabel,
      location: data.slot.location,
      mode: data.slot.mode,
      reason: data.reason,
      referenceNo: toReferenceNo(newBooking?.bookingId ?? ''),
    });

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
    screen === 'accountType' ||
    screen === 'studentSignUp' ||
    screen === 'facultySignUp';

  return (
    <>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
        {screen === 'login' && (
          <LoginScreen
            onSignUp={() => setScreen('accountType')}
            onForgotPassword={() => {}}
            onLogin={(role, identifier, password) => {
              console.log('Login attempt:', role, identifier, password);
              setUserRole(role === 'faculty' ? 'faculty' : 'student');
              setScreen(role === 'faculty' ? 'facultyHome' : 'home');
            }}
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
            onBack={() => setScreen('accountType')}
            onLogin={() => setScreen('login')}
            onCreateAccount={(data) => {
              console.log('Create student account:', data);
              setUserRole('student');
              setScreen('home');
            }}
          />
        )}

        {screen === 'facultySignUp' && (
          <FacultySignUpScreen
            onBack={() => setScreen('accountType')}
            onLogin={() => setScreen('login')}
            onCreateAccount={(data) => {
              console.log('Create faculty account:', data);
              setUserRole('faculty');
              setScreen('facultyHome');
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
            onViewQueue={() => setScreen('walkInQueue')}
            onBookAppointment={() => {
              setBookingPreselect(null);
              setIsChoosingAfterReject(false);
              setScreen('bookAppointment');
            }}
            onTabChange={handleTabChange}
          />
        )}

        {screen === 'directory' && (
          <DirectoryScreen
            onMenuPress={() => openSideMenu('student')}
            onFilterPress={() => console.log('Open filters')}
            onSelectFaculty={(faculty) => {
              console.log('Selected faculty:', faculty);
              setScreen('facultyProfile');
            }}
            onTabChange={handleTabChange}
          />
        )}

        {screen === 'facultyProfile' && (
          <FacultyProfileScreen
            scheduleByDate={scheduleByDate}
            onBack={() => setScreen('directory')}
            onMorePress={() => console.log('Open faculty options')}
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
            onJoinWalkInQueue={() => setScreen('walkInQueue')}
            onTabChange={handleTabChange}
          />
        )}

        {screen === 'bookAppointment' && (
          <BookAppointmentScreen
            scheduleByDate={scheduleByDate}
            studentName={CURRENT_STUDENT_NAME}
            mode="book"
            initialDate={bookingPreselect?.date}
            initialSlotId={bookingPreselect?.slotId}
            onBack={() => setScreen(isChoosingAfterReject ? 'home' : 'facultyProfile')}
            onContinue={(selection) => {
              const { scheduleByDate: updated, startOffset } = bookMinutes(
                scheduleByDate,
                selection.date,
                selection.slot.id,
                selection.durationMinutes,
                CURRENT_STUDENT_NAME
              );
              if (startOffset === null) return;

              setScheduleByDate(updated);

              const bookedSlot = (updated[selection.date] ?? []).find(
                (s) => s.id === selection.slot.id
              );
              const newBooking = bookedSlot?.bookings[bookedSlot.bookings.length - 1];
              const bookedTimeRangeLabel = bookedSlot
                ? getBookedTimeRangeLabel(bookedSlot, startOffset, selection.durationMinutes)
                : selection.slot.time;

              setConfirmedBooking({
                ...selection,
                slot: bookedSlot ?? selection.slot,
                bookingId: newBooking?.bookingId ?? '',
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
            studentName={CURRENT_STUDENT_NAME}
            mode="reschedule"
            onBack={() => setScreen('appointmentDetails')}
            onContinue={handleStudentReschedule}
          />
        )}

        {screen === 'bookingConfirmation' && (
          <BookingConfirmationScreen
            onBack={() => setScreen('bookAppointment')}
            onMorePress={() => console.log('Open confirmation options')}
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
            onMorePress={() => console.log('Open appointment options')}
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
            onMarkAllRead={() => console.log('Mark all as read')}
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
            onMenuPress={() => openSideMenu('faculty')}
            onNotificationsPress={() => setScreen('facultyNotifications')}
            onViewSchedule={() => console.log('View full schedule')}
            onOpenAppointments={() => setScreen('facultyAvailability')}
            onOpenAvailability={() => setScreen('facultyAvailability')}
            onOpenWalkInQueue={() => setScreen('walkInQueue')}
            onOpenSlotIQAI={() => console.log('Open SlotIQ AI')}
            onTabChange={handleFacultyTabChange}
          />
        )}

        {screen === 'facultyDirectory' && (
          <FacultyDirectoryScreen
            onSelectAppointment={(appointment) => {
              setSelectedStudent(appointment);
              setScreen('studentProfile');
            }}
            onReschedulePress={() => setScreen('facultyRescheduleAppointment')}
            onCancelPress={() => setScreen('facultyCancelAppointment')}
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
            onMessagePress={() => console.log('Message student:', selectedStudent.studentName)}
            onTabChange={handleFacultyTabChange}
          />
        )}

        {screen === 'facultyAvailability' && (
          <FacultyAvailabilityScreen
            slotsByDate={facultySlotsByDate}
            recurringRules={recurringRules}
            onBack={() => setScreen('facultyHome')}
            onInfoPress={() => console.log('Open availability info')}
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
            onAbout={() => goToAbout('facultyProfileMenu')}
            onLogout={() => setScreen('login')}
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

        {screen === 'walkInQueue' && (
          <WalkInQueueScreen
            queue={queue}
            currentQueueId={currentStudentQueueId}
            onBack={() => setScreen('home')}
            onJoin={handleJoinQueue}
            onLeave={handleLeaveQueue}
            onTabChange={handleTabChange}
          />
        )}

        {screen === 'facultyRescheduleAppointment' && (
          <FacultyRescheduleAppointmentScreen
            scheduleByDate={scheduleByDate}
            studentName={CURRENT_STUDENT_NAME}
            purpose={confirmedBooking?.purpose}
            originalDateLabel={confirmedBooking?.dateLabel}
            originalTime={confirmedBooking?.bookedTimeRangeLabel}
            originalLocation={confirmedBooking?.slot.location}
            originalMode={confirmedBooking?.slot.mode}
            durationMinutes={confirmedBooking?.durationMinutes ?? 30}
            onBack={() => setScreen('facultyDirectory')}
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

        {screen === 'facultyCancelAppointment' && (
          <FacultyCancelAppointmentScreen
            studentName={CURRENT_STUDENT_NAME}
            dateLabel={confirmedBooking?.dateLabel}
            bookedTimeRangeLabel={confirmedBooking?.bookedTimeRangeLabel}
            location={confirmedBooking?.slot.location}
            mode={confirmedBooking?.slot.mode}
            onBack={() => setScreen('facultyDirectory')}
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
        userName={userRole === 'faculty' ? 'Dr. Juan Dela Cruz' : CURRENT_STUDENT_NAME}
        activeKey={sideMenuActiveKey}
        // TODO: replace with a real unread-notifications count once that
        // state is lifted up from NotificationsScreen/FacultyNotificationsScreen.
        notificationCount={3}
        onClose={() => setSideMenuOpen(false)}
        onNavigate={handleSideMenuNavigate}
        onLogout={handleSideMenuLogout}
      />

      <StatusBar style={isAuthScreen ? 'light' : 'dark'} />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}