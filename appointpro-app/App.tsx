import React, { useState, useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './screens/LoginScreen';
import AccountTypeScreen from './screens/AccountTypeScreen';
import StudentSignUpScreen from './screens/StudentSignUpScreen';
import FacultySignUpScreen from './screens/FacultySignUpScreen';
import CompleteStudentProfileScreen from './screens/CompleteStudentProfileScreen';
import CompleteFacultyProfileScreen from './screens/CompleteFacultyProfileScreen';
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
import AddTimeSlotScreen from './screens/AddTimeSlotScreen';
import FacultyNotificationsScreen from './screens/FacultyNotificationsScreen';
import FacultyProfileMenuScreen from './screens/FacultyProfileMenuScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import AboutScreen from './screens/AboutScreen';
import { TabKey } from './components/BottomTabBar';
import { FacultyTabKey } from './components/FacultyBottomTabBar';

type Screen =
  | 'login'
  | 'accountType'
  | 'studentSignUp'
  | 'facultySignUp'
  | 'completeStudentProfile'
  | 'completeFacultyProfile'
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
  | 'about';

function AppContent() {
  const [screen, setScreen] = useState<Screen>('login');
  const [previousScreen, setPreviousScreen] = useState<Screen>('profile');
  const [bookingPreselect, setBookingPreselect] = useState<{
    date?: number;
    slotId?: string;
  } | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingSelection | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(16);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220,
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

  const goToChangePassword = (from: Screen) => {
    setPreviousScreen(from);
    setScreen('changePassword');
  };

  const goToAbout = (from: Screen) => {
    setPreviousScreen(from);
    setScreen('about');
  };

  const isAuthScreen =
    screen === 'login' ||
    screen === 'accountType' ||
    screen === 'studentSignUp' ||
    screen === 'facultySignUp' ||
    screen === 'completeStudentProfile' ||
    screen === 'completeFacultyProfile';

  return (
    <>
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        }}
      >
        {screen === 'login' && (
          <LoginScreen
            onSignUp={() => setScreen('accountType')}
            onForgotPassword={() => {}}
            onLogin={(role, identifier, password) => {
              console.log('Login attempt:', role, identifier, password);
              setScreen(role === 'faculty' ? 'completeFacultyProfile' : 'completeStudentProfile');
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

        {screen === 'completeStudentProfile' && (
          <CompleteStudentProfileScreen
            onContinue={(data) => {
              console.log('Student profile completed:', data);
              setScreen('home');
            }}
          />
        )}

        {screen === 'completeFacultyProfile' && (
          <CompleteFacultyProfileScreen
            onContinue={(data) => {
              console.log('Faculty profile completed:', data);
              setScreen('facultyHome');
            }}
          />
        )}

        {screen === 'home' && (
          <HomeScreen
            onMenuPress={() => console.log('Open menu')}
            onNotificationsPress={() => setScreen('notifications')}
            onViewAppointments={() => setScreen('appointments')}
            onViewNotifications={() => setScreen('notifications')}
            onViewQueue={() => console.log('View queue')}
            onBookAppointment={() => {
              setBookingPreselect(null);
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
            onBack={() => setScreen('directory')}
            onMorePress={() => console.log('Open faculty options')}
            onSelectSlot={(date, slot) => {
              setBookingPreselect({ date, slotId: slot.id });
              setScreen('bookAppointment');
            }}
            onContinue={() => {
              setBookingPreselect(null);
              setScreen('bookAppointment');
            }}
            onTabChange={handleTabChange}
          />
        )}

        {screen === 'bookAppointment' && (
          <BookAppointmentScreen
            mode="book"
            initialDate={bookingPreselect?.date}
            initialSlotId={bookingPreselect?.slotId}
            onBack={() => setScreen('facultyProfile')}
            onContinue={(selection) => {
              setConfirmedBooking(selection);
              setScreen('bookingConfirmation');
            }}
          />
        )}

        {screen === 'rescheduleAppointment' && (
          <BookAppointmentScreen
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
            time={confirmedBooking?.slot.time}
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
            onCancelAppointment={() => setScreen('bookingCancellation')}
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
            onOpenWalkInQueue={() => console.log('Open walk-in queue')}
            onOpenSlotIQAI={() => console.log('Open SlotIQ AI')}
            onTabChange={handleFacultyTabChange}
          />
        )}

        {screen === 'facultyDirectory' && (
          <FacultyDirectoryScreen
            onSelectAppointment={(appointment) =>
              console.log('Selected student appointment:', appointment)
            }
            onTabChange={handleFacultyTabChange}
          />
        )}

        {screen === 'facultyAvailability' && (
          <FacultyAvailabilityScreen
            onBack={() => setScreen('facultyHome')}
            onInfoPress={() => console.log('Open availability info')}
            onAddTimeSlot={() => setScreen('addTimeSlot')}
            onDeleteTimeSlot={(id) => console.log('Delete time slot:', id)}
            onSaveAvailability={(slotsByDate) => {
              console.log('Save availability:', slotsByDate);
              setScreen('facultyHome');
            }}
            onTabChange={handleFacultyTabChange}
          />
        )}

        {screen === 'addTimeSlot' && (
          <AddTimeSlotScreen
            onBack={() => setScreen('facultyAvailability')}
            onConfirm={(slot) => {
              console.log('New time slot:', slot);
              setScreen('facultyAvailability');
            }}
            onTabChange={handleFacultyTabChange}
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

        {screen === 'about' && (
          <AboutScreen onBack={() => setScreen(previousScreen)} />
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