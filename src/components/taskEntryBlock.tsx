import React, { useEffect, useState } from 'react';
import { Task } from '../types/types';
import postTask from '../services/functions-post-task.ts'

interface TaskEntryBlockProps {
  onTaskAdded?: (task: Task) => void;
  token?: string;
}

export default function TaskEntryBlock({ onTaskAdded, token }: TaskEntryBlockProps) {
  const [task, setTask] = useState<Task>()
  const [title, setTitle] = useState('')
  const [urgency, setUrgency] = useState(0)
  const [impact, setImpact] = useState(0)
  const [time, setTime] = useState(0)
  const [difficulty, setDifficulty] = useState(0)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)

  const isTitleEmpty = title === ''
  const isUrgencyEmpty = urgency === 0
  const isImpactEmpty = impact === 0
  const isTimeEmpty = time === 0
  const isDifficultyEmpty = difficulty === 0
  const hasErrors = isTitleEmpty || isUrgencyEmpty || isImpactEmpty || isTimeEmpty || isDifficultyEmpty

  useEffect(() => {
    console.log(title)
    setTask({
      title,
      urgency,
      impact,
      time,
      difficulty
    })
  }, [title, urgency, impact, time, difficulty])

  function submitTask() {
    if (title === ''
      || urgency === 0
      || impact === 0
      || time === 0
      || difficulty === 0
      || task === undefined
    ) {
      console.log('invalid input')
      setAttemptedSubmit(true)
      return;
    }

    postTask(task, token)
    .then((createdTask) => {
      // Call the callback with the created task
      onTaskAdded?.(createdTask)

      // clear inputs
      setTitle('')
      setUrgency(0)
      setImpact(0)
      setTime(0)
      setDifficulty(0)
      setAttemptedSubmit(false)
    })
  }

  function onAddClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    submitTask()
  }

  function onTitleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      submitTask()
    }
  }

  return (
    <div className="task-entry-block">
      <div>
        <input 
          className={`task-title-input ${attemptedSubmit && isTitleEmpty ? 'error' : ''}`}
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          onKeyDown={onTitleKeyDown}
          placeholder="Title"
        />
        <button className="task-add-button" onClick={onAddClick}>+</button>
      </div>
      <div>
        <select 
          className={`task-select task-urgency-select ${attemptedSubmit && hasErrors ? 'error' : ''}`}
          value={urgency} 
          onChange={e => setUrgency(+e.target.value)}
        >
          <option value="0" disabled>urgency</option>
          <option value="1">eventually</option>
          <option value="2">this month</option>
          <option value="3">this week</option>
          <option value="5">tomorrow</option>
          <option value="8">today</option>
          <option value="13">immediately</option>
        </select>
        <select 
          className={`task-select task-impact-select ${attemptedSubmit && hasErrors ? 'error' : ''}`}
          value={impact} 
          onChange={e => setImpact(+e.target.value)}
        >
          <option value="0" disabled>impact</option>
          <option value="1">none</option>
          <option value="2">minor</option>
          <option value="3">moderate</option>
          <option value="5">high</option>
          <option value="8">very high</option>
          <option value="13">extreme</option>
        </select>
        <select 
          className={`task-select task-time-select ${attemptedSubmit && hasErrors ? 'error' : ''}`}
          value={time} 
          onChange={e => setTime(+e.target.value)}
        >
          <option value="0" disabled>time</option>
          <option value="1">a few min</option>
          <option value="2">&lt;30 min</option>
          <option value="3">&lt;1 hr</option>
          <option value="5">1-4 hr</option>
          <option value="8">4-8 hr</option>
          <option value="13">&gt;8 hr</option>
        </select>
        <select 
          className={`task-select task-difficulty-select ${attemptedSubmit && hasErrors ? 'error' : ''}`}
          value={difficulty} 
          onChange={e => setDifficulty(+e.target.value)}
        >
          <option value="0" disabled>difficulty</option>
          <option value="1">trivial</option>
          <option value="2">easy</option>
          <option value="3">average</option>
          <option value="5">hard</option>
          <option value="8">very hard</option>
          <option value="13">impossible</option>
        </select>
      </div>
      {attemptedSubmit && hasErrors && <p className="error-text">Please fill out all required fields</p>}
    </div>
  );
}
