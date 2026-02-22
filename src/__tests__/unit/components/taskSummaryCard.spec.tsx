import { render, screen } from '@testing-library/react'
import TaskSummaryCard from '../../../components/taskSummaryCard'

describe('TaskSummaryCard', () => {
  it('renders the title', () => {
    const mockTask = {
      _id: '1',
      title: 'Hello World',
      difficulty: 5,
      impact: 5,
      time: 5,
      urgency: 5,
      status: 'NOT_STARTED'
    }
    const mockOnTaskCompleted = jest.fn(() => jest.fn())
    render(<TaskSummaryCard task={mockTask} token="test-token" onTaskCompleted={mockOnTaskCompleted} />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})
