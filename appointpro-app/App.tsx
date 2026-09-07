import React, { useState, useRef, useEffect } from 'react';
import { Animated } from 'react-native';
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
import FacultyDirectoryScreen from './screens/FacultyDirectoryScreen';
import FacultyAvailabilityScreen from './screens/FacultyAvailabilityScreen';
import AddTimeSlotScreen, { NewFacultySlotInput } from './screens/AddTimeSlotScreen';
import FacultyNotificationsScreen from './screens/FacultyNotificationsScreen';
import FacultyProfileMenuScreen from './screens/FacultyProfileMenuScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import AboutScreen from './screens/AboutScreen';
import WalkInQueueScreen from './screens/WalkInQueueScreen';
import FacultyRescheduleAppointmentScreen from './screens/FacultyRescheduleAppointmentScreen';
import RescheduleProposalScreen from './screens/RescheduleProposalScreen';
import FacultyCancelAppointmentScreen from './screens/FacultyCancelAppointmentScreen';
import RecurringScheduleScreen from './screens/RecurringScheduleScreen';
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
  | 'appointmentDetails'
  | 'appointments'
  | 'notifications'
  | 'profile'
  | 'facultyHome'
  | 'facultyDirectory'
  | 'facultyAvailability'
  | 'addTimeSlot'
  | 'facultyNotifications'
  | 'facultyProfileMenu'
  | 'changePassword'
  | 'about'
  | 'walkInQueue'
  | 'facultyRescheduleAppointment'
  | 'rescheduleProposal'
  | 'facultyCancelAppointment'
  | 'recurringSchedule';

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

const CURRENT_STUDENT_NAME = 'Chloey Lyca Jurcales';

function AppContent() {
  const [screen, setScreen] = useState<Screen>('login');
  const [previousScreen, setPreviousScreen] = useState<Screen>('profile');

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

  const [queue, setQueue] = useState<QueueEntry[]>(INITIAL_QUEUE);
  const [currentStudentQueueId, setCurrentStudentQueueId] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(16);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
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

  const goToChangePassword = (from: Screen) => {
    setPreviousScreen(from);
    setScreen('changePassword');
  };

  const goToAbout = (from: Screen) => {
    setPreviousScreen(from);
    setScreen('about');
  };

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

  const handleJoinQueue = () => {
    const newEntry: QueueEntry = { id: `q-${Date.now()}`, studentName: 'You' };
    setQueue((prev) => [...prev, newEntry]);
    setCurrentStudentQueueId(newEntry.id);
  };

  const handleLeaveQueue = () => {
    setQueue((prev) => prev.filter((q) => q.id !== currentStudentQueueId));
    setCurrentStudentQueueId(null);
  };

  const releaseCurrentBooking = () => {
    if (!confirmedBooking) return;
    setScheduleByDate((prev) =>
      releaseMinutes(prev, confirmedBooking.date, confirmedBooking.slot.id, confirmedBooking.bookingId)
    );
  };

  const handleFacultyCancel = (reason: string) => {
    releaseCurrentBooking();
    setCancelledNotice(`Your appointment was cancelled by the faculty. Reason: ${reason}`);
    setConfirmedBooking(null);
    setScreen('facultyDirectory');
  };

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

    setScreen('facultyDirectory');
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
            onMenuPress={() => console.log('Open menu')}
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
            onMenuPress={() => console.log('Open menu')}
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
            onContinue={(selection) => {
              console.log('Reschedule selection:', selection);
              setScreen('appointments');
            }}
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

        {screen === 'bookingCancellation' && (
          <BookingCancellationScreen
            onBack={() => setScreen('appointmentDetails')}
            onBackToHome={() => setScreen('home')}
          />
        )}

        {screen === 'appointmentDetails' && (
          <AppointmentDetailsScreen
            onBack={() => setScreen('appointments')}
            onMorePress={() => console.log('Open appointment options')}
            onReschedule={() => setScreen('rescheduleAppointment')}
            onCancelAppointment={() => {
              releaseCurrentBooking();
              setConfirmedBooking(null);
              setScreen('bookingCancellation');
            }}
          />
        )}

        {screen === 'appointments' && (
          <AppointmentsScreen
            onMenuPress={() => console.log('Open menu')}
            onSelectAppointment={(appointment) => {
              console.log('Selected appointment:', appointment);
              setScreen('appointmentDetails');
            }}
            onTabChange={handleTabChange}
          />
        )}

        {screen === 'notifications' && (
          <NotificationsScreen
            onMenuPress={() => console.log('Open menu')}
            onMorePress={() => console.log('Open notification options')}
            onMarkAllRead={() => console.log('Mark all as read')}
            onTabChange={handleTabChange}
          />
        )}

        {screen === 'profile' && (
          <ProfileScreen
            onBack={() => setScreen('home')}
            onPersonalInformation={() => console.log('Open personal information')}
            onChangePassword={() => goToChangePassword('profile')}
            onAbout={() => goToAbout('profile')}
            onLogout={() => setScreen('login')}
            onTabChange={handleTabChange}
          />
        )}

        {screen === 'facultyHome' && (
          <FacultyHomeScreen
            onMenuPress={() => console.log('Open menu')}
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
            onSelectAppointment={(appointment) =>
              console.log('Selected student appointment:', appointment)
            }
            onReschedulePress={() => setScreen('facultyRescheduleAppointment')}
            onCancelPress={() => setScreen('facultyCancelAppointment')}
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
            onMorePress={() => console.log('Open notification options')}
            onMarkAllRead={() => console.log('Mark all as read')}
            onSelectNotification={(item) => console.log('Selected notification:', item)}
            onTabChange={handleFacultyTabChange}
          />
        )}

        {screen === 'facultyProfileMenu' && (
          <FacultyProfileMenuScreen
            onBack={() => setScreen('facultyHome')}
            onPersonalInformation={() => console.log('Open personal information')}
            onChangePassword={() => goToChangePassword('facultyProfileMenu')}
            onAbout={() => goToAbout('facultyProfileMenu')}
            onLogout={() => setScreen('login')}
            onTabChange={handleFacultyTabChange}
          />
        )}

        {screen === 'changePassword' && (
          <ChangePasswordScreen
            onBack={() => setScreen(previousScreen)}
            onSave={(data) => {
              console.log('Change password:', data);
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
            dateLabel={confirmedBooking?.dateLabel}
            bookedTimeRangeLabel={confirmedBooking?.bookedTimeRangeLabel}
            location={confirmedBooking?.slot.location}
            mode={confirmedBooking?.slot.mode}
            onBack={() => setScreen('facultyDirectory')}
            onConfirmCancel={handleFacultyCancel}
          />
        )}
      </Animated.View>

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