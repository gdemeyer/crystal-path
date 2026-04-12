import { useState, useEffect, useRef } from 'react'
import { Task } from '../types/types.ts'
import { TASK_STATUS } from '../consts-status.ts'
import { updateTaskStatus } from '../services/functions-update-task-status.ts'

interface TaskSummaryCardProps {
  task: Task
  token: string
  onTaskCompleted: (taskId: string) => (() => void)
  onEditTask: (task: Task) => void
}

function getPriorityColor(task: Task): string {
  const score = task.urgency * task.impact
  if (score >= 20) return '#c8954a' // warm amber — high priority
  if (score >= 5)  return '#5b9ca8' // muted teal — medium
  return '#7b8fa8'                  // steel slate — low
}

export default function TaskSummaryCard({ task, token, onTaskCompleted, onEditTask }: TaskSummaryCardProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isMenuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMenuOpen])

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
      <div className="card-menu-wrapper" ref={menuRef}>
        <button
          className="card-menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          title="Task options"
        >
          ⋮
        </button>
        {isMenuOpen && (
          <div className="card-menu-dropdown">
            <button
              className="card-menu-item"
              onClick={() => {
                setIsMenuOpen(false)
                onEditTask(task)
              }}
            >
              Edit
            </button>
          </div>
        )}
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

