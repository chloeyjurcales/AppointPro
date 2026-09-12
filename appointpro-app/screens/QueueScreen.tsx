import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import BottomTabBar, { TabKey } from '../components/BottomTabBar';
import FacultyBottomTabBar, { FacultyTabKey } from '../components/FacultyBottomTabBar';
import {
  QueueEntry,
  AVERAGE_WAIT_MINUTES_PER_STUDENT,
  getRemainingSeconds,
  getEstimatedWaitSeconds,
  formatCountdown,
} from '../data/queue';

type QueueScreenProps = {
  queue: QueueEntry[];
  // Only meaningful for the student role — which entry (if any) is theirs.
  currentQueueId: string | null;
  // Whether the student currently has an upcoming appointment. Reschedule
  // and Cancel are only offered when this is true.
  hasAppointment?: boolean;
  role?: 'student' | 'faculty';
  doctorName?: string;
  doctorDepartment?: string;
  // Drives every live countdown on this screen — pass the same ticking
  // clock the rest of the app uses so numbers move in real time.
  now?: Date;
  onBack?: () => void;
  onReschedule?: () => void;
  onCancelAppointment?: () => void;
  // Faculty-only: marks the student at the front of the line as done
  // (whether they finished early or on time) and calls the next student.
  onCompleteCurrent?: () => void;
  onTabChange?: (tab: TabKey) => void;
  onFacultyTabChange?: (tab: FacultyTabKey) => void;
};

export default function QueueScreen({
  queue,
  currentQueueId,
  hasAppointment = false,
  role = 'student',
  doctorName = 'Dr. Juan Dela Cruz',
  doctorDepartment,
  now = new Date(),
  onBack,
  onReschedule,
  onCancelAppointment,
  onCompleteCurrent,
  onTabChange,
  onFacultyTabChange,
}: QueueScreenProps) {
  const isFaculty = role === 'faculty';
  const position = currentQueueId
    ? queue.findIndex((q) => q.id === currentQueueId) + 1
    : null;
  const isNowServing = position === 1;
  // Seconds remaining in your own session (if you're #1) or seconds until
  // it becomes your turn (if you're further back) — both tick down live.
  const myCountdownSeconds =
    position && position > 0
      ? isNowServing
        ? getRemainingSeconds(queue[0], now)
        : getEstimatedWaitSeconds(queue, position - 1, now)
      : null;

  const nowServing = queue[0] ?? null;
  const nowServingCountdownSeconds = nowServing ? getRemainingSeconds(nowServing, now) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Queue</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.bannerCard}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.bannerText}>
            {isFaculty
              ? "This is today's queue for scheduled appointments. Press Done as soon as a consultation wraps up — even early — to call the next student."
              : `This is your position in ${doctorName}'s queue for today. You can reschedule or cancel your appointment anytime before it's your turn.`}
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

        {!isFaculty && hasAppointment && (
          <View style={styles.instructorCard}>
            <View style={styles.instructorIconWrap}>
              <Ionicons name="person-circle-outline" size={28} color={colors.primary} />
            </View>
            <View style={styles.instructorTextWrap}>
              <Text style={styles.instructorLabel}>Appointed With</Text>
              <Text style={styles.instructorName}>{doctorName}</Text>
              {!!doctorDepartment && (
                <Text style={styles.instructorDept}>{doctorDepartment}</Text>
              )}
            </View>
          </View>
        )}

        {isFaculty ? (
          <View style={styles.nowServingCard}>
            <Text style={styles.nowServingLabel}>Now Serving</Text>
            {nowServing ? (
              <>
                <Text style={styles.nowServingName}>{nowServing.studentName}</Text>
                <Text style={styles.nowServingCountdown}>
                  {formatCountdown(nowServingCountdownSeconds)} remaining
                </Text>
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={onCompleteCurrent}
                  activeOpacity={0.85}
                >
                  <Ionicons name="checkmark-circle-outline" size={16} color={colors.white} />
                  <Text style={styles.doneButtonText}>Done — Call Next</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.nowServingEmpty}>No one is waiting right now.</Text>
            )}
          </View>
        ) : hasAppointment ? (
          <>
            {position && (
              <View style={styles.yourQueueCard}>
                <Text style={styles.yourQueueLabel}>Your Queue Number</Text>
                <Text style={styles.yourQueueNumber}>#{position}</Text>
                <Text style={styles.yourQueueWait}>
                  {isNowServing
                    ? `Your appointment is now — ${formatCountdown(myCountdownSeconds ?? 0)} remaining`
                    : `Estimated wait: ${formatCountdown(myCountdownSeconds ?? 0)}`}
                </Text>
              </View>
            )}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionButtonOutline}
                onPress={onReschedule}
                activeOpacity={0.85}
              >
                <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                <Text style={styles.actionButtonOutlineText}>Reschedule</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButtonDanger}
                onPress={onCancelAppointment}
                activeOpacity={0.85}
              >
                <Ionicons name="close-circle-outline" size={16} color={colors.white} />
                <Text style={styles.actionButtonDangerText}>Cancel Appointment</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.emptyApptCard}>
            <Ionicons name="calendar-outline" size={22} color={colors.textMuted} />
            <Text style={styles.emptyApptText}>
              You don't have an upcoming appointment queued right now.
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Current Queue</Text>
        <View style={styles.queueList}>
          {queue.length === 0 ? (
            <Text style={styles.emptyText}>No one is in the queue right now.</Text>
          ) : (
            queue.map((entry, index) => {
              const isYou = !isFaculty && entry.id === currentQueueId;
              const isEntryNowServing = index === 0;
              const rowSeconds = isEntryNowServing
                ? getRemainingSeconds(entry, now)
                : getEstimatedWaitSeconds(queue, index, now);
              return (
                <View
                  key={entry.id}
                  style={[
                    styles.queueRow,
                    index < queue.length - 1 && styles.queueRowBorder,
                    (isYou || (isFaculty && isEntryNowServing)) && styles.queueRowYou,
                  ]}
                >
                  <Text style={styles.queuePosition}>#{index + 1}</Text>
                  <Text style={styles.queueName}>
                    {isYou ? 'You' : entry.studentName}
                    {isFaculty && isEntryNowServing ? '  ·  Now Serving' : ''}
                  </Text>
                  <Text style={styles.queueRowTime}>{formatCountdown(rowSeconds)}</Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {isFaculty ? (
        <FacultyBottomTabBar active="home" onChange={onFacultyTabChange} />
      ) : (
        <BottomTabBar active="directory" onChange={onTabChange} />
      )}
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
  instructorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  instructorIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.tabInactiveBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructorTextWrap: {
    flex: 1,
  },
  instructorLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 2,
  },
  instructorName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
  },
  instructorDept: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  yourQueueCard: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
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
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  nowServingCard: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  nowServingLabel: {
    fontSize: 12,
    color: '#E9C7CE',
    marginBottom: 4,
  },
  nowServingName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  nowServingCountdown: {
    fontSize: 13,
    color: colors.white,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  nowServingEmpty: {
    fontSize: 13,
    color: colors.white,
    paddingVertical: spacing.sm,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.success,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  doneButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionButtonOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
  },
  actionButtonOutlineText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  actionButtonDanger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.danger,
    borderRadius: 10,
    paddingVertical: 12,
  },
  actionButtonDangerText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyApptCard: {
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  emptyApptText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
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
    backgroundColor: colors.tabInactiveBg,
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
    flex: 1,
    fontSize: 13,
    color: colors.textDark,
    fontWeight: '600',
  },
  queueRowTime: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  emptyText: {
    fontSize: 12,
    color: colors.textMuted,
    paddingVertical: spacing.lg,
    textAlign: 'center',
  },
});