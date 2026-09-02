import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import BottomTabBar, { TabKey } from '../components/BottomTabBar';

type NotificationItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  time: string;
};

const notifications: NotificationItem[] = [
  {
    id: '1',
    icon: 'person-circle-outline',
    title: "Today's Notification",
    description: 'You have an appointment today.',
    time: '8:00 AM',
  },
  {
    id: '2',
    icon: 'sync-outline',
    title: 'Queue Update',
    description: "You're next in line.",
    time: '9:30 AM',
  },
  {
    id: '3',
    icon: 'megaphone-outline',
    title: 'Faculty Announcement',
    description: 'New schedule for this week.',
    time: '7:30 AM',
  },
];

type HomeScreenProps = {
  userName?: string;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onViewAppointments?: () => void;
  onViewNotifications?: () => void;
  onViewQueue?: () => void;
  onBookAppointment?: () => void;
  onTabChange?: (tab: TabKey) => void;
};

export default function HomeScreen({
  userName = 'NovaGPNustrative',
  onMenuPress,
  onNotificationsPress,
  onViewAppointments,
  onViewNotifications,
  onViewQueue,
  onBookAppointment,
  onTabChange,
}: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onMenuPress}>
          <Ionicons name="menu" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.greeting}>Hi, {userName} 👋</Text>
          <Text style={styles.greetingSub}>Good morning!</Text>
        </View>
        <TouchableOpacity onPress={onNotificationsPress} style={styles.bellWrap}>
          <Ionicons name="notifications-outline" size={22} color={colors.textDark} />
          <View style={styles.bellDot} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Upcoming Appointment</Text>
          <TouchableOpacity onPress={onViewAppointments}>
            <Text style={styles.link}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.appointmentCard}>
          <View style={styles.appointmentRow}>
            <View style={styles.calendarIconWrap}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.appointmentTextWrap}>
              <Text style={styles.appointmentDate}>May 15, 2026 · 10:00 AM</Text>
              <Text style={styles.appointmentDoctor}>Dr. Juan Dela Cruz</Text>
              <Text style={styles.appointmentDept}>Computer Studies</Text>
            </View>
          </View>
          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeText}>Face-to-Face</Text>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Today's Notifications</Text>
          <TouchableOpacity onPress={onViewNotifications}>
            <Text style={styles.link}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.notificationsCard}>
          {notifications.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.notificationRow,
                index < notifications.length - 1 && styles.notificationRowBorder,
              ]}
            >
              <View style={styles.notificationIconWrap}>
                <Ionicons name={item.icon} size={18} color={colors.primary} />
              </View>
              <View style={styles.notificationTextWrap}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationDesc}>{item.description}</Text>
              </View>
              <Text style={styles.notificationTime}>{item.time}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.queueCard}>
            <Text style={styles.smallCardTitle}>Walk-in Queue</Text>
            <View style={styles.queueStatsRow}>
              <View>
                <Text style={styles.queueLabel}>Waiting</Text>
                <Text style={styles.queueValue}>12</Text>
              </View>
              <View>
                <Text style={styles.queueLabel}>Estimated</Text>
                <Text style={styles.queueValue}>25 min</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onViewQueue}>
              <Text style={styles.link}>View Queue</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.bookCard}
            onPress={onBookAppointment}
            activeOpacity={0.85}
          >
            <Text style={styles.smallCardTitle}>Quick Book</Text>
            <View style={styles.bookIconWrap}>
              <MaterialCommunityIcons name="calendar-plus" size={26} color={colors.primary} />
            </View>
            <Text style={styles.bookCardAction}>Book Appointment</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomTabBar active="home" onChange={onTabChange} />
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
  bellWrap: {
    padding: 2,
  },
  bellDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F5A623',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
  },
  link: {
    fontSize: 12,
    color: colors.link,
    fontWeight: '600',
  },
  appointmentCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
  },
  appointmentRow: {
    flexDirection: 'row',
  },
  calendarIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.tabInactiveBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  appointmentTextWrap: {
    flex: 1,
  },
  appointmentDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  appointmentDoctor: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
  },
  appointmentDept: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  modeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: spacing.sm,
  },
  modeBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  notificationsCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  notificationRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  notificationIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.tabInactiveBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  notificationTextWrap: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
  },
  notificationDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  notificationTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  queueCard: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    padding: spacing.md,
  },
  smallCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: spacing.sm,
  },
  queueStatsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  queueLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  queueValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
    marginTop: 1,
  },
  bookCard: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  bookIconWrap: {
    marginVertical: spacing.sm,
  },
  bookCardAction: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
});