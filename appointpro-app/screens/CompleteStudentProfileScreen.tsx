import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import AuthInput from '../components/AuthInput';

type StudentProfileData = {
  fullName: string;
  studentId: string;
  email: string;
  department: string;
  yearLevel: string;
};

type CompleteStudentProfileScreenProps = {
  onContinue?: (data: StudentProfileData) => void;
};

export default function CompleteStudentProfileScreen({
  onContinue,
}: CompleteStudentProfileScreenProps) {
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [yearLevel, setYearLevel] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <FontAwesome5 name="graduation-cap" size={26} color={colors.white} />
            </View>
          </View>

          <Text style={styles.heading}>Complete Your Profile</Text>
          <Text style={styles.subheading}>
            Tell us a bit more about yourself before you get started.
          </Text>

          <Text style={styles.label}>Full Name</Text>
          <AuthInput
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />

          <View style={styles.spacerSm} />

          <Text style={styles.label}>Student ID</Text>
          <AuthInput
            placeholder="Enter your student ID"
            value={studentId}
            onChangeText={setStudentId}
          />

          <View style={styles.spacerSm} />

          <Text style={styles.label}>Email Address</Text>
          <AuthInput
            placeholder="Enter your email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <View style={styles.spacerSm} />

          <Text style={styles.label}>Department</Text>
          <AuthInput
            placeholder="Enter your department"
            value={department}
            onChangeText={setDepartment}
            autoCapitalize="words"
          />

          <View style={styles.spacerSm} />

          <Text style={styles.label}>Year Level</Text>
          <AuthInput
            placeholder="e.g. 3rd Year"
            value={yearLevel}
            onChangeText={setYearLevel}
          />

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() =>
              onContinue?.({ fullName, studentId, email, department, yearLevel })
            }
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textDark,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 6,
  },
  spacerSm: {
    height: spacing.sm,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  continueButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
});