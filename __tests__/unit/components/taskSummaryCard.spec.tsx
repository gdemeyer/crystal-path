import { render, screen } from '@testing-library/react'
import TaskSummaryCard from '../../../components/taskSummaryCard'

describe('TaskSummaryCard', () => {
  it('renders the title', () => {
    render(<TaskSummaryCard title="Hello World" />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})
