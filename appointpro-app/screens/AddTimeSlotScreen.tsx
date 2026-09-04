import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import FacultyBottomTabBar, { FacultyTabKey } from '../components/FacultyBottomTabBar';

type Period = 'AM' | 'PM';
type ConsultationType = 'face-to-face' | 'online' | 'both';

type NewTimeSlot = {
  startHour: string;
  startMinute: string;
  startPeriod: Period;
  endHour: string;
  endMinute: string;
  endPeriod: Period;
  consultationType: ConsultationType;
  location: string;
};

type AddTimeSlotScreenProps = {
  onBack?: () => void;
  onConfirm?: (slot: NewTimeSlot) => void;
  onTabChange?: (tab: FacultyTabKey) => void;
};

export default function AddTimeSlotScreen({
  onBack,
  onConfirm,
  onTabChange,
}: AddTimeSlotScreenProps) {
  const [startHour, setStartHour] = useState('10');
  const [startMinute, setStartMinute] = useState('00');
  const [startPeriod, setStartPeriod] = useState<Period>('PM');
  const [endHour, setEndHour] = useState('12');
  const [endMinute, setEndMinute] = useState('30');
  const [endPeriod, setEndPeriod] = useState<Period>('PM');
  const [consultationType, setConsultationType] = useState<ConsultationType>('face-to-face');
  const [location, setLocation] = useState('');

  const isOnline = consultationType === 'online';

  const handleConfirm = () => {
    onConfirm?.({
      startHour,
      startMinute,
      startPeriod,
      endHour,
      endMinute,
      endPeriod,
      consultationType,
      location,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Availability</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Set New Time Slot</Text>

          <View style={styles.timeRow}>
            <Text style={styles.fieldLabel}>Hour:</Text>
            <TextInput
              style={styles.timeInput}
              value={startHour}
              onChangeText={setStartHour}
              keyboardType="number-pad"
              maxLength={2}
            />
            <Text style={styles.fieldLabel}>Minute:</Text>
            <TextInput
              style={styles.timeInput}
              value={startMinute}
              onChangeText={setStartMinute}
              keyboardType="number-pad"
              maxLength={2}
            />
            <View style={styles.periodToggle}>
              <TouchableOpacity
                style={[styles.periodOption, startPeriod === 'AM' && styles.periodOptionActive]}
                onPress={() => setStartPeriod('AM')}
              >
                <Text
                  style={[
                    styles.periodOptionText,
                    startPeriod === 'AM' && styles.periodOptionTextActive,
                  ]}
                >
                  AM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodOption, startPeriod === 'PM' && styles.periodOptionActive]}
                onPress={() => setStartPeriod('PM')}
              >
                <Text
                  style={[
                    styles.periodOptionText,
                    startPeriod === 'PM' && styles.periodOptionTextActive,
                  ]}
                >
                  PM
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.timeRow}>
            <Text style={styles.fieldLabel}>End:</Text>
            <TextInput
              style={styles.timeInput}
              value={endHour}
              onChangeText={setEndHour}
              keyboardType="number-pad"
              maxLength={2}
            />
            <Text style={styles.fieldLabel}>Minute:</Text>
            <TextInput
              style={styles.timeInput}
              value={endMinute}
              onChangeText={setEndMinute}
              keyboardType="number-pad"
              maxLength={2}
            />
            <View style={styles.periodToggle}>
              <TouchableOpacity
                style={[styles.periodOption, endPeriod === 'AM' && styles.periodOptionActive]}
                onPress={() => setEndPeriod('AM')}
              >
                <Text
                  style={[
                    styles.periodOptionText,
                    endPeriod === 'AM' && styles.periodOptionTextActive,
                  ]}
                >
                  AM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodOption, endPeriod === 'PM' && styles.periodOptionActive]}
                onPress={() => setEndPeriod('PM')}
              >
                <Text
                  style={[
                    styles.periodOptionText,
                    endPeriod === 'PM' && styles.periodOptionTextActive,
                  ]}
                >
                  PM
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.typeRow}>
            {(
              [
                { key: 'face-to-face', label: 'Face-to-Face' },
                { key: 'online', label: 'Online' },
                { key: 'both', label: 'Both' },
              ] as { key: ConsultationType; label: string }[]
            ).map((opt) => {
              const isActive = consultationType === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={styles.typeOption}
                  onPress={() => setConsultationType(opt.key)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.radioOuter, isActive && styles.radioOuterActive]}>
                    {isActive && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.typeLabel}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.locationBlock}>
            <Text style={styles.fieldLabel}>
              {isOnline ? 'Meeting Link' : 'Location'}
            </Text>
            <View style={styles.locationInputRow}>
              <Ionicons
                name={isOnline ? 'link-outline' : 'location-outline'}
                size={16}
                color={colors.textMuted}
                style={styles.locationIcon}
              />
              <TextInput
                style={styles.locationInput}
                value={location}
                onChangeText={setLocation}
                placeholder={
                  isOnline
                    ? 'Enter meeting link (e.g. Google Meet, Zoom)'
                    : 'Enter room or location (e.g. Office Room 204)'
                }
                placeholderTextColor="#9B9B9B"
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm} activeOpacity={0.85}>
          <Text style={styles.confirmButtonText}>Confirm and Add Time Slot</Text>
        </TouchableOpacity>
      </ScrollView>

      <FacultyBottomTabBar active="appointment" onChange={onTabChange} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
  },
  headerSpacer: {
    width: 22,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  formCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  formTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textDark,
  },
  timeInput: {
    width: 44,
    height: 36,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 13,
    color: colors.textDark,
  },
  periodToggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
    marginLeft: 'auto',
  },
  periodOption: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  periodOptionActive: {
    backgroundColor: colors.tabInactiveBg,
  },
  periodOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  periodOptionTextActive: {
    color: colors.textDark,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  radioOuterActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.primary,
  },
  typeLabel: {
    fontSize: 12,
    color: colors.textDark,
  },
  locationBlock: {
    marginTop: spacing.xs,
  },
  locationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginTop: 6,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textDark,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
});