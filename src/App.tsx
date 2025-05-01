import React from 'react';
import TaskEntryBlock from './components/taskEntryBlock.tsx';
import './App.css';
import TaskSummaryCard from './components/taskSummaryCard.tsx';
import TaskSummaryCardContainer from './components/taskSummaryCardBlock.tsx';
import { Task } from './types/types.ts';
import sortTasks from './utils/algo.ts';

const tasks: Task[] = [
  {
    title: "Play Card Games with Aurora",
    urgency: 13,
    impact: 13,
    time: 5,
    difficulty: 8,
  },
  {
    title: "Sleep",
    urgency: 3,
    impact: 5,
    time: 8,
    difficulty: 1,
  },
  {
    title: "A Secret Third Thing",
    urgency: 13,
    impact: 13,
    time: 1,
    difficulty: 1,
  },
  {
    title: "Profit",
    urgency: 1,
    impact: 1,
    time: 13,
    difficulty: 13,
  },
]

const sortedTasks = sortTasks(tasks)

function App() {
  return (
    <div className="App">
      <TaskEntryBlock />
      <TaskSummaryCardContainer>
        {sortedTasks.map((task) => (<TaskSummaryCard title={task.title} key={task.title} />))}
      </TaskSummaryCardContainer>
    </div>
  );
}

export default App;
