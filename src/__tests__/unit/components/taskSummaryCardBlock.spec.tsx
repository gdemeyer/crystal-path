import { render, screen } from '@testing-library/react'
import TaskSummaryCardBlock from '../../../components/taskSummaryCardBlock'

describe('TaskSummaryCardBlock', () => {
  it('renders children correctly', () => {
    render(
      <TaskSummaryCardBlock>
        <div data-testid="child-1">One</div>
        <div data-testid="child-2">Two</div>
      </TaskSummaryCardBlock>
    )

    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
  })
})
