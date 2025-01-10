import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="task-entry-block">
        <div>
          <input className="task-title-input" />
          <button className="task-add-button">+</button>
        </div>
        <div>
          <select className="task-select task-urgency-select">
            <option value="" disabled hidden>urgency</option>
            <option value="1">eventually</option>
            <option value="2">this month</option>
            <option value="3">this week</option>
            <option value="5">tomorrow</option>
            <option value="8">today</option>
            <option value="13">immediately</option>
          </select>
          <select className="task-select task-impact-select">
            <option value="" disabled hidden>impact</option>
            <option value="1">none</option>
            <option value="2">minor</option>
            <option value="3">moderate</option>
            <option value="5">high</option>
            <option value="8">very high</option>
            <option value="13">extreme</option>
          </select>
          <select className="task-select task-time-select">
            <option value="" disabled hidden>time</option>
            <option value="1">a few min</option>
            <option value="2">&lt;30 min</option>
            <option value="3">&lt;1 hr</option>
            <option value="5">1-4 hr</option>
            <option value="8">4-8 hr</option>
            <option value="13">&gt;8 hr</option>
          </select>
          <select className="task-select task-difficulty-select">
            <option value="" disabled hidden>difficulty</option>
            <option value="1">trivial</option>
            <option value="2">easy</option>
            <option value="3">average</option>
            <option value="5">hard</option>
            <option value="8">very hard</option>
            <option value="13">impossible</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default App;
