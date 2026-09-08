import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import FacultyBottomTabBar, { FacultyTabKey } from '../components/FacultyBottomTabBar';

type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled';
type ConsultationMode = 'face-to-face' | 'online';

export type StudentAppointment = {
  id: string;
  studentName: string;
  status: AppointmentStatus;
  date: string;
  time: string;
  category: string;
  room?: string;
  mode: ConsultationMode;
  photoUri?: string;
  isOnline: boolean;
  studentId?: string;
  email?: string;
  department?: string;
  yearLevel?: string;
};

const APPOINTMENTS: StudentAppointment[] = [
  {
    id: '1',
    studentName: 'Maria Clara',
    status: 'upcoming',
    date: 'May 13, 2023',
    time: '10:00 AM',
    category: 'Academic Advising',
    room: 'Room 305',
    mode: 'face-to-face',
    isOnline: true,
    studentId: '2023-00456',
    email: 'mclara@gmail.com',
    department: 'College of Computer Studies',
    yearLevel: '2nd Year',
  },
  {
    id: '2',
    studentName: 'John Doe',
    status: 'upcoming',
    date: 'May 13, 2023',
    time: '10:00 AM',
    category: 'Project Discussion',
    mode: 'online',
    isOnline: true,
    studentId: '2023-00789',
    email: 'johndoe@gmail.com',
    department: 'College of Computer Studies',
    yearLevel: '4th Year',
  },
  {
    id: '3',
    studentName: 'Anna Reyes',
    status: 'upcoming',
    date: 'May 11, 2025',
    time: '2:00 PM',
    category: 'Thesis Consultation',
    room: 'Room 310',
    mode: 'face-to-face',
    isOnline: true,
    studentId: '2023-01011',
    email: 'areyes@gmail.com',
    department: 'College of Computer Studies',
    yearLevel: '4th Year',
  },
  {
    id: '4',
    studentName: 'Mark Santos',
    status: 'upcoming',
    date: 'May 14, 2023',
    time: '9:00 AM',
    category: 'Academic Advising',
    room: 'Room 305',
    mode: 'face-to-face',
    isOnline: true,
    studentId: '2023-01234',
    email: 'msantos@gmail.com',
    department: 'College of Computer Studies',
    yearLevel: '1st Year',
  },
];

const TABS: { key: AppointmentStatus; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

type FacultyDirectoryScreenProps = {
  onSelectAppointment?: (appointment: StudentAppointment) => void;
  onReschedulePress?: (appointment: StudentAppointment) => void;
  onCancelPress?: (appointment: StudentAppointment) => void;
  onTabChange?: (tab: FacultyTabKey) => void;
};

export default function FacultyDirectoryScreen({
  onSelectAppointment,
  onReschedulePress,
  onCancelPress,
  onTabChange,
}: FacultyDirectoryScreenProps) {
  const [activeFilter, setActiveFilter] = useState<AppointmentStatus>('upcoming');

  const filtered = APPOINTMENTS.filter((a) => a.status === activeFilter);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Directory</Text>
      </View>

      <View style={styles.filterRow}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeFilter;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.filterTab}
              onPress={() => setActiveFilter(tab.key)}
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.filterUnderline} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => onSelectAppointment?.(item)}
            activeOpacity={0.8}
          >
            <View style={styles.cardTopRow}>
              <View style={styles.avatarWrap}>
                {item.photoUri ? (
                  <Image source={{ uri: item.photoUri }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Feather name="user" size={20} color={colors.white} />
                  </View>
                )}
                {item.isOnline && <View style={styles.onlineDot} />}
              </View>

              <View style={styles.infoWrap}>
                <Text style={styles.name}>{item.studentName}</Text>
                <Text style={styles.detailText}>
                  {item.date}, {item.time}
                </Text>
                <Text style={styles.detailText}>{item.category}</Text>
                <Text style={styles.detailText}>
                  {item.mode === 'online'
                    ? 'Online'
                    : item.room
                    ? `${item.room} · Face-to-Face`
                    : 'Face-to-Face'}
                </Text>
              </View>
            </View>

            {activeFilter === 'upcoming' && (
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onReschedulePress?.(item)}
                >
                  <Text style={styles.actionButtonText}>Reschedule</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonDanger]}
                  onPress={() => onCancelPress?.(item)}
                >
                  <Text style={styles.actionButtonDangerText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No {activeFilter} appointments.</Text>
        }
      />

      <FacultyBottomTabBar active="directory" onChange={onTabChange} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textDark,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  filterTab: {
    paddingBottom: spacing.sm,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  filterUnderline: {
    marginTop: 6,
    height: 2,
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTopRow: {
    flexDirection: 'row',
  },
  avatarWrap: {
    marginRight: spacing.md,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.white,
  },
  infoWrap: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 2,
  },
  detailText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  actionButtonDanger: {
    borderColor: colors.danger,
  },
  actionButtonDangerText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.danger,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.xl,
  },
});