import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './screens/LoginScreen';
import AccountTypeScreen from './screens/AccountTypeScreen';
import StudentSignUpScreen from './screens/StudentSignUpScreen';
import FacultySignUpScreen from './screens/FacultySignUpScreen';
import HomeScreen from './screens/HomeScreen';
import DirectoryScreen from './screens/DirectoryScreen';
import FacultyProfileScreen from './screens/FacultyProfileScreen';
import BookAppointmentScreen from './screens/BookAppointmentScreen';
import BookingConfirmationScreen from './screens/BookingConfirmationScreen';
import AppointmentsScreen from './screens/AppointmentsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import ProfileScreen from './screens/ProfileScreen';
import { TabKey } from './components/BottomTabBar';

type Screen =
  | 'login'
  | 'accountType'
  | 'studentSignUp'
  | 'facultySignUp'
  | 'home'
  | 'directory'
  | 'facultyProfile'
  | 'bookAppointment'
  | 'bookingConfirmation'
  | 'appointments'
  | 'notifications'
  | 'profile';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');

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

  return (
    <>
      {screen === 'login' && (
        <LoginScreen
          onSignUp={() => setScreen('accountType')}
          onForgotPassword={() => {}}
          onLogin={(role, identifier, password) => {
            console.log('Login attempt:', role, identifier, password);
            setScreen('home');
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
            setScreen('home');
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
          onBookAppointment={() => setScreen('bookAppointment')}
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
          onViewFullSchedule={() => console.log('View full schedule')}
          onContinue={() => setScreen('bookAppointment')}
          onTabChange={handleTabChange}
        />
      )}

      {screen === 'bookAppointment' && (
        <BookAppointmentScreen
          onBack={() => setScreen('facultyProfile')}
          onContinue={(data) => {
            console.log('Booking details:', data);
            setScreen('bookingConfirmation');
          }}
        />
      )}

      {screen === 'bookingConfirmation' && (
        <BookingConfirmationScreen
          onBack={() => setScreen('bookAppointment')}
          onMorePress={() => console.log('Open confirmation options')}
          onBookAnother={() => setScreen('bookAppointment')}
          onBackToHome={() => setScreen('home')}
        />
      )}

      {screen === 'appointments' && (
        <AppointmentsScreen
          onMenuPress={() => console.log('Open menu')}
          onSelectAppointment={(appointment) => console.log('Selected appointment:', appointment)}
          onTabChange={handleTabChange}
        />
      )}

      {screen === 'notifications' && (
        <NotificationsScreen onTabChange={handleTabChange} />
      )}

      {screen === 'profile' && (
        <ProfileScreen onTabChange={handleTabChange} />
      )}

      <StatusBar style={screen === 'login' || screen === 'accountType' ? 'light' : 'dark'} />
    </>
  );
}