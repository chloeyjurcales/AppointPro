import React from 'react';
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
import BottomTabBar, { TabKey } from '../components/BottomTabBar';

type ScheduleSlot = {
  id: string;
  date: string;
  time: string;
};

const SCHEDULE: ScheduleSlot[] = [
  { id: '1', date: 'May 13 (Tue)', time: '9:00 AM - 10:00 AM' },
  { id: '2', date: 'May 15 (Thu)', time: '11:00 AM - 2:00 PM' },
  { id: '3', date: 'May 16 (Fri)', time: '9:00 AM - 11:00 AM' },
];

type FacultyProfileScreenProps = {
  onBack?: () => void;
  onMorePress?: () => void;
  onViewFullSchedule?: () => void;
  onContinue?: () => void;
  onTabChange?: (tab: TabKey) => void;
};

export default function FacultyProfileScreen({
  onBack,
  onMorePress,
  onViewFullSchedule,
  onContinue,
  onTabChange,
}: FacultyProfileScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Faculty Profile</Text>
        <TouchableOpacity onPress={onMorePress}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <FontAwesome5 name="user-tie" size={22} color={colors.white} />
          </View>
          <View>
            <Text style={styles.name}>Dr. Juan Dela Cruz</Text>
            <Text style={styles.department}>Computer Studies</Text>
            <Text style={styles.status}>Available</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Consultation Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color={colors.primary} style={styles.infoIcon} />
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Consultation Type</Text>
              <Text style={styles.infoValue}>Face-to-Face · Online · Both</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={colors.primary} style={styles.infoIcon} />
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Office Location</Text>
              <Text style={styles.infoValue}>Room 305, CHMC Main Campus</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} style={styles.infoIcon} />
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>About</Text>
              <Text style={styles.infoValue}>
                Specialized in programming, systems analysis and databases.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Upcoming Schedule</Text>
          <TouchableOpacity onPress={onViewFullSchedule}>
            <Text style={styles.link}>View full schedule</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.scheduleCard}>
          {SCHEDULE.map((slot, index) => (
            <View
              key={slot.id}
              style={[
                styles.scheduleRow,
                index < SCHEDULE.length - 1 && styles.scheduleRowBorder,
              ]}
            >
              <View style={styles.scheduleIconWrap}>
                <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              </View>
              <Text style={styles.scheduleDate}>{slot.date}</Text>
              <Text style={styles.scheduleTime}>{slot.time}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={onContinue} activeOpacity={0.85}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>

      <BottomTabBar active="directory" onChange={onTabChange} />
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textDark,
  },
  department: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
    marginTop: 2,
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
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  link: {
    fontSize: 12,
    color: colors.link,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
  },
  infoIcon: {
    marginRight: spacing.md,
    marginTop: 2,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  scheduleCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  scheduleRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scheduleIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.tabInactiveBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  scheduleDate: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textDark,
  },
  scheduleTime: {
    fontSize: 11,
    color: colors.textMuted,
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