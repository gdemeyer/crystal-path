import React, { useState } from 'react';
import { Task } from '../types/types';
import postTask from '../services/functions-post-task.ts'

interface TaskEntryBlockProps {
  onTaskAdded?: () => void | Promise<void>;
  token?: string;
}

export default function TaskEntryBlock({ onTaskAdded, token }: TaskEntryBlockProps) {
  const [title, setTitle] = useState('')
  const [urgency, setUrgency] = useState(0)
  const [impact, setImpact] = useState(0)
  const [time, setTime] = useState(0)
  const [difficulty, setDifficulty] = useState(0)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isTitleEmpty = title === ''
  const isUrgencyEmpty = urgency === 0
  const isImpactEmpty = impact === 0
  const isTimeEmpty = time === 0
  const isDifficultyEmpty = difficulty === 0
  const hasErrors = isTitleEmpty || isUrgencyEmpty || isImpactEmpty || isTimeEmpty || isDifficultyEmpty

  async function submitTask() {
    setError(null);
    
    if (isSubmitting) return;

    if (title === ''
      || urgency === 0
      || impact === 0
      || time === 0
      || difficulty === 0
    ) {
      console.log('invalid input')
      setAttemptedSubmit(true)
      return;
    }

    // Build task object inline from current state
    const taskToSubmit: Task = {
      title,
      urgency,
      impact,
      time,
      difficulty
    };

    try {
      setIsSubmitting(true);
      await postTask(taskToSubmit, token);
      
      // Call the callback to refresh the task list
      await onTaskAdded?.();

      // clear inputs
      setTitle('')
      setUrgency(0)
      setImpact(0)
      setTime(0)
      setDifficulty(0)
      setAttemptedSubmit(false)
    } catch (err) {
      console.error('Failed to create task:', err);
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
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
        <button className="task-add-button" onClick={onAddClick} disabled={isSubmitting}>
          {isSubmitting ? '...' : '+'}
        </button>
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
      {error && <p className="error-text">{error}</p>}
      {attemptedSubmit && hasErrors && <p className="error-text">Please fill out all required fields</p>}
    </div>
  );
}
