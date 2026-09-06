import React, { useState, useEffect } from 'react';
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
import {
  WEEK_DAYS,
  ScheduleSlot,
  DURATION_OPTIONS,
  getRemainingMinutes,
  isSlotFull,
  getFittingDurationOptions,
} from '../data/facultySchedule';

export type BookingSelection = {
  date: number;
  dateLabel: string;
  slot: ScheduleSlot;
  duration: string;
  durationMinutes: number;
};

type BookAppointmentScreenProps = {
  scheduleByDate: Record<number, ScheduleSlot[]>;
  mode?: 'book' | 'reschedule';
  onBack?: () => void;
  onContinue?: (selection: BookingSelection) => void;
  doctorName?: string;
  department?: string;
  initialDate?: number;
  initialSlotId?: string;
};

export default function BookAppointmentScreen({
  scheduleByDate,
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
    WEEK_DAYS.find((d) => (scheduleByDate[d.date] ?? []).some((s) => !isSlotFull(s)))?.date ??
    WEEK_DAYS[0].date;

  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>(initialSlotId);
  const [selectedDurationMinutes, setSelectedDurationMinutes] = useState<number | undefined>();

  const isReschedule = mode === 'reschedule';
  const slotsForDate = scheduleByDate[selectedDate] ?? [];
  const selectedDay = WEEK_DAYS.find((d) => d.date === selectedDate);
  const selectedSlot = slotsForDate.find((s) => s.id === selectedSlotId);
  const availableCount = slotsForDate.filter((s) => !isSlotFull(s)).length;
  const fittingOptions = selectedSlot ? getFittingDurationOptions(selectedSlot) : [];

  useEffect(() => {
    if (!selectedSlot) {
      setSelectedDurationMinutes(undefined);
      return;
    }
    const options = getFittingDurationOptions(selectedSlot);
    if (options.length === 0) {
      setSelectedDurationMinutes(undefined);
    } else {
      const preferred = options.find((o) => o.minutes === 30) ?? options[options.length - 1];
      setSelectedDurationMinutes(preferred.minutes);
    }
  }, [selectedSlotId]);

  const handleSelectDate = (date: number) => {
    setSelectedDate(date);
    setSelectedSlotId(undefined);
  };

  const handleContinue = () => {
    if (!selectedSlot || !selectedDay || !selectedDurationMinutes) return;
    const durationLabel =
      DURATION_OPTIONS.find((d) => d.minutes === selectedDurationMinutes)?.label ?? '';
    onContinue?.({
      date: selectedDate,
      dateLabel: selectedDay.fullLabel,
      slot: selectedSlot,
      duration: durationLabel,
      durationMinutes: selectedDurationMinutes,
    });
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
            const hasAvailable = (scheduleByDate[d.date] ?? []).some((s) => !isSlotFull(s));
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
            const full = isSlotFull(slot);
            const remaining = getRemainingMinutes(slot);
            return (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.slotCard,
                  isSelected && styles.slotCardSelected,
                  full && styles.slotCardDisabled,
                ]}
                onPress={() => !full && setSelectedSlotId(slot.id)}
                activeOpacity={full ? 1 : 0.75}
                disabled={full}
              >
                <View
                  style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterActive,
                    full && styles.radioOuterDisabled,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>

                <View style={styles.slotTextWrap}>
                  <Text style={[styles.slotTime, full && styles.slotTextDisabled]}>
                    {slot.time}
                  </Text>
                  <View style={styles.slotMetaRow}>
                    <Ionicons
                      name={slot.mode === 'Online' ? 'wifi-outline' : 'location-outline'}
                      size={12}
                      color={colors.textMuted}
                    />
                    <Text style={[styles.slotLocation, full && styles.slotTextDisabled]}>
                      {slot.location}
                    </Text>
                  </View>
                  <Text style={[styles.slotMode, full && styles.slotTextDisabled]}>
                    {full ? 'Fully booked' : `${remaining} min remaining`}
                  </Text>
                </View>

                {full && <Text style={styles.bookedTag}>Full</Text>}
              </TouchableOpacity>
            );
          })
        )}

        {selectedSlot && !isSlotFull(selectedSlot) && (
          <>
            <Text style={styles.sectionTitle}>Appointment Duration</Text>
            <View style={styles.durationRow}>
              {DURATION_OPTIONS.map((option) => {
                const fits = fittingOptions.some((o) => o.minutes === option.minutes);
                const isActive = option.minutes === selectedDurationMinutes;
                return (
                  <TouchableOpacity
                    key={option.label}
                    style={[
                      styles.durationChip,
                      isActive && styles.durationChipActive,
                      !fits && styles.durationChipDisabled,
                    ]}
                    onPress={() => fits && setSelectedDurationMinutes(option.minutes)}
                    disabled={!fits}
                  >
                    <Text
                      style={[
                        styles.durationChipText,
                        isActive && styles.durationChipTextActive,
                        !fits && styles.durationChipTextDisabled,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.durationHint}>
              {getRemainingMinutes(selectedSlot)} minutes remaining in this slot — only
              durations that fit are selectable.
            </Text>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedSlot || !selectedDurationMinutes) && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          activeOpacity={0.85}
          disabled={!selectedSlot || !selectedDurationMinutes}
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
  durationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  durationChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.inputBackground,
  },
  durationChipActive: {
    backgroundColor: colors.primary,
  },
  durationChipDisabled: {
    opacity: 0.35,
  },
  durationChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textDark,
  },
  durationChipTextActive: {
    color: colors.white,
  },
  durationChipTextDisabled: {
    color: colors.textMuted,
  },
  durationHint: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: spacing.lg,
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