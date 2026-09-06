export type QueueEntry = {
  id: string;
  studentName: string;
};

export const AVERAGE_WAIT_MINUTES_PER_STUDENT = 10;

export const INITIAL_QUEUE: QueueEntry[] = [
  { id: 'q-1', studentName: 'Maria Santos' },
  { id: 'q-2', studentName: 'Jose Reyes' },
  { id: 'q-3', studentName: 'Ana Cruz' },
];