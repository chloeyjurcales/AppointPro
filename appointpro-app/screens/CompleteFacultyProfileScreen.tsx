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
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import AuthInput from '../components/AuthInput';

type ConsultationType = 'face-to-face' | 'online';

type FacultyProfileData = {
  fullName: string;
  email: string;
  department: string;
  consultationTypes: ConsultationType[];
  facultyId: string;
};

type CompleteFacultyProfileScreenProps = {
  onContinue?: (data: FacultyProfileData) => void;
};

const CONSULTATION_OPTIONS: { key: ConsultationType; label: string }[] = [
  { key: 'face-to-face', label: 'Face-to-Face' },
  { key: 'online', label: 'Online' },
];

export default function CompleteFacultyProfileScreen({
  onContinue,
}: CompleteFacultyProfileScreenProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [consultationTypes, setConsultationTypes] = useState<ConsultationType[]>([
    'face-to-face',
  ]);
  const [facultyId, setFacultyId] = useState('');

  const toggleConsultationType = (key: ConsultationType) => {
    setConsultationTypes((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

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
              <Ionicons name="person" size={26} color={colors.white} />
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

          <Text style={styles.label}>Faculty ID</Text>
          <AuthInput
            placeholder="Enter your faculty ID"
            value={facultyId}
            onChangeText={setFacultyId}
          />

          <View style={styles.spacerMd} />

          <Text style={styles.label}>Consultation Type</Text>
          <Text style={styles.helperText}>Select one or more</Text>
          <View style={styles.typeRow}>
            {CONSULTATION_OPTIONS.map((opt) => {
              const isActive = consultationTypes.includes(opt.key);
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={styles.typeOption}
                  onPress={() => toggleConsultationType(opt.key)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkboxOuter, isActive && styles.checkboxOuterActive]}>
                    {isActive && <Ionicons name="checkmark" size={14} color={colors.white} />}
                  </View>
                  <Text style={styles.typeLabel}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() =>
              onContinue?.({ fullName, email, department, consultationTypes, facultyId })
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
    backgroundColor: '#A8493C',
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
  helperText: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  spacerSm: {
    height: spacing.sm,
  },
  spacerMd: {
    height: spacing.md,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxOuter: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  checkboxOuterActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  typeLabel: {
    fontSize: 12,
    color: colors.textDark,
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