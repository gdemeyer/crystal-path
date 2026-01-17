import React, { useState } from 'react'
import { Task } from '../types/types.ts'
import { getCompletedTasks, updateTaskStatus } from '../services/functions-update-task-status.ts'
import { TASK_STATUS } from '../consts-status.ts'

interface CompletedTasksMenuProps {
  token: string
  onTaskUncompleted: (task: Task, callback: (success: boolean) => void) => void
}

export default function CompletedTasksMenu({ token, onTaskUncompleted }: CompletedTasksMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [completedTasks, setCompletedTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleOpenMenu = async () => {
    if (!isOpen) {
      setIsLoading(true)
      try {
        const tasks = await getCompletedTasks(token)
        setCompletedTasks(tasks)
      } catch (err) {
        console.error('Failed to fetch completed tasks:', err)
      } finally {
        setIsLoading(false)
      }
    }
    setIsOpen(!isOpen)
  }

  const handleUncompleteTask = async (task: Task) => {
    const originalTasks = completedTasks
    
    // Optimistically remove from completed list
    setCompletedTasks(completedTasks.filter(t => t._id !== task._id))

    // Notify parent to add it to main list optimistically
    onTaskUncompleted(task, (success: boolean) => {
      if (!success) {
        // Rollback if parent fails
        console.log('here we are')
        setCompletedTasks(originalTasks)
      }
    })

    // Make API call in background without blocking UI
    try {
      await updateTaskStatus(task._id!, TASK_STATUS.NOT_STARTED, token)
    } catch (err) {
      console.error('Failed to uncomplete task:', err)
      // Rollback on error
      console.log('poop')
      setCompletedTasks(originalTasks)
    }
  }

  return (
    <>
      <button
        className="hamburger-button"
        onClick={handleOpenMenu}
        title="View completed tasks"
        aria-label="Toggle completed tasks menu"
      >
        ☰
      </button>

      {isOpen && (
        <div className="completed-tasks-modal">
          <div className="completed-tasks-content">
            <div className="completed-tasks-header">
              <h2>Completed Tasks</h2>
              <button
                className="close-button"
                onClick={handleOpenMenu}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {isLoading ? (
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
        </div>
      )}
    </>
  )
}
