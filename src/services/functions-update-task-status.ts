import { TaskStatus } from '../consts-status.ts'
import { Task } from '../types/types.ts'

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
  token: string
): Promise<Task> {
  const response = await fetch(`${process.env.REACT_APP_FUNCTIONS_BASE_URL}update-task-status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      taskId,
      status,
    }),
  })

  console.log(response)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || 'Failed to update task status')
  }

  return await response.json()
}

export async function getCompletedTasks(token: string): Promise<Task[]> {
  const response = await fetch(`${process.env.REACT_APP_FUNCTIONS_BASE_URL}get-completed-tasks`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    console.error('Failed to get completed tasks:', response.statusText)
    return []
  }

  return response.json()
}
