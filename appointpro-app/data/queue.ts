export type QueueEntry = {
  id: string;
  studentName: string;
  // How long this student's appointment is reserved for.
  durationMinutes: number;
  // Epoch ms when this entry became "now serving" (reached the front of
  // the queue). Null until that happens — used to count down their
  // remaining time live instead of just showing a static estimate.
  startedAt: number | null;
};

// Fallback used only for students with no real duration on record.
export const AVERAGE_WAIT_MINUTES_PER_STUDENT = 10;

export const INITIAL_QUEUE: QueueEntry[] = [
  { id: 'q-1', studentName: 'Maria Santos', durationMinutes: 15, startedAt: null },
  { id: 'q-2', studentName: 'Jose Reyes', durationMinutes: 15, startedAt: null },
  { id: 'q-3', studentName: 'Ana Cruz', durationMinutes: 15, startedAt: null },
];

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