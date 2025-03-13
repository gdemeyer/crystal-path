import React from 'react'

export default function TaskSummaryCard({ title }) {
    return (<div className="task-summary-card">
        <h4 className="task-summary-card-title">{title}</h4>
    </div>)
}