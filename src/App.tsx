import React, {useEffect, useState} from 'react';
import TaskEntryBlock from './components/taskEntryBlock.tsx';
import './App.css';
import TaskSummaryCard from './components/taskSummaryCard.tsx';
import TaskSummaryCardContainer from './components/taskSummaryCardBlock.tsx';
import CompletedTasksMenu from './components/CompletedTasksMenu.tsx';
import { Task } from './types/types.ts';
import { TASK_STATUS } from './consts-status.ts';
import getFunctionsHealth from './services/functions-health.ts'
import getTasks from './services/functions-get-tasks.ts'
import { useAuth } from './hooks/useAuth.ts';
import LoginPage from './pages/LoginPage.tsx';

function App() {
  const { isAuthenticated, token, logout, isLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([])
  const [lastSuccessfulTasks, setLastSuccessfulTasks] = useState<Task[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || isLoading || !token) return;

    console.log('useEffect')
    getFunctionsHealth().then(res => {
      console.log(res)
    }).catch(err => {
      console.error('Health check failed:', err)
    })

    getTasks(token).then(res => {
      console.log('getTasks response:', res)
      setTasks(res)
      setLastSuccessfulTasks(res)
    }).catch(err => {
      console.error('Failed to fetch tasks:', err)
      setTasks([])
    })
  }, [isAuthenticated, isLoading, token])

  const handleTaskAdded = async () => {
    // Re-fetch tasks to get the updated list with server-side sorting
    if (!token) return;
    
    try {
      const updatedTasks = await getTasks(token);
      setTasks(updatedTasks);
      setLastSuccessfulTasks(updatedTasks);
    } catch (err) {
      console.error('Failed to refresh tasks after add:', err);
    }
  }

  const handleTaskCompleted = (taskId: string) => {
    // Store the current state before optimistically removing
    const currentTasks = tasks
    
    // Optimistically remove task
    setTasks(tasks.filter(t => t._id !== taskId))
    setLastSuccessfulTasks(tasks)
    
    // Return a rollback function that can be called on error
    return () => {
      // Restore tasks to the state before the optimistic update
      setTasks(currentTasks)
      setErrorMessage('Failed to complete task. Please try again.')
    }
  }

  const handleTaskUncompleted = async (task: Task, callback: (success: boolean) => void) => {
    // Re-fetch active tasks to get the updated list with server-side sorting
    if (!token) return;
    
    try {
      const updatedTasks = await getTasks(token);
      setTasks(updatedTasks);
      setLastSuccessfulTasks(updatedTasks);
      callback(true);
    } catch (err) {
      console.error('Failed to refresh tasks after uncomplete:', err);
      callback(false);
    }
  }

  // Show loading state
  if (isLoading) {
    return <div className="App" style={{color: '#cfcfcf'}}>Loading...</div>;
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="App">
      <div className="app-header">
        <h1>Crystal Path</h1>
        <div className="header-right">
          <CompletedTasksMenu token={token || ''} onTaskUncompleted={handleTaskUncompleted} />
          <button onClick={logout} className="logout-button">Logout</button>
        </div>
      </div>
      {errorMessage && (
        <div className="error-banner">
          {errorMessage}
          <button onClick={() => setErrorMessage(null)} className="error-close">✕</button>
        </div>
      )}
      <TaskEntryBlock onTaskAdded={handleTaskAdded} token={token || ''} />
      <TaskSummaryCardContainer>
        {tasks.map((task) => (
          <TaskSummaryCard
            key={task._id}
            task={task}
            token={token || ''}
            onTaskCompleted={handleTaskCompleted}
          />
        ))}
      </TaskSummaryCardContainer>
    </div>
  );
}

export default App;
