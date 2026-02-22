import React, { useState } from 'react';
import { Task } from '../types/types';
import postTask from '../services/functions-post-task.ts'

const FIBONACCI = [1, 2, 3, 5, 8, 13]

const SLIDER_CONFIG = {
  urgency: {
    label: 'Urgency',
    labels: ['Eventually', 'This Month', 'This Week', 'Tomorrow', 'Today', 'Immediately'],
  },
  impact: {
    label: 'Impact',
    labels: ['Minimal', 'Minor', 'Moderate', 'High', 'Very High', 'Extreme'],
  },
  time: {
    label: 'Time Required',
    labels: ['A few min', '< 30 min', '< 1 hr', '1â€“4 hr', '4â€“8 hr', '8+ hr'],
  },
  difficulty: {
    label: 'Difficulty',
    labels: ['Trivial', 'Easy', 'Average', 'Hard', 'Very Hard', 'Impossible'],
  },
}

interface LabeledSliderProps {
  id: string
  label: string
  valueLabel: string
  index: number
  onChange: (index: number) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
}

function LabeledSlider({ id, label, valueLabel, index, onChange, onKeyDown }: LabeledSliderProps) {
  return (
    <div className="slider-field">
      <div className="slider-header">
        <label htmlFor={id} className="slider-label">{label}</label>
        <span className="slider-value-label">{valueLabel}</span>
      </div>
      <input
        type="range"
        id={id}
        min={0}
        max={5}
        step={1}
        value={index}
        onChange={e => onChange(Number(e.target.value))}
        onKeyDown={onKeyDown}
        className="slider-input"
      />
    </div>
  )
}

interface TaskEntryBlockProps {
  onTaskAdded?: () => void | Promise<void>;
  token?: string;
}

export default function TaskEntryBlock({ onTaskAdded, token }: TaskEntryBlockProps) {
  const [title, setTitle] = useState('')
  const [urgencyIdx, setUrgencyIdx] = useState(0)
  const [impactIdx, setImpactIdx] = useState(0)
  const [timeIdx, setTimeIdx] = useState(0)
  const [difficultyIdx, setDifficultyIdx] = useState(0)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isTitleEmpty = title.trim() === ''

  async function submitTask() {
    setError(null)

    if (isSubmitting) return

    if (isTitleEmpty) {
      setAttemptedSubmit(true)
      return
    }

    const taskToSubmit: Task = {
      title: title.trim(),
      urgency: FIBONACCI[urgencyIdx],
      impact: FIBONACCI[impactIdx],
      time: FIBONACCI[timeIdx],
      difficulty: FIBONACCI[difficultyIdx],
    }

    try {
      setIsSubmitting(true)
      await postTask(taskToSubmit, token)
      await onTaskAdded?.()
      setTitle('')
      setUrgencyIdx(0)
      setImpactIdx(0)
      setTimeIdx(0)
      setDifficultyIdx(0)
      setAttemptedSubmit(false)
    } catch (err) {
      console.error('Failed to create task:', err)
      setError(err instanceof Error ? err.message : 'Failed to create task')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    submitTask()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      submitTask()
    }
  }

  return (
    <form className="task-entry-block" onSubmit={handleSubmit} noValidate>
      <div className="task-entry-title-row">
        <input
          className={`task-title-input ${attemptedSubmit && isTitleEmpty ? 'error' : ''}`}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What needs to be done?"
          autoComplete="off"
        />
        <button className="task-add-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? '...' : 'Add'}
        </button>
      </div>
      <div className="task-slider-grid">
        <LabeledSlider
          id="urgency-slider"
          label={SLIDER_CONFIG.urgency.label}
          valueLabel={SLIDER_CONFIG.urgency.labels[urgencyIdx]}
          index={urgencyIdx}
          onChange={setUrgencyIdx}
          onKeyDown={handleKeyDown}
        />
        <LabeledSlider
          id="impact-slider"
          label={SLIDER_CONFIG.impact.label}
          valueLabel={SLIDER_CONFIG.impact.labels[impactIdx]}
          index={impactIdx}
          onChange={setImpactIdx}
          onKeyDown={handleKeyDown}
        />
        <LabeledSlider
          id="time-slider"
          label={SLIDER_CONFIG.time.label}
          valueLabel={SLIDER_CONFIG.time.labels[timeIdx]}
          index={timeIdx}
          onChange={setTimeIdx}
          onKeyDown={handleKeyDown}
        />
        <LabeledSlider
          id="difficulty-slider"
          label={SLIDER_CONFIG.difficulty.label}
          valueLabel={SLIDER_CONFIG.difficulty.labels[difficultyIdx]}
          index={difficultyIdx}
          onChange={setDifficultyIdx}
          onKeyDown={handleKeyDown}
        />
      </div>
      {error && <p className="error-text">{error}</p>}
      {attemptedSubmit && isTitleEmpty && <p className="error-text">Please enter a task title</p>}
    </form>
  )
}
