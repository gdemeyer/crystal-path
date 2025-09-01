import React, { useEffect, useState } from 'react';
import { Task } from '../types/types';
import postTask from '../services/functions-post-task.ts'

export default function TaskEntryBlock() {
  const [task, setTask] = useState<Task>({})
  const [title, setTitle] = useState('')
  const [urgency, setUrgency] = useState('')
  const [impact, setImpact] = useState('')
  const [time, setTime] = useState('')
  const [difficulty, setDifficulty] = useState('')

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

  function onAddClick(e) {
    e.preventDefault()

    if (title === ''
      || urgency === ''
      || impact === ''
      || time === ''
      || difficulty === ''
    ) {
      console.log('invalid input')
      // TODO: add ux
      return;
    }

    postTask(task)
    .then(() => {
      // refresh list from server

      // clear inputs
      setTitle('')
      setUrgency('')
      setImpact('')
      setTime('')
      setDifficulty('')
    })
  }

  return (<div className="task-entry-block">
    <div>
      <input className="task-title-input" value={title} onChange={e => setTitle(e.target.value)}/>
      <button className="task-add-button" onClick={onAddClick}>+</button>
    </div>
    <div>
      <select className="task-select task-urgency-select" value={urgency} onChange={e => setUrgency(e.target.value)}>
        <option value="" disabled>urgency</option>
        <option value="1">eventually</option>
        <option value="2">this month</option>
        <option value="3">this week</option>
        <option value="5">tomorrow</option>
        <option value="8">today</option>
        <option value="13">immediately</option>
      </select>
      <select className="task-select task-impact-select" value={impact} onChange={e => setImpact(e.target.value)}>
        <option value="" disabled>impact</option>
        <option value="1">none</option>
        <option value="2">minor</option>
        <option value="3">moderate</option>
        <option value="5">high</option>
        <option value="8">very high</option>
        <option value="13">extreme</option>
      </select>
      <select className="task-select task-time-select" value={time} onChange={e => setTime(e.target.value)}>
        <option value="" disabled>time</option>
        <option value="1">a few min</option>
        <option value="2">&lt;30 min</option>
        <option value="3">&lt;1 hr</option>
        <option value="5">1-4 hr</option>
        <option value="8">4-8 hr</option>
        <option value="13">&gt;8 hr</option>
      </select>
      <select className="task-select task-difficulty-select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
        <option value="" disabled>difficulty</option>
        <option value="1">trivial</option>
        <option value="2">easy</option>
        <option value="3">average</option>
        <option value="5">hard</option>
        <option value="8">very hard</option>
        <option value="13">impossible</option>
      </select>
    </div>
  </div>);
}
