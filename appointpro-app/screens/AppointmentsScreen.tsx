import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import BottomTabBar, { TabKey } from '../components/BottomTabBar';

type AppointmentStatus = 'upcoming' | 'completed' | 'canceled';
type FilterKey = 'upcoming' | 'completed' | 'canceled';

type Appointment = {
  id: string;
  status: AppointmentStatus;
  doctorName: string;
  date: string;
  category: string;
  location: string;
  mode: string;
};

const APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    status: 'upcoming',
    doctorName: 'Prof. Maria Santos',
    date: 'May 13, 2026 · 10:00 AM',
    category: 'Academic Advising',
    location: 'Room 305',
    mode: 'Face-to-Face',
  },
  {
    id: '2',
    status: 'completed',
    doctorName: 'Prof. Maria Santos',
    date: 'May 9, 2026 · 10:00 AM',
    category: 'Academic Advising',
    location: 'Room 305',
    mode: 'Face-to-Face',
  },
  {
    id: '3',
    status: 'completed',
    doctorName: 'Prof. Maria Santos',
    date: 'May 3, 2026 · 10:00 AM',
    category: 'Academic Advising',
    location: 'Room 305',
    mode: 'Face-to-Face',
  },
  {
    id: '4',
    status: 'canceled',
    doctorName: 'Prof. Maria Santos',
    date: 'May 1, 2026 · 10:00 AM',
    category: 'Academic Advising',
    location: 'Room 305',
    mode: 'Face-to-Face',
  },
];

const TABS: { key: FilterKey; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'canceled', label: 'Canceled' },
];

type StatusStyle = { label: string; background: string };

const STATUS_STYLES: Record<AppointmentStatus, StatusStyle> = {
  upcoming: { label: 'UPCOMING', background: colors.primary },
  completed: { label: 'COMPLETED', background: colors.success },
  canceled: { label: 'CANCELED', background: colors.danger },
};

function matchesFilter(appointment: Appointment, filter: FilterKey) {
  if (filter === 'upcoming') return appointment.status === 'upcoming';
  if (filter === 'canceled') return appointment.status === 'canceled';
  return appointment.status === 'completed' || appointment.status === 'canceled';
}

function EmptySpaceIllustration() {
  return (
    <View style={styles.illustrationWrap}>
      <MaterialCommunityIcons
        name="calendar-blank-outline"
        size={90}
        color={colors.tabInactiveBg}
      />
      <View style={styles.illustrationClockBadge}>
        <Ionicons name="time-outline" size={30} color={colors.white} />
      </View>
    </View>
  );
}

type AppointmentsScreenProps = {
  onMenuPress?: () => void;
  onSelectAppointment?: (appointment: Appointment) => void;
  onTabChange?: (tab: TabKey) => void;
};

export default function AppointmentsScreen({
  onMenuPress,
  onSelectAppointment,
  onTabChange,
}: AppointmentsScreenProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('upcoming');

  const filtered = APPOINTMENTS.filter((a) => matchesFilter(a, activeFilter));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onMenuPress}>
          <Ionicons name="menu" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <View style={styles.headerSpacer} />
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
        renderItem={({ item }) => {
          const statusStyle = STATUS_STYLES[item.status];
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => onSelectAppointment?.(item)}
              activeOpacity={0.8}
            >
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.background }]}>
                <Text style={styles.statusBadgeText}>{statusStyle.label}</Text>
              </View>
              <View style={styles.cardRow}>
                <View style={styles.avatar}>
                  <FontAwesome5 name="user-tie" size={20} color={colors.white} />
                </View>
                <View style={styles.infoWrap}>
                  <Text style={styles.doctorName}>{item.doctorName}</Text>
                  <Text style={styles.detailText}>{item.date}</Text>
                  <Text style={styles.detailText}>{item.category}</Text>
                  <Text style={styles.detailText}>
                    {item.location} · {item.mode}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No {activeFilter} appointments.</Text>
        }
        ListFooterComponent={
          filtered.length > 0 && filtered.length <= 1 ? <EmptySpaceIllustration /> : null
        }
      />

      <BottomTabBar active="appointments" onChange={onTabChange} />
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
  headerSpacer: {
    width: 24,
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
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: spacing.sm,
  },
  statusBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  infoWrap: {
    flex: 1,
  },
  doctorName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 2,
  },
  detailText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.xl,
  },
  illustrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl * 2,
  },
  illustrationClockBadge: {
    position: 'absolute',
    bottom: -6,
    right: '28%',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#A8493C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
});