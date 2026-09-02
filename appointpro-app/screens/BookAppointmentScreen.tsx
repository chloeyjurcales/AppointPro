import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { colors, spacing } from '../theme';

type ConsultationType = 'face-to-face' | 'online' | 'both';
type Period = 'AM' | 'PM';

type DateOption = {
  day: string;
  date: number;
};

const DATES: DateOption[] = [
  { day: 'Sun', date: 10 },
  { day: 'Mon', date: 11 },
  { day: 'Tue', date: 12 },
  { day: 'Wed', date: 13 },
  { day: 'Thu', date: 14 },
  { day: 'Fri', date: 15 },
  { day: 'Sat', date: 16 },
];

const AM_SLOTS = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'];
const PM_SLOTS = ['1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM'];

type BookAppointmentScreenProps = {
  mode?: 'book' | 'reschedule';
  onBack?: () => void;
  onContinue?: (data: {
    date: number;
    time: string;
    consultationType: ConsultationType;
  }) => void;
  doctorName?: string;
  department?: string;
};

export default function BookAppointmentScreen({
  mode = 'book',
  onBack,
  onContinue,
  doctorName = 'Dr. Juan Dela Cruz',
  department = 'Computer Studies',
}: BookAppointmentScreenProps) {
  const [selectedDate, setSelectedDate] = useState(13);
  const [period, setPeriod] = useState<Period>('AM');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [consultationType, setConsultationType] = useState<ConsultationType>('face-to-face');

  const slots = period === 'AM' ? AM_SLOTS : PM_SLOTS;
  const isReschedule = mode === 'reschedule';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.doctorCard, isReschedule && styles.doctorRowPlain]}>
          <View style={styles.avatar}>
            <FontAwesome5 name="user-tie" size={20} color={colors.white} />
          </View>
          <View>
            <Text style={styles.doctorName}>{doctorName}</Text>
            <Text style={styles.doctorDept}>{department}</Text>
            {isReschedule && <Text style={styles.doctorStatus}>Available</Text>}
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <TouchableOpacity style={styles.monthRow}>
            <Text style={styles.monthText}>May 5, 2026</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.dateRow}>
          {DATES.map((d) => {
            const isActive = d.date === selectedDate;
            return (
              <TouchableOpacity
                key={d.date}
                style={[styles.dateChip, isActive && styles.dateChipActive]}
                onPress={() => setSelectedDate(d.date)}
              >
                <Text style={[styles.dateDay, isActive && styles.dateTextActive]}>{d.day}</Text>
                <Text style={[styles.dateNum, isActive && styles.dateTextActive]}>{d.date}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Select Time</Text>

        <View style={styles.periodRow}>
          <TouchableOpacity
            style={[styles.periodTab, period === 'AM' && styles.periodTabActive]}
            onPress={() => setPeriod('AM')}
          >
            <Text style={[styles.periodText, period === 'AM' && styles.periodTextActive]}>
              AM
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodTab, period === 'PM' && styles.periodTabActive]}
            onPress={() => setPeriod('PM')}
          >
            <Text style={[styles.periodText, period === 'PM' && styles.periodTextActive]}>
              PM
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timeGrid}>
          {slots.map((time) => {
            const isActive = time === selectedTime;
            return (
              <TouchableOpacity
                key={time}
                style={[styles.timeChip, isActive && styles.timeChipActive]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[styles.timeText, isActive && styles.timeTextActive]}>{time}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Consultation Type</Text>

        <View style={[styles.typeRow, isReschedule && styles.typeRowHorizontal]}>
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
                style={[styles.typeOption, isReschedule && styles.typeOptionHorizontal]}
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
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() =>
            onContinue?.({ date: selectedDate, time: selectedTime, consultationType })
          }
          activeOpacity={0.85}
        >
          <Text style={styles.continueButtonText}>
            {isReschedule ? 'Reschedule' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 15,
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
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  doctorRowPlain: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  doctorName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
  },
  doctorDept: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  doctorStatus: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: spacing.sm,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  monthText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  dateChip: {
    width: 36,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
  },
  dateChipActive: {
    backgroundColor: colors.primary,
  },
  dateDay: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 4,
  },
  dateNum: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
  },
  dateTextActive: {
    color: colors.white,
  },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: colors.tabInactiveBg,
    borderRadius: 10,
    padding: 4,
    marginBottom: spacing.md,
  },
  periodTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  periodTabActive: {
    backgroundColor: colors.primary,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.tabInactiveText,
  },
  periodTextActive: {
    color: colors.white,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  timeChip: {
    width: '31%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
  },
  timeChipActive: {
    backgroundColor: colors.primary,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textDark,
  },
  timeTextActive: {
    color: colors.white,
  },
  typeRow: {
    gap: spacing.md,
  },
  typeRowHorizontal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeOptionHorizontal: {
    flex: 1,
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
    fontSize: 13,
    color: colors.textDark,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
});