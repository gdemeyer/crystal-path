import React, { useState } from 'react'
import { Task } from '../types/types.ts'
import { getCompletedTasks, updateTaskStatus } from '../services/functions-update-task-status.ts'
import getTasks from '../services/functions-get-tasks.ts'
import { TASK_STATUS } from '../consts-status.ts'

interface CompletedTasksMenuProps {
  token: string
  onTaskUncompleted: (task: Task, callback: (success: boolean) => void) => void
  refreshKey?: number
}

export default function CompletedTasksMenu({ token, onTaskUncompleted, refreshKey }: CompletedTasksMenuProps) {
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

  // Helper to get today's date in ISO format
  const getTodayDate = () => new Date().toISOString().slice(0, 10);

  // Invalidate backlog and completed caches when refreshKey changes
  // (e.g. after a new task is added or a task is completed)
  if (refreshKey !== lastRefreshKey) {
    setLastRefreshKey(refreshKey)
    setBacklogLoaded(false)
    setCompletedLoaded(false)

    // If the backlog section is currently expanded, re-fetch immediately
    if (isBacklogExpanded) {
      setIsLoadingBacklog(true)
      getTasks(token, { view: 'backlog', date: getTodayDate() })
        .then(tasks => {
          setBacklogTasks(tasks)
          setBacklogLoaded(true)
        })
        .catch(err => console.error('Failed to refresh backlog tasks:', err))
        .finally(() => setIsLoadingBacklog(false))
    }

    // If the completed section is currently expanded, re-fetch immediately
    if (isCompletedExpanded) {
      setIsLoadingCompleted(true)
      getCompletedTasks(token)
        .then(tasks => {
          setCompletedTasks(tasks)
          setCompletedLoaded(true)
        })
        .catch(err => console.error('Failed to refresh completed tasks:', err))
        .finally(() => setIsLoadingCompleted(false))
    }
  }

  const handleOpenMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleToggleBacklog = async () => {
    const newExpanded = !isBacklogExpanded
    setIsBacklogExpanded(newExpanded)
    
    // Load backlog data only if expanding and not already loaded
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
    
    // Load completed data only if expanding and not already loaded
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
    // First click: show confirmation
    if (confirmingTaskId !== task._id) {
      setConfirmingTaskId(task._id!)
      setTimeout(() => setConfirmingTaskId(prev => prev === task._id ? null : prev), 3000)
      return
    }

    // Second click: confirmed — proceed with completion
    setConfirmingTaskId(null)
    const originalTasks = backlogTasks
    
    // Optimistically remove from backlog list
    setBacklogTasks(backlogTasks.filter(t => t._id !== task._id))

    // Make API call
    try {
      await updateTaskStatus(task._id!, TASK_STATUS.COMPLETED, token)
      
      // Invalidate completed cache
      setCompletedLoaded(false)

      // If completed section is currently expanded, re-fetch immediately
      if (isCompletedExpanded) {
        setIsLoadingCompleted(true)
        getCompletedTasks(token)
          .then(tasks => {
            setCompletedTasks(tasks)
            setCompletedLoaded(true)
          })
          .catch(err => console.error('Failed to refresh completed tasks:', err))
          .finally(() => setIsLoadingCompleted(false))
      }
    } catch (err) {
      console.error('Failed to complete backlog task:', err)
      // Rollback on error
      setBacklogTasks(originalTasks)
    }
  }

  const handleUncompleteTask = async (task: Task) => {
    const originalTasks = completedTasks
    
    // Optimistically remove from completed list
    setCompletedTasks(completedTasks.filter(t => t._id !== task._id))

    // Make API call
    try {
      await updateTaskStatus(task._id!, TASK_STATUS.NOT_STARTED, token)
      
      // Notify parent to refresh active tasks list
      onTaskUncompleted(task, (success: boolean) => {
        if (!success) {
          // Rollback if parent refresh fails
          setCompletedTasks(originalTasks)
        }
      })
      
      // Invalidate backlog cache so it reloads
      setBacklogLoaded(false)
    } catch (err) {
      console.error('Failed to uncomplete task:', err)
      // Rollback on error
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
        <div className="completed-tasks-modal">
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
                    <div className="loading">Loading backlog...</div>
                  ) : backlogTasks.length === 0 ? (
                    <div className="empty-state">No backlog tasks</div>
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
                            {confirmingTaskId === task._id ? '✓ Confirm?' : 'Complete'}
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
                    <div className="loading">Loading completed tasks...</div>
                  ) : completedTasks.length === 0 ? (
                    <div className="empty-state">No completed tasks yet</div>
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
        </div>
      )}

      <style>{`
        .section {
          margin-bottom: 12px;
        }
        
        .section-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          color: #cfcfcf;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .section-header:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }
        
        .section-title {
          flex: 1;
          text-align: left;
        }
        
        .expand-icon {
          font-size: 12px;
          color: #888;
        }
        
        .section-content {
          margin-top: 8px;
          padding: 0 4px;
        }
      `}</style>
    </>
  )
}
