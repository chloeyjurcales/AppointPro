export type QueueEntry = {
  id: string;
  studentName: string;
  // How long this student's appointment is reserved for.
  durationMinutes: number;
  // Epoch ms when this entry became "now serving" (reached the front of
  // the queue). Null until that happens — used to count down their
  // remaining time live instead of just showing a static estimate.
  startedAt: number | null;
  // The real appointments.id this entry is tied to — used to match a
  // queue row back to "is this me?" for the logged-in student.
  appointmentId: string | null;
};

// Fallback used only for students with no real duration on record.
export const AVERAGE_WAIT_MINUTES_PER_STUDENT = 10;

// Shape of a row from the real `queue_entries` table in Supabase.
export type DbQueueEntry = {
  id: string;
  faculty_id: string;
  appointment_id: string | null;
  student_name: string;
  duration_minutes: number;
  started_at: string | null;
  queue_date: string;
  position: number;
  created_at: string;
};

export function mapDbQueueEntry(row: DbQueueEntry): QueueEntry {
  return {
    id: row.id,
    studentName: row.student_name,
    durationMinutes: row.duration_minutes,
    startedAt: row.started_at ? new Date(row.started_at).getTime() : null,
    appointmentId: row.appointment_id,
  };
}

// Seconds left for whoever is currently being served (queue[0]). Once
// their time is up this returns 0 — it does not go negative or auto-remove
// them; faculty still presses "Done" to actually advance the queue
// (covers both finishing early and running over).
export function getRemainingSeconds(entry: QueueEntry, now: Date): number {
  if (!entry.startedAt) return entry.durationMinutes * 60;
  const elapsedSeconds = Math.floor((now.getTime() - entry.startedAt) / 1000);
  return Math.max(entry.durationMinutes * 60 - elapsedSeconds, 0);
}

// Total estimated wait, in seconds, before the entry at `index` gets
// called: whatever time is left on the person being served now, plus the
// full reserved duration of everyone else ahead in line.
export function getEstimatedWaitSeconds(queue: QueueEntry[], index: number, now: Date): number {
  if (index <= 0 || queue.length === 0) return 0;
  let total = getRemainingSeconds(queue[0], now);
  for (let i = 1; i < index; i++) {
    total += queue[i].durationMinutes * 60;
  }
  return total;
}

export function formatCountdown(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}