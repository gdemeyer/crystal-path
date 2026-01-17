import React, {useEffect, useState} from 'react';
import TaskEntryBlock from './components/taskEntryBlock.tsx';
import './App.css';
import TaskSummaryCard from './components/taskSummaryCard.tsx';
import TaskSummaryCardContainer from './components/taskSummaryCardBlock.tsx';
import CompletedTasksMenu from './components/CompletedTasksMenu.tsx';
import { Task } from './types/types.ts';
import { TASK_STATUS } from './consts-status.ts';
import sortTasks from './utils/algo.ts';
import getFunctionsHealth from './services/functions-health.ts'
import getTasks from './services/functions-get-tasks.ts'
import { useAuth } from './hooks/useAuth.ts';
import LoginPage from './pages/LoginPage.tsx';

function App() {
  const { isAuthenticated, token, logout, isLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([])
  const [sortedTasks, setSortedTasks] = useState<Task[]>([])
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

  useEffect(() => {
    setSortedTasks(sortTasks(tasks))
  }, [tasks])

  const handleTaskAdded = (newTask: Task) => {
    setTasks([...tasks, newTask])
  }

  const handleTaskCompleted = (taskId: string, callback: (success: boolean) => void) => {
    // Optimistically remove task
    setLastSuccessfulTasks(tasks)
    setTasks(tasks.filter(t => t._id !== taskId))
    
    // Callback will be called with success/failure by the component
    setTimeout(() => callback(true), 0) // Simulate optimistic update
  }

  const handleTaskUncompleted = (task: Task, callback: (success: boolean) => void) => {
    // Optimistically add task back to active list with NOT_STARTED status
    const uncompletedTask = { ...task, status: TASK_STATUS.NOT_STARTED, statusChanged: Date.now() }
    setLastSuccessfulTasks(tasks)
    setTasks([...tasks, uncompletedTask])
    
    // Callback will be called with success/failure by the component
    setTimeout(() => callback(true), 0) // Simulate optimistic update
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
        {sortedTasks.map((task) => (
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
