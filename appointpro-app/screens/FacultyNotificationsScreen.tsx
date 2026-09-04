import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import FacultyBottomTabBar, { FacultyTabKey } from '../components/FacultyBottomTabBar';

type NotificationItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  time: string;
  unread: boolean;
};

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    icon: 'notifications-outline',
    title: 'New Appointment',
    description: 'Maria Clara booked an appointment',
    time: '8:00 AM',
    unread: false,
  },
  {
    id: '2',
    icon: 'sync-outline',
    title: 'Reschedule Request',
    description: 'Chloey Lyca Jurcales requested for a reschedule',
    time: '10:20 AM',
    unread: false,
  },
  {
    id: '3',
    icon: 'sync-outline',
    title: 'Walk in Queue Update',
    description: 'New walk-in added, you are now servicing #2',
    time: '7:00 AM',
    unread: false,
  },
  {
    id: '4',
    icon: 'information-circle-outline',
    title: 'System Update',
    description: 'Your schedule for next week has been updated.',
    time: '9:00 AM',
    unread: true,
  },
  {
    id: '5',
    icon: 'notifications-outline',
    title: 'Reminder',
    description: 'You have 3 appointments tommorow.',
    time: '11:20 AM',
    unread: true,
  },
];

type FacultyNotificationsScreenProps = {
  onBack?: () => void;
  onMorePress?: () => void;
  onMarkAllRead?: () => void;
  onSelectNotification?: (item: NotificationItem) => void;
  onTabChange?: (tab: FacultyTabKey) => void;
};

export default function FacultyNotificationsScreen({
  onBack,
  onMorePress,
  onMarkAllRead,
  onSelectNotification,
  onTabChange,
}: FacultyNotificationsScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={onMorePress}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      <View style={styles.markReadRow}>
        <TouchableOpacity onPress={onMarkAllRead}>
          <Text style={styles.markReadText}>Mark as all read</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Today</Text>

      <FlatList
        data={NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.row,
              item.unread && styles.rowUnread,
              index < NOTIFICATIONS.length - 1 && !item.unread && styles.rowBorder,
            ]}
            onPress={() => onSelectNotification?.(item)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={
                item.icon === 'sync-outline'
                  ? 'autorenew'
                  : item.icon === 'information-circle-outline'
                  ? 'information-outline'
                  : 'bell-outline'
              }
              size={20}
              color={colors.textDark}
              style={styles.icon}
            />
            <View style={styles.textWrap}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDesc}>{item.description}</Text>
            </View>
            <Text style={styles.itemTime}>{item.time}</Text>
          </TouchableOpacity>
        )}
      />

      <FacultyBottomTabBar active="notifications" onChange={onTabChange} />
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
  markReadRow: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  markReadText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.link,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowUnread: {
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    marginBottom: spacing.sm,
  },
  icon: {
    marginRight: spacing.md,
    marginTop: 2,
  },
  textWrap: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
  },
  itemDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
});