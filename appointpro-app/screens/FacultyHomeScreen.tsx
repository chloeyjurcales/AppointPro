import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import FacultyBottomTabBar, { FacultyTabKey } from '../components/FacultyBottomTabBar';

type ScheduleMode = 'face-to-face' | 'online';

type ScheduleItem = {
  id: string;
  time: string;
  studentName: string;
  category: string;
  mode: ScheduleMode;
};

const SCHEDULE: ScheduleItem[] = [
  { id: '1', time: '10:00 AM', studentName: 'Maria Clara', category: 'Academic Advising', mode: 'face-to-face' },
  { id: '2', time: '11:30 AM', studentName: 'John Doe', category: 'Project Discussion', mode: 'online' },
  { id: '3', time: '2:00 PM', studentName: 'Anna Reyes', category: 'Thesis Consultation', mode: 'face-to-face' },
];

type QuickAction = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  background: string;
  onPress?: () => void;
};

type FacultyHomeScreenProps = {
  facultyFirstName?: string;
  appointmentsCount?: number;
  pendingReschedulesCount?: number;
  walkInQueueCount?: number;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onViewSchedule?: () => void;
  onOpenAppointments?: () => void;
  onOpenAvailability?: () => void;
  onOpenWalkInQueue?: () => void;
  onOpenSlotIQAI?: () => void;
  onTabChange?: (tab: FacultyTabKey) => void;
};

export default function FacultyHomeScreen({
  facultyFirstName = 'Juan',
  appointmentsCount = 8,
  pendingReschedulesCount = 2,
  walkInQueueCount = 6,
  onMenuPress,
  onNotificationsPress,
  onViewSchedule,
  onOpenAppointments,
  onOpenAvailability,
  onOpenWalkInQueue,
  onOpenSlotIQAI,
  onTabChange,
}: FacultyHomeScreenProps) {
  const quickActions: QuickAction[] = [
    { key: 'appointments', label: 'Appointments', icon: 'calendar-outline', background: '#5B7FDE', onPress: onOpenAppointments },
    { key: 'availability', label: 'Availability', icon: 'checkmark-circle-outline', background: '#3FB68A', onPress: onOpenAvailability },
    { key: 'queue', label: 'Queue', icon: 'notifications-outline', background: '#F0C93A', onPress: onOpenWalkInQueue },
    { key: 'slotiq', label: 'SlotIQ AI', icon: 'sparkles-outline', background: '#9B5DE5', onPress: onOpenSlotIQAI },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onMenuPress}>
          <Ionicons name="menu" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.greeting}>Hi, Dr. {facultyFirstName}! 👋</Text>
          <Text style={styles.greetingSub}>Welcome back</Text>
        </View>
        <TouchableOpacity onPress={onNotificationsPress}>
          <Ionicons name="notifications-outline" size={22} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      <View style={styles.headerDivider} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Today's Overview</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.success }]}>{appointmentsCount}</Text>
            <Text style={styles.statLabel}>Appointments</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{pendingReschedulesCount}</Text>
            <Text style={styles.statLabel}>Pending{'\n'}Reschedules</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#3B4A9E' }]}>{walkInQueueCount}</Text>
            <Text style={styles.statLabel}>In{'\n'}Queue</Text>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <TouchableOpacity onPress={onViewSchedule}>
            <Text style={styles.link}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {SCHEDULE.map((item, index) => (
            <View
              key={item.id}
              style={[styles.scheduleRow, index < SCHEDULE.length - 1 && styles.rowBorder]}
            >
              <Text style={styles.scheduleTime}>{item.time}</Text>
              <View style={styles.scheduleTextWrap}>
                <Text style={styles.studentName}>{item.studentName}</Text>
                <Text style={styles.detailText}>{item.category}</Text>
              </View>
              <View
                style={[
                  styles.modeBadge,
                  item.mode === 'online' ? styles.modeBadgeOnline : styles.modeBadgeFaceToFace,
                ]}
              >
                <Text style={styles.modeBadgeText}>
                  {item.mode === 'online' ? 'Online' : 'Face-to-Face'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, styles.quickActionsTitle]}>Quick Actions</Text>

        <View style={styles.quickActionsCard}>
          <View style={styles.quickActionsRow}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.key}
                style={styles.quickAction}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <View style={[styles.quickActionIconWrap, { backgroundColor: action.background }]}>
                  <Ionicons name={action.icon} size={20} color={colors.white} />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <FacultyBottomTabBar active="home" onChange={onTabChange} />
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTextWrap: {
    flex: 1,
    marginLeft: spacing.md,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
  },
  greetingSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  headerDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textDark,
    textAlign: 'center',
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
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  scheduleTime: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textDark,
    width: 68,
  },
  scheduleTextWrap: {
    flex: 1,
  },
  studentName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
  },
  detailText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  modeBadge: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  modeBadgeFaceToFace: {
    backgroundColor: colors.primary,
  },
  modeBadgeOnline: {
    backgroundColor: colors.success,
  },
  modeBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  quickActionsTitle: {
    marginBottom: spacing.sm,
  },
  quickActionsCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickActionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textDark,
    textAlign: 'center',
  },
});