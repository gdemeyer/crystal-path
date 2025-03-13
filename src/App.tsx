import React from 'react';
import TaskEntryBlock from './components/taskEntryBlock.tsx';
import './App.css';
import TaskSummaryCard from './components/taskSummaryCard.tsx';
import TaskSummaryCardContainer from './components/taskSummaryCardBlock.tsx';

function App() {
  return (
    <div className="App">
      <TaskEntryBlock />
      <TaskSummaryCardContainer>
        <TaskSummaryCard title="Taxes" />
        <TaskSummaryCard title="Sleep" />
        <TaskSummaryCard title="A secret third thing" />
        <TaskSummaryCard title="Profit" />
      </TaskSummaryCardContainer>
    </div>
  );
}

export default App;
