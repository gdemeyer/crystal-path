export const TASK_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  COMPLETED: 'COMPLETED',
} as const

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS]

export const isValidStatus = (status: unknown): status is TaskStatus => {
  if (typeof status !== 'string') return false
  return Object.values(TASK_STATUS).includes(status as TaskStatus)
}
