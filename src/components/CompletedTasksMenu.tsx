import React, { useState } from 'react'
import { Task } from '../types/types.ts'
import { getCompletedTasks, updateTaskStatus } from '../services/functions-update-task-status.ts'
import getTasks from '../services/functions-get-tasks.ts'
import { TASK_STATUS } from '../consts-status.ts'

interface CompletedTasksMenuProps {
  token: string
  onTaskUncompleted: (task: Task, callback: (success: boolean) => void) => void
  refreshKey?: number
  onLogout?: () => void
}

function DrawerSkeleton() {
  return (
    <>
      <div className="skeleton-shimmer skeleton-row" />
      <div className="skeleton-shimmer skeleton-row" />
      <div className="skeleton-shimmer skeleton-row" />
    </>
  )
}

export default function CompletedTasksMenu({ token, onTaskUncompleted, refreshKey, onLogout }: CompletedTasksMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [backlogTasks, setBacklogTasks] = useState<Task[]>([])
  const [completedTasks, setCompletedTasks] = useState<Task[]>([])
  const [isBacklogExpanded, setIsBacklogExpanded] = useState(false)
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false)
  const [isLoadingBacklog, setIsLoadingBacklog] = useState(false)
  const [isLoadingCompleted, setIsLoadingCompleted] = useState(false)
  const [backlogLoaded, setBacklogLoaded] = useState(false)
  const [completedLoaded, setCompletedLoaded] = useState(false)
  const [lastRefreshKey, setLastRefreshKey] = useState(refreshKey)
  const [confirmingTaskId, setConfirmingTaskId] = useState<string | null>(null)

  const getTodayDate = () => new Date().toISOString().slice(0, 10)

  if (refreshKey !== lastRefreshKey) {
    setLastRefreshKey(refreshKey)
    setBacklogLoaded(false)
    setCompletedLoaded(false)

    if (isBacklogExpanded) {
      setIsLoadingBacklog(true)
      getTasks(token, { view: 'backlog', date: getTodayDate() })
        .then(tasks => { setBacklogTasks(tasks); setBacklogLoaded(true) })
        .catch(err => console.error('Failed to refresh backlog tasks:', err))
        .finally(() => setIsLoadingBacklog(false))
    }

    if (isCompletedExpanded) {
      setIsLoadingCompleted(true)
      getCompletedTasks(token)
        .then(tasks => { setCompletedTasks(tasks); setCompletedLoaded(true) })
        .catch(err => console.error('Failed to refresh completed tasks:', err))
        .finally(() => setIsLoadingCompleted(false))
    }
  }

  const handleOpenMenu = () => setIsOpen(!isOpen)

  const handleCloseOnBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setIsOpen(false)
  }

  const handleToggleBacklog = async () => {
    const newExpanded = !isBacklogExpanded
    setIsBacklogExpanded(newExpanded)

    if (newExpanded && !backlogLoaded) {
      setIsLoadingBacklog(true)
      try {
        const tasks = await getTasks(token, { view: 'backlog', date: getTodayDate() })
        setBacklogTasks(tasks)
        setBacklogLoaded(true)
      } catch (err) {
        console.error('Failed to fetch backlog tasks:', err)
      } finally {
        setIsLoadingBacklog(false)
      }
    }
  }

  const handleToggleCompleted = async () => {
    const newExpanded = !isCompletedExpanded
    setIsCompletedExpanded(newExpanded)

    if (newExpanded && !completedLoaded) {
      setIsLoadingCompleted(true)
      try {
        const tasks = await getCompletedTasks(token)
        setCompletedTasks(tasks)
        setCompletedLoaded(true)
      } catch (err) {
        console.error('Failed to fetch completed tasks:', err)
      } finally {
        setIsLoadingCompleted(false)
      }
    }
  }

  const handleCompleteBacklogTask = async (task: Task) => {
    if (confirmingTaskId !== task._id) {
      setConfirmingTaskId(task._id!)
      setTimeout(() => setConfirmingTaskId(prev => prev === task._id ? null : prev), 3000)
      return
    }

    setConfirmingTaskId(null)
    const originalTasks = backlogTasks
    setBacklogTasks(backlogTasks.filter(t => t._id !== task._id))

    try {
      await updateTaskStatus(task._id!, TASK_STATUS.COMPLETED, token)
      setCompletedLoaded(false)

      if (isCompletedExpanded) {
        setIsLoadingCompleted(true)
        getCompletedTasks(token)
          .then(tasks => { setCompletedTasks(tasks); setCompletedLoaded(true) })
          .catch(err => console.error('Failed to refresh completed tasks:', err))
          .finally(() => setIsLoadingCompleted(false))
      }
    } catch (err) {
      console.error('Failed to complete backlog task:', err)
      setBacklogTasks(originalTasks)
    }
  }

  const handleUncompleteTask = async (task: Task) => {
    const originalTasks = completedTasks
    setCompletedTasks(completedTasks.filter(t => t._id !== task._id))

    try {
      await updateTaskStatus(task._id!, TASK_STATUS.NOT_STARTED, token)
      onTaskUncompleted(task, (success: boolean) => {
        if (!success) setCompletedTasks(originalTasks)
      })
      setBacklogLoaded(false)
    } catch (err) {
      console.error('Failed to uncomplete task:', err)
      setCompletedTasks(originalTasks)
    }
  }

  return (
    <>
      <button
        className="hamburger-button"
        onClick={handleOpenMenu}
        title="View backlog and completed tasks"
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {isOpen && (
        <div className="completed-tasks-modal" onClick={handleCloseOnBackdrop}>
          <div className="completed-tasks-content">
            <div className="completed-tasks-header">
              <h2>Tasks</h2>
              <button
                className="close-button"
                onClick={handleOpenMenu}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className="drawer-sections">
              {/* Backlog Section */}
              <div className="section">
                <button
                  className="section-header"
                  onClick={handleToggleBacklog}
                  aria-expanded={isBacklogExpanded}
                >
                  <span className="section-title">Backlog</span>
                  <span className="expand-icon">{isBacklogExpanded ? '▼' : '▶'}</span>
                </button>

                {isBacklogExpanded && (
                  <div className="section-content">
                    {isLoadingBacklog ? (
                      <DrawerSkeleton />
                    ) : backlogTasks.length === 0 ? (
                      <div className="drawer-empty-state">No backlog tasks</div>
                    ) : (
                      <div className="completed-tasks-list">
                        {backlogTasks.map((task) => (
                          <div key={task._id} className="completed-task-item">
                            <div className="completed-task-content">
                              <h4>{task.title}</h4>
                            </div>
                            <button
                              className={`undo-button ${confirmingTaskId === task._id ? 'confirming' : ''}`}
                              onClick={() => handleCompleteBacklogTask(task)}
                              title={confirmingTaskId === task._id ? 'Click again to confirm' : 'Mark as complete'}
                            >
                              {confirmingTaskId === task._id ? '✓ Confirm?' : 'Done'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Completed Section */}
              <div className="section">
                <button
                  className="section-header"
                  onClick={handleToggleCompleted}
                  aria-expanded={isCompletedExpanded}
                >
                  <span className="section-title">Completed</span>
                  <span className="expand-icon">{isCompletedExpanded ? '▼' : '▶'}</span>
                </button>

                {isCompletedExpanded && (
                  <div className="section-content">
                    {isLoadingCompleted ? (
                      <DrawerSkeleton />
                    ) : completedTasks.length === 0 ? (
                      <div className="drawer-empty-state">No completed tasks yet</div>
                    ) : (
                      <div className="completed-tasks-list">
                        {completedTasks.map((task) => (
                          <div key={task._id} className="completed-task-item">
                            <div className="completed-task-content">
                              <h4>{task.title}</h4>
                              <div className="task-metadata">
                                Completed:{' '}
                                {task.statusChanged
                                  ? new Date(task.statusChanged).toLocaleDateString()
                                  : 'Unknown'}
                              </div>
                            </div>
                            <button
                              className="undo-button"
                              onClick={() => handleUncompleteTask(task)}
                              title="Undo completion"
                            >
                              Undo
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {onLogout && (
              <div className="drawer-footer">
                <button className="logout-button" onClick={onLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
