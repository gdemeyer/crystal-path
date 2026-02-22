import { useState } from 'react'
import { Task } from '../types/types.ts'
import { TASK_STATUS } from '../consts-status.ts'
import { updateTaskStatus } from '../services/functions-update-task-status.ts'

interface TaskSummaryCardProps {
  task: Task
  token: string
  onTaskCompleted: (taskId: string) => (() => void)
}

function getPriorityColor(task: Task): string {
  const score = task.urgency * task.impact
  if (score >= 20) return '#c8954a' // warm amber — high priority
  if (score >= 5)  return '#5b9ca8' // muted teal — medium
  return '#7b8fa8'                  // steel slate — low
}

export default function TaskSummaryCard({ task, token, onTaskCompleted }: TaskSummaryCardProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleCompleteClick = () => {
    if (!isConfirming) {
      setIsConfirming(true)
      setTimeout(() => setIsConfirming(false), 3000)
      return
    }

    setIsLoading(true)
    const rollback = onTaskCompleted(task._id!)

    updateTaskStatus(task._id!, TASK_STATUS.COMPLETED, token)
      .then(() => {
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Failed to complete task:', err)
        rollback()
        setIsLoading(false)
        setIsConfirming(false)
      })
  }

  const isCompleted = task.status === TASK_STATUS.COMPLETED

  return (
    <div
      className="task-summary-card"
      style={{ borderLeftColor: getPriorityColor(task) }}
    >
      <div className="task-summary-card-content">
        <h4 className="task-summary-card-title">{task.title}</h4>
      </div>
      {!isCompleted && (
        <button
          className={`complete-button ${isConfirming ? 'confirming' : ''} ${isLoading ? 'loading' : ''}`}
          onClick={handleCompleteClick}
          title={isConfirming ? 'Click again to confirm' : 'Mark as complete'}
          disabled={isLoading}
        >
          {isLoading ? '…' : isConfirming ? '✓ Confirm?' : 'Done'}
        </button>
      )}
    </div>
  )
}

