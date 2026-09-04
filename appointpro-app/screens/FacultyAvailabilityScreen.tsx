import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import FacultyBottomTabBar, { FacultyTabKey } from '../components/FacultyBottomTabBar';

type ConsultationMode = 'Face-to-Face' | 'Online';
type RecurrenceOption = 'Recurring Weekly' | 'This Week Only';

type TimeSlot = {
  id: string;
  label: string;
  mode: ConsultationMode;
  location: string;
  enabled: boolean;
};

type DateOption = {
  day: string;
  date: number;
  fullLabel: string;
};

const DATES: DateOption[] = [
  { day: 'Sun', date: 11, fullLabel: 'Sunday, May 11, 2025' },
  { day: 'Mon', date: 12, fullLabel: 'Monday, May 12, 2025' },
  { day: 'Tue', date: 13, fullLabel: 'Tuesday, May 13, 2025' },
  { day: 'Wed', date: 14, fullLabel: 'Wednesday, May 14, 2025' },
  { day: 'Thu', date: 15, fullLabel: 'Thursday, May 15, 2025' },
  { day: 'Fri', date: 16, fullLabel: 'Friday, May 16, 2025' },
  { day: 'Sat', date: 17, fullLabel: 'Saturday, May 17, 2025' },
];

const INITIAL_SLOTS_BY_DATE: Record<number, TimeSlot[]> = {
  11: [],
  12: [
    {
      id: '1',
      label: '9:00 AM - 11:00 AM',
      mode: 'Face-to-Face',
      location: 'Office Room 204',
      enabled: true,
    },
    {
      id: '2',
      label: '1:00 PM - 3:00 PM',
      mode: 'Online',
      location: 'Online (Virtual)',
      enabled: true,
    },
    {
      id: '3',
      label: '12:00 PM - 2:00 PM',
      mode: 'Face-to-Face',
      location: 'Library - Study Room 1',
      enabled: true,
    },
    {
      id: '4',
      label: '10:00 AM - 12:00 PM',
      mode: 'Face-to-Face',
      location: 'Lab Room 3',
      enabled: false,
    },
  ],
  13: [],
  14: [],
  15: [],
  16: [],
  17: [],
};

function cloneSlots(slots: TimeSlot[], targetDate: number): TimeSlot[] {
  return slots.map((slot, index) => ({
    ...slot,
    id: `${targetDate}-${index}-${Date.now()}`,
  }));
}

type FacultyAvailabilityScreenProps = {
  onBack?: () => void;
  onInfoPress?: () => void;
  onAddTimeSlot?: () => void;
  onDeleteTimeSlot?: (id: string) => void;
  onSaveAvailability?: (slotsByDate: Record<number, TimeSlot[]>) => void;
  onTabChange?: (tab: FacultyTabKey) => void;
};

export default function FacultyAvailabilityScreen({
  onBack,
  onInfoPress,
  onAddTimeSlot,
  onDeleteTimeSlot,
  onSaveAvailability,
  onTabChange,
}: FacultyAvailabilityScreenProps) {
  const [selectedDate, setSelectedDate] = useState(12);
  const [recurrence, setRecurrence] = useState<RecurrenceOption>('Recurring Weekly');
  const [recurrenceOpen, setRecurrenceOpen] = useState(false);
  const [slotsByDate, setSlotsByDate] = useState<Record<number, TimeSlot[]>>(
    INITIAL_SLOTS_BY_DATE
  );
  const [copyPickerOpen, setCopyPickerOpen] = useState(false);
  const [targetDates, setTargetDates] = useState<number[]>([]);

  const currentSlots = slotsByDate[selectedDate] ?? [];
  const selectedDateInfo = DATES.find((d) => d.date === selectedDate);
  const hasSlots = currentSlots.length > 0;

  const toggleSlot = (id: string) => {
    setSlotsByDate((prev) => ({
      ...prev,
      [selectedDate]: prev[selectedDate].map((slot) =>
        slot.id === id ? { ...slot, enabled: !slot.enabled } : slot
      ),
    }));
  };

  const handleDelete = (id: string) => {
    setSlotsByDate((prev) => ({
      ...prev,
      [selectedDate]: prev[selectedDate].filter((slot) => slot.id !== id),
    }));
    onDeleteTimeSlot?.(id);
  };

  const toggleTargetDate = (date: number) => {
    setTargetDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const openCopyPicker = () => {
    setTargetDates([]);
    setCopyPickerOpen(true);
  };

  const applyCopy = () => {
    setSlotsByDate((prev) => {
      const updated = { ...prev };
      targetDates.forEach((date) => {
        updated[date] = cloneSlots(currentSlots, date);
      });
      return updated;
    });
    setCopyPickerOpen(false);
    setTargetDates([]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Faculty Availability & Location</Text>
        <TouchableOpacity onPress={onInfoPress}>
          <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.headerSubtitle}>
        Set your office hours and where students can find you.
      </Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>1. Select Days</Text>
          <View>
            <TouchableOpacity
              style={styles.recurrenceButton}
              onPress={() => setRecurrenceOpen((prev) => !prev)}
              activeOpacity={0.8}
            >
              <Text style={styles.recurrenceButtonText}>{recurrence}</Text>
              <Ionicons
                name={recurrenceOpen ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={colors.primary}
              />
            </TouchableOpacity>
            {recurrenceOpen && (
              <View style={styles.recurrenceDropdown}>
                {(['Recurring Weekly', 'This Week Only'] as RecurrenceOption[]).map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.recurrenceOption}
                    onPress={() => {
                      setRecurrence(option);
                      setRecurrenceOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.recurrenceOptionText,
                        option === recurrence && styles.recurrenceOptionTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                    {option === 'Recurring Weekly' && (
                      <Text style={styles.recurrenceOptionHint}>
                        Reuses last week's schedule
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.dateRow}>
          {DATES.map((d) => {
            const isActive = d.date === selectedDate;
            const dayHasSlots = (slotsByDate[d.date] ?? []).length > 0;
            return (
              <TouchableOpacity
                key={d.date}
                style={[styles.dateChip, isActive && styles.dateChipActive]}
                onPress={() => setSelectedDate(d.date)}
              >
                <Text style={[styles.dateDay, isActive && styles.dateTextActive]}>{d.day}</Text>
                <Text style={[styles.dateNum, isActive && styles.dateTextActive]}>{d.date}</Text>
                <View
                  style={[
                    styles.dateDot,
                    dayHasSlots
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

        <View style={styles.selectedDateRow}>
          <View style={styles.selectedDateLeft}>
            <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
            <Text style={styles.selectedDateText}>{selectedDateInfo?.fullLabel}</Text>
          </View>
          <TouchableOpacity
            style={styles.copyRow}
            onPress={openCopyPicker}
            disabled={!hasSlots}
          >
            <Text style={[styles.copyText, !hasSlots && styles.copyTextDisabled]}>
              Copy to other days
            </Text>
            <Feather
              name="copy"
              size={13}
              color={hasSlots ? colors.link : colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {copyPickerOpen && (
          <View style={styles.copyPickerCard}>
            <Text style={styles.copyPickerTitle}>
              Paste this day's time slots into:
            </Text>
            <View style={styles.copyPickerList}>
              {DATES.filter((d) => d.date !== selectedDate).map((d) => {
                const isChecked = targetDates.includes(d.date);
                const dayHasSlots = (slotsByDate[d.date] ?? []).length > 0;
                return (
                  <TouchableOpacity
                    key={d.date}
                    style={styles.copyPickerRow}
                    onPress={() => toggleTargetDate(d.date)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkboxOuter, isChecked && styles.checkboxOuterActive]}>
                      {isChecked && <Ionicons name="checkmark" size={12} color={colors.white} />}
                    </View>
                    <Text style={styles.copyPickerRowText}>
                      {d.day} {d.date}
                    </Text>
                    <Text style={styles.copyPickerRowNote}>
                      {dayHasSlots ? 'Will be replaced' : 'Empty'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.copyPickerActions}>
              <TouchableOpacity
                style={styles.copyPickerCancel}
                onPress={() => setCopyPickerOpen(false)}
              >
                <Text style={styles.copyPickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.copyPickerApply,
                  targetDates.length === 0 && styles.copyPickerApplyDisabled,
                ]}
                onPress={applyCopy}
                disabled={targetDates.length === 0}
              >
                <Text style={styles.copyPickerApplyText}>Paste</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>2. Set Time Slots</Text>
          <TouchableOpacity style={styles.addSlotButton} onPress={onAddTimeSlot}>
            <Ionicons name="add" size={14} color={colors.primary} />
            <Text style={styles.addSlotText}>Add Time Slot</Text>
          </TouchableOpacity>
        </View>

        {hasSlots ? (
          currentSlots.map((slot) => (
            <View key={slot.id} style={styles.slotCard}>
              <View style={styles.dragHandle}>
                <MaterialCommunityIcons name="drag-vertical" size={18} color={colors.textMuted} />
              </View>

              <View style={styles.slotBody}>
                <View style={styles.slotTopRow}>
                  <View style={styles.slotTimeWrap}>
                    <Text style={styles.slotLabel}>{slot.label}</Text>
                    <View style={styles.slotModeRow}>
                      <Ionicons
                        name={slot.mode === 'Online' ? 'wifi' : 'people-outline'}
                        size={12}
                        color={colors.textMuted}
                      />
                      <Text style={styles.slotMode}>{slot.mode}</Text>
                    </View>
                  </View>
                  <Switch
                    value={slot.enabled}
                    onValueChange={() => toggleSlot(slot.id)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.white}
                  />
                </View>

                <View style={styles.slotBottomRow}>
                  <View style={styles.locationRow}>
                    <Ionicons
                      name={slot.mode === 'Online' ? 'wifi-outline' : 'location-outline'}
                      size={14}
                      color={colors.textMuted}
                    />
                    <Text style={styles.locationText}>{slot.location}</Text>
                  </View>
                  {!slot.enabled && (
                    <TouchableOpacity onPress={() => handleDelete(slot.id)}>
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="calendar-outline" size={28} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No time slots for this day</Text>
            <Text style={styles.emptySubtitle}>
              Add a time slot, or copy one from a day that already has a schedule.
            </Text>
            <TouchableOpacity style={styles.emptyAddButton} onPress={onAddTimeSlot} activeOpacity={0.85}>
              <Ionicons name="add" size={16} color={colors.white} />
              <Text style={styles.emptyAddButtonText}>Add Time Slot</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => onSaveAvailability?.(slotsByDate)}
          activeOpacity={0.85}
        >
          <Text style={styles.saveButtonText}>Save Availability</Text>
        </TouchableOpacity>
      </View>

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
    paddingTop: spacing.md,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    zIndex: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
  },
  recurrenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  recurrenceButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  recurrenceDropdown: {
    position: 'absolute',
    top: 34,
    right: 0,
    width: 200,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: spacing.xs,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  recurrenceOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  recurrenceOptionText: {
    fontSize: 12,
    color: colors.textDark,
    fontWeight: '600',
  },
  recurrenceOptionTextActive: {
    color: colors.primary,
  },
  recurrenceOptionHint: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  dateChip: {
    width: 34,
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
    marginBottom: 4,
  },
  dateTextActive: {
    color: colors.white,
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
  selectedDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  selectedDateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectedDateText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  copyText: {
    fontSize: 11,
    color: colors.link,
    fontWeight: '600',
  },
  copyTextDisabled: {
    color: colors.textMuted,
  },
  copyPickerCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.inputBackground,
  },
  copyPickerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: spacing.sm,
  },
  copyPickerList: {
    gap: spacing.xs,
  },
  copyPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  checkboxOuter: {
    width: 18,
    height: 18,
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
  copyPickerRowText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textDark,
    flex: 1,
  },
  copyPickerRowNote: {
    fontSize: 10,
    color: colors.textMuted,
  },
  copyPickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  copyPickerCancel: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  copyPickerCancelText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textDark,
  },
  copyPickerApply: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  copyPickerApplyDisabled: {
    opacity: 0.4,
  },
  copyPickerApplyText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  addSlotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  addSlotText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  slotCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  dragHandle: {
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  slotBody: {
    flex: 1,
  },
  slotTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  slotTimeWrap: {
    flex: 1,
  },
  slotLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 3,
  },
  slotModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  slotMode: {
    fontSize: 11,
    color: colors.textMuted,
  },
  slotBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    color: colors.textDark,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.tabInactiveBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  emptyAddButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
});