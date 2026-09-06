import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import BottomTabBar, { TabKey } from '../components/BottomTabBar';
import { QueueEntry, AVERAGE_WAIT_MINUTES_PER_STUDENT } from '../data/queue';

type WalkInQueueScreenProps = {
  queue: QueueEntry[];
  currentQueueId: string | null;
  doctorName?: string;
  onBack?: () => void;
  onJoin?: () => void;
  onLeave?: () => void;
  onTabChange?: (tab: TabKey) => void;
};

export default function WalkInQueueScreen({
  queue,
  currentQueueId,
  doctorName = 'Dr. Juan Dela Cruz',
  onBack,
  onJoin,
  onLeave,
  onTabChange,
}: WalkInQueueScreenProps) {
  const position = currentQueueId
    ? queue.findIndex((q) => q.id === currentQueueId) + 1
    : null;
  const estimatedWait = position ? (position - 1) * AVERAGE_WAIT_MINUTES_PER_STUDENT : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Walk-in Queue</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.bannerCard}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.bannerText}>
            {doctorName} is fully booked today for face-to-face consultation. Join the
            walk-in queue to be seen if a slot opens up or after scheduled appointments.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{queue.length}</Text>
            <Text style={styles.statLabel}>Waiting</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{AVERAGE_WAIT_MINUTES_PER_STUDENT}</Text>
            <Text style={styles.statLabel}>Avg. min/student</Text>
          </View>
        </View>

        {currentQueueId && position ? (
          <View style={styles.yourQueueCard}>
            <Text style={styles.yourQueueLabel}>Your Queue Number</Text>
            <Text style={styles.yourQueueNumber}>#{position}</Text>
            <Text style={styles.yourQueueWait}>
              Estimated wait: {estimatedWait} min{estimatedWait === 1 ? '' : 's'}
            </Text>
            <TouchableOpacity style={styles.leaveButton} onPress={onLeave} activeOpacity={0.85}>
              <Text style={styles.leaveButtonText}>Leave Queue</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.joinButton} onPress={onJoin} activeOpacity={0.85}>
            <Feather name="user-plus" size={16} color={colors.white} />
            <Text style={styles.joinButtonText}>Join Walk-in Queue</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Current Queue</Text>
        <View style={styles.queueList}>
          {queue.length === 0 ? (
            <Text style={styles.emptyText}>No one is in the queue right now.</Text>
          ) : (
            queue.map((entry, index) => {
              const isYou = entry.id === currentQueueId;
              return (
                <View
                  key={entry.id}
                  style={[
                    styles.queueRow,
                    index < queue.length - 1 && styles.queueRowBorder,
                    isYou && styles.queueRowYou,
                  ]}
                >
                  <Text style={styles.queuePosition}>#{index + 1}</Text>
                  <Text style={styles.queueName}>{isYou ? 'You' : entry.studentName}</Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

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
  headerSpacer: {
    width: 22,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.infoBg,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  bannerText: {
    flex: 1,
    fontSize: 12,
    color: colors.infoText,
    lineHeight: 17,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  yourQueueCard: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  yourQueueLabel: {
    fontSize: 12,
    color: '#E9C7CE',
    marginBottom: 4,
  },
  yourQueueNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  yourQueueWait: {
    fontSize: 12,
    color: colors.white,
    marginBottom: spacing.md,
  },
  leaveButton: {
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
  },
  leaveButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 48,
    marginBottom: spacing.lg,
  },
  joinButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: spacing.sm,
  },
  queueList: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  queueRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  queueRowYou: {
    backgroundColor: colors.infoBg,
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  queuePosition: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    width: 30,
  },
  queueName: {
    fontSize: 13,
    color: colors.textDark,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 12,
    color: colors.textMuted,
    paddingVertical: spacing.lg,
    textAlign: 'center',
  },
});