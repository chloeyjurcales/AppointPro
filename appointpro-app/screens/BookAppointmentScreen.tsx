import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import { WEEK_DAYS, SCHEDULE_BY_DATE, ScheduleSlot } from '../data/facultySchedule';

export type BookingSelection = {
  date: number;
  dateLabel: string;
  slot: ScheduleSlot;
};

type BookAppointmentScreenProps = {
  mode?: 'book' | 'reschedule';
  onBack?: () => void;
  onContinue?: (selection: BookingSelection) => void;
  doctorName?: string;
  department?: string;
  initialDate?: number;
  initialSlotId?: string;
};

export default function BookAppointmentScreen({
  mode = 'book',
  onBack,
  onContinue,
  doctorName = 'Dr. Juan Dela Cruz',
  department = 'Computer Studies',
  initialDate,
  initialSlotId,
}: BookAppointmentScreenProps) {
  const defaultDate =
    initialDate ??
    WEEK_DAYS.find((d) => SCHEDULE_BY_DATE[d.date]?.some((s) => s.available))?.date ??
    WEEK_DAYS[0].date;

  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>(initialSlotId);

  const isReschedule = mode === 'reschedule';
  const slotsForDate = SCHEDULE_BY_DATE[selectedDate] ?? [];
  const selectedDay = WEEK_DAYS.find((d) => d.date === selectedDate);
  const selectedSlot = slotsForDate.find((s) => s.id === selectedSlotId);
  const availableCount = slotsForDate.filter((s) => s.available).length;

  const handleSelectDate = (date: number) => {
    setSelectedDate(date);
    setSelectedSlotId(undefined);
  };

  const handleContinue = () => {
    if (!selectedSlot || !selectedDay) return;
    onContinue?.({ date: selectedDate, dateLabel: selectedDay.fullLabel, slot: selectedSlot });
  };

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
        <View style={styles.doctorCard}>
          <View style={styles.avatar}>
            <FontAwesome5 name="user-tie" size={20} color={colors.white} />
          </View>
          <View>
            <Text style={styles.doctorName}>{doctorName}</Text>
            <Text style={styles.doctorDept}>{department}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Select Date</Text>

        <View style={styles.dateRow}>
          {WEEK_DAYS.map((d) => {
            const isActive = d.date === selectedDate;
            const hasAvailable = (SCHEDULE_BY_DATE[d.date] ?? []).some((s) => s.available);
            return (
              <TouchableOpacity
                key={d.date}
                style={[
                  styles.dateChip,
                  isActive && styles.dateChipActive,
                  !hasAvailable && styles.dateChipDisabled,
                ]}
                onPress={() => hasAvailable && handleSelectDate(d.date)}
                disabled={!hasAvailable}
              >
                <Text
                  style={[
                    styles.dateDay,
                    isActive && styles.dateTextActive,
                    !hasAvailable && styles.dateTextDisabled,
                  ]}
                >
                  {d.day}
                </Text>
                <Text
                  style={[
                    styles.dateNum,
                    isActive && styles.dateTextActive,
                    !hasAvailable && styles.dateTextDisabled,
                  ]}
                >
                  {d.date}
                </Text>
                <View
                  style={[
                    styles.dateDot,
                    hasAvailable
                      ? isActive
                        ? styles.dateDotActiveFilled
                        : styles.dateDotFilled
                      : styles.dateDotEmpty,
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.selectedDayLabel}>{selectedDay?.fullLabel}</Text>
          <Text style={styles.availableCountText}>
            {availableCount} slot{availableCount === 1 ? '' : 's'} available
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Select Time & Location</Text>

        {slotsForDate.length === 0 ? (
          <View style={styles.emptySchedule}>
            <Ionicons name="calendar-outline" size={22} color={colors.textMuted} />
            <Text style={styles.emptyScheduleText}>
              No slots offered this day. Try another date.
            </Text>
          </View>
        ) : (
          slotsForDate.map((slot) => {
            const isSelected = slot.id === selectedSlotId;
            return (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.slotCard,
                  isSelected && styles.slotCardSelected,
                  !slot.available && styles.slotCardDisabled,
                ]}
                onPress={() => slot.available && setSelectedSlotId(slot.id)}
                activeOpacity={slot.available ? 0.75 : 1}
                disabled={!slot.available}
              >
                <View
                  style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterActive,
                    !slot.available && styles.radioOuterDisabled,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>

                <View style={styles.slotTextWrap}>
                  <Text style={[styles.slotTime, !slot.available && styles.slotTextDisabled]}>
                    {slot.time}
                  </Text>
                  <View style={styles.slotMetaRow}>
                    <Ionicons
                      name={slot.mode === 'Online' ? 'wifi-outline' : 'location-outline'}
                      size={12}
                      color={slot.available ? colors.textMuted : colors.textMuted}
                    />
                    <Text style={[styles.slotLocation, !slot.available && styles.slotTextDisabled]}>
                      {slot.location}
                    </Text>
                  </View>
                  <Text style={[styles.slotMode, !slot.available && styles.slotTextDisabled]}>
                    {slot.mode}
                  </Text>
                </View>

                {!slot.available && <Text style={styles.bookedTag}>Booked</Text>}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !selectedSlot && styles.continueButtonDisabled]}
          onPress={handleContinue}
          activeOpacity={0.85}
          disabled={!selectedSlot}
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: spacing.sm,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
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
  dateChipDisabled: {
    opacity: 0.4,
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
    marginBottom: 4,
  },
  dateTextActive: {
    color: colors.white,
  },
  dateTextDisabled: {
    color: colors.textMuted,
  },
  dateDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dateDotFilled: {
    backgroundColor: colors.primary,
  },
  dateDotActiveFilled: {
    backgroundColor: colors.white,
  },
  dateDotEmpty: {
    backgroundColor: 'transparent',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  selectedDayLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  availableCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
  },
  emptySchedule: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  emptyScheduleText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  slotCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.infoBg,
  },
  slotCardDisabled: {
    backgroundColor: colors.inputBackground,
    opacity: 0.7,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  radioOuterActive: {
    borderColor: colors.primary,
  },
  radioOuterDisabled: {
    borderColor: colors.textMuted,
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.primary,
  },
  slotTextWrap: {
    flex: 1,
  },
  slotTime: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 3,
  },
  slotMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  slotLocation: {
    fontSize: 11,
    color: colors.textMuted,
  },
  slotMode: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  slotTextDisabled: {
    color: colors.textMuted,
  },
  bookedTag: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.danger,
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
  continueButtonDisabled: {
    opacity: 0.4,
  },
  continueButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
});