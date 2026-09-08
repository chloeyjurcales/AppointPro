import React, { useState } from 'react';
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

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
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
  onMarkAllRead?: () => void;
  onSelectNotification?: (item: NotificationItem) => void;
  onTabChange?: (tab: FacultyTabKey) => void;
};

export default function FacultyNotificationsScreen({
  onBack,
  onMarkAllRead,
  onSelectNotification,
  onTabChange,
}: FacultyNotificationsScreenProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allSelected = selectedIds.size > 0 && selectedIds.size === notifications.length;

  const enterSelectMode = () => {
    setOptionsMenuOpen(false);
    setSelectMode(true);
    setSelectedIds(new Set());
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notifications.map((n) => n.id)));
    }
  };

  const handleDeleteSelected = () => {
    setNotifications((prev) => prev.filter((n) => !selectedIds.has(n.id)));
    exitSelectMode();
  };

  const handleRowPress = (item: NotificationItem) => {
    if (selectMode) {
      toggleSelected(item.id);
    } else {
      onSelectNotification?.(item);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {selectMode ? (
          <TouchableOpacity onPress={exitSelectMode}>
            <Ionicons name="close" size={24} color={colors.textDark} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onBack}>
            <Ionicons name="arrow-back" size={22} color={colors.textDark} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>
          {selectMode ? `${selectedIds.size} selected` : 'Notifications'}
        </Text>
        {selectMode ? (
          <TouchableOpacity
            onPress={handleDeleteSelected}
            disabled={selectedIds.size === 0}
          >
            <Ionicons
              name="trash-outline"
              size={22}
              color={selectedIds.size === 0 ? colors.textMuted : colors.danger}
            />
          </TouchableOpacity>
        ) : (
          <View>
            <TouchableOpacity onPress={() => setOptionsMenuOpen((prev) => !prev)}>
              <Ionicons name="ellipsis-vertical" size={20} color={colors.textDark} />
            </TouchableOpacity>
            {optionsMenuOpen && (
              <View style={styles.optionsDropdown}>
                <TouchableOpacity style={styles.optionsRow} onPress={enterSelectMode}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={colors.textDark} />
                  <Text style={styles.optionsRowText}>Select</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.sectionHeaderRow}>
        {selectMode ? (
          <TouchableOpacity onPress={toggleSelectAll}>
            <Text style={styles.markReadText}>{allSelected ? 'Deselect all' : 'Select all'}</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Today</Text>
            <TouchableOpacity onPress={onMarkAllRead}>
              <Text style={styles.markReadText}>Mark as all read</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => {
          const isSelected = selectedIds.has(item.id);
          return (
            <TouchableOpacity
              style={[
                styles.row,
                item.unread && !selectMode && styles.rowUnread,
                index < notifications.length - 1 &&
                  (!item.unread || selectMode) &&
                  styles.rowBorder,
              ]}
              onPress={() => handleRowPress(item)}
              activeOpacity={0.7}
            >
              {selectMode && (
                <View style={[styles.checkboxOuter, isSelected && styles.checkboxOuterActive]}>
                  {isSelected && <Ionicons name="checkmark" size={12} color={colors.white} />}
                </View>
              )}
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
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>You have no notifications.</Text>
        }
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
  optionsDropdown: {
    position: 'absolute',
    top: 30,
    right: 0,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: spacing.xs,
    minWidth: 140,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optionsRowText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textDark,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
  },
  markReadText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.link,
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
  checkboxOuter: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  checkboxOuterActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
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
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.xl,
  },
});