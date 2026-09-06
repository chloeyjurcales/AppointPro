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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import FacultyBottomTabBar, { FacultyTabKey } from '../components/FacultyBottomTabBar';
import { FacultyWeekDay, FacultySlot, FACULTY_WEEK_DAYS } from '../data/facultySlots';

type FacultyAvailabilityScreenProps = {
  slotsByDate: Record<number, FacultySlot[]>;
  onBack?: () => void;
  onInfoPress?: () => void;
  onAddTimeSlot?: (date: number) => void;
  onToggleSlot?: (date: number, slotId: string) => void;
  onDeleteTimeSlot?: (date: number, slotId: string) => void;
  onSaveAvailability?: () => void;
  onTabChange?: (tab: FacultyTabKey) => void;
};

export default function FacultyAvailabilityScreen({
  slotsByDate,
  onBack,
  onInfoPress,
  onAddTimeSlot,
  onToggleSlot,
  onDeleteTimeSlot,
  onSaveAvailability,
  onTabChange,
}: FacultyAvailabilityScreenProps) {
  const [selectedDate, setSelectedDate] = useState(12);

  const currentSlots = slotsByDate[selectedDate] ?? [];
  const selectedDateInfo = FACULTY_WEEK_DAYS.find((d) => d.date === selectedDate);
  const hasSlots = currentSlots.length > 0;

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
        <Text style={styles.sectionTitle}>1. Select Days</Text>

        <View style={styles.dateRow}>
          {FACULTY_WEEK_DAYS.map((d: FacultyWeekDay) => {
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
          <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
          <Text style={styles.selectedDateText}>{selectedDateInfo?.fullLabel}</Text>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>2. Set Time Slots</Text>
          <TouchableOpacity
            style={styles.addSlotButton}
            onPress={() => onAddTimeSlot?.(selectedDate)}
          >
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
                    <View style={styles.slotLabelRow}>
                      <Text style={styles.slotLabel}>{slot.label}</Text>
                      {slot.recurring && (
                        <View style={styles.recurringPill}>
                          <Ionicons name="repeat" size={10} color={colors.primary} />
                          <Text style={styles.recurringPillText}>Weekly</Text>
                        </View>
                      )}
                    </View>
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
                    onValueChange={() => onToggleSlot?.(selectedDate, slot.id)}
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
                    <TouchableOpacity onPress={() => onDeleteTimeSlot?.(selectedDate, slot.id)}>
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
            <Text style={styles.emptySubtitle}>Add a time slot to get started.</Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={() => onAddTimeSlot?.(selectedDate)}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={16} color={colors.white} />
              <Text style={styles.emptyAddButtonText}>Add Time Slot</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={onSaveAvailability}
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
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
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  selectedDateText: {
    fontSize: 12,
    color: colors.textMuted,
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
  slotLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  slotLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
  },
  recurringPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.tabInactiveBg,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  recurringPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
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