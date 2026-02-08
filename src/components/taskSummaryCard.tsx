import { useState } from 'react'
import { Task } from '../types/types.ts'
import { TASK_STATUS } from '../consts-status.ts'
import { updateTaskStatus } from '../services/functions-update-task-status.ts'

interface TaskSummaryCardProps {
  task: Task
  token: string
  onTaskCompleted: (taskId: string) => (() => void)
}

export default function TaskSummaryCard({ task, token, onTaskCompleted }: TaskSummaryCardProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleCompleteClick = () => {
    if (!isConfirming) {
      setIsConfirming(true)
      setTimeout(() => setIsConfirming(false), 3000) // Reset after 3 seconds
      return
    }

    // Optimistically remove from list
    setIsLoading(true)

    // Get rollback function from parent
    const rollback = onTaskCompleted(task._id!)

    // User clicked again to confirm
    updateTaskStatus(task._id!, TASK_STATUS.COMPLETED, token)
      .then(() => {
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Failed to complete task:', err)
        // Call rollback to restore the task
        rollback()
        setIsLoading(false)
        setIsConfirming(false)
      })
  }

  const isCompleted = task.status === TASK_STATUS.COMPLETED

  return (
    <div className="task-summary-card" key={task._id}>
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
          {isLoading ? '...' : isConfirming ? '✓ Confirm?' : '○'}
        </button>
      )}
    </div>
  )
}
