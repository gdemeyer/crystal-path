import React, {useEffect, useState} from 'react';
import TaskEntryBlock from './components/taskEntryBlock.tsx';
import './App.css';
import TaskSummaryCard from './components/taskSummaryCard.tsx';
import TaskSummaryCardContainer from './components/taskSummaryCardBlock.tsx';
import { Task } from './types/types.ts';
import sortTasks from './utils/algo.ts';
import getFunctionsHealth from './services/functions-health.ts'
import getTasks from './services/functions-get-tasks.ts'

function App() {
  const [functionHealth, setFunctionHealth] = useState(null)
  const [tasks, setTasks] = useState([] as Task[])
  const [sortedTasks, setSortedTasks] = useState([] as Task[])

  useEffect(() => {
    console.log('useEffect')
    getFunctionsHealth().then(res => {
      console.log(res)
      setFunctionHealth(res.body)
    })

    getTasks().then(res => {
      console.log(res)
      setTasks(res)
    })
  }, [])

  useEffect(() => {
    setSortedTasks(sortTasks(tasks))
  }, [tasks])

  return (
    <div className="App">
      <TaskEntryBlock />
      <TaskSummaryCardContainer>
        {sortedTasks.map((task) => (<TaskSummaryCard title={task.title} />))}
      </TaskSummaryCardContainer>
    </div>
  );
}

export default App;
