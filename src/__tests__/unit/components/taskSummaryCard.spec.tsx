import { render, screen, fireEvent } from '@testing-library/react'
import TaskSummaryCard from '../../../components/taskSummaryCard'

describe('TaskSummaryCard', () => {
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
  const mockOnEditTask = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the title', () => {
    render(<TaskSummaryCard task={mockTask} token="test-token" onTaskCompleted={mockOnTaskCompleted} onEditTask={mockOnEditTask} />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  describe('Three-dot menu', () => {
    it('renders ⋮ button', () => {
      const { container } = render(
        <TaskSummaryCard task={mockTask} token="test-token" onTaskCompleted={mockOnTaskCompleted} onEditTask={mockOnEditTask} />
      )
      const menuButton = container.querySelector('.card-menu-button')
      expect(menuButton).toBeTruthy()
      expect(menuButton?.textContent).toBe('⋮')
    })

    it('shows dropdown with Edit on click', () => {
      const { container } = render(
        <TaskSummaryCard task={mockTask} token="test-token" onTaskCompleted={mockOnTaskCompleted} onEditTask={mockOnEditTask} />
      )
      const menuButton = container.querySelector('.card-menu-button') as HTMLElement
      fireEvent.click(menuButton)

      const dropdown = container.querySelector('.card-menu-dropdown')
      expect(dropdown).toBeTruthy()
      expect(screen.getByText('Edit')).toBeInTheDocument()
    })

    it('calls onEditTask with task when Edit is clicked', () => {
      const { container } = render(
        <TaskSummaryCard task={mockTask} token="test-token" onTaskCompleted={mockOnTaskCompleted} onEditTask={mockOnEditTask} />
      )
      const menuButton = container.querySelector('.card-menu-button') as HTMLElement
      fireEvent.click(menuButton)

      fireEvent.click(screen.getByText('Edit'))
      expect(mockOnEditTask).toHaveBeenCalledWith(mockTask)
    })

    it('closes dropdown after Edit is clicked', () => {
      const { container } = render(
        <TaskSummaryCard task={mockTask} token="test-token" onTaskCompleted={mockOnTaskCompleted} onEditTask={mockOnEditTask} />
      )
      const menuButton = container.querySelector('.card-menu-button') as HTMLElement
      fireEvent.click(menuButton)

      fireEvent.click(screen.getByText('Edit'))

      const dropdown = container.querySelector('.card-menu-dropdown')
      expect(dropdown).toBeNull()
    })

    it('closes dropdown when clicking outside', () => {
      const { container } = render(
        <TaskSummaryCard task={mockTask} token="test-token" onTaskCompleted={mockOnTaskCompleted} onEditTask={mockOnEditTask} />
      )
      const menuButton = container.querySelector('.card-menu-button') as HTMLElement
      fireEvent.click(menuButton)

      expect(container.querySelector('.card-menu-dropdown')).toBeTruthy()

      // Click outside — use mousedown on document
      fireEvent.mouseDown(document)

      expect(container.querySelector('.card-menu-dropdown')).toBeNull()
    })
  })
})
