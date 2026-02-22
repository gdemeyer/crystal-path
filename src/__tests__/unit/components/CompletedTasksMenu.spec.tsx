import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CompletedTasksMenu from '../../../components/CompletedTasksMenu'
import * as updateTaskStatus from '../../../services/functions-update-task-status'
import getTasks from '../../../services/functions-get-tasks'

// Mock the services
jest.mock('../../../services/functions-update-task-status')
jest.mock('../../../services/functions-get-tasks')

describe('CompletedTasksMenu component', () => {
  const mockToken = 'test-token'
  const mockOnTaskUncompleted = jest.fn()

  const mockBacklogTasks = [
    { _id: '1', title: 'Backlog Task 1', difficulty: 5, impact: 10, time: 3, urgency: 8, status: 'NOT_STARTED' },
    { _id: '2', title: 'Backlog Task 2', difficulty: 3, impact: 8, time: 2, urgency: 6, status: 'NOT_STARTED' }
  ]

  const mockCompletedTasks = [
    { _id: '3', title: 'Completed Task 1', difficulty: 8, impact: 15, time: 5, urgency: 12, status: 'COMPLETED', statusChanged: Date.now() - 86400000 },
    { _id: '4', title: 'Completed Task 2', difficulty: 5, impact: 10, time: 3, urgency: 8, status: 'COMPLETED', statusChanged: Date.now() }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getTasks as jest.Mock).mockResolvedValue([])
    ;(updateTaskStatus.getCompletedTasks as jest.Mock).mockResolvedValue([])
    ;(updateTaskStatus.updateTaskStatus as jest.Mock).mockResolvedValue({})
  })

  it('renders hamburger button', () => {
    render(<CompletedTasksMenu token={mockToken} onTaskUncompleted={mockOnTaskUncompleted} />)
    
    const hamburgerButton = screen.getByRole('button', { name: /toggle menu/i })
    expect(hamburgerButton).toBeInTheDocument()
    expect(hamburgerButton.textContent).toBe('☰')
  })

  it('opens menu when hamburger button clicked', () => {
    render(<CompletedTasksMenu token={mockToken} onTaskUncompleted={mockOnTaskUncompleted} />)
    
    const hamburgerButton = screen.getByRole('button', { name: /toggle menu/i })
    fireEvent.click(hamburgerButton)

    expect(screen.getByText('Tasks')).toBeInTheDocument()
    expect(screen.getByText('Backlog')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('closes menu when close button clicked', () => {
    render(<CompletedTasksMenu token={mockToken} onTaskUncompleted={mockOnTaskUncompleted} />)
    
    const hamburgerButton = screen.getByRole('button', { name: /toggle menu/i })
    fireEvent.click(hamburgerButton)
    
    const closeButton = screen.getByRole('button', { name: /close menu/i })
    fireEvent.click(closeButton)

    expect(screen.queryByText('Tasks')).not.toBeInTheDocument()
  })

  it('renders two collapsible sections: Backlog and Completed', () => {
    render(<CompletedTasksMenu token={mockToken} onTaskUncompleted={mockOnTaskUncompleted} />)
    
    const hamburgerButton = screen.getByRole('button', { name: /toggle menu/i })
    fireEvent.click(hamburgerButton)

    // Check both section headers are present
    const backlogHeader = screen.getByRole('button', { name: /backlog/i })
    const completedHeader = screen.getByRole('button', { name: /completed/i })
    
    expect(backlogHeader).toBeInTheDocument()
    expect(completedHeader).toBeInTheDocument()
    
    // Both should be collapsed initially (▶ icon)
    expect(backlogHeader.textContent).toContain('▶')
    expect(completedHeader.textContent).toContain('▶')
  })

  it('loads and displays backlog tasks when Backlog section expanded', async () => {
    ;(getTasks as jest.Mock).mockResolvedValueOnce(mockBacklogTasks)
    
    render(<CompletedTasksMenu token={mockToken} onTaskUncompleted={mockOnTaskUncompleted} />)
    
    const hamburgerButton = screen.getByRole('button', { name: /toggle menu/i })
    fireEvent.click(hamburgerButton)

    const backlogHeader = screen.getByRole('button', { name: /backlog/i })
    fireEvent.click(backlogHeader)

    // Should call getTasks with view=backlog
    await waitFor(() => {
      expect(getTasks).toHaveBeenCalledWith(mockToken, expect.objectContaining({
        view: 'backlog',
        date: expect.any(String)
      }))
    })

    // Should display backlog tasks
    await waitFor(() => {
      expect(screen.getByText('Backlog Task 1')).toBeInTheDocument()
      expect(screen.getByText('Backlog Task 2')).toBeInTheDocument()
    })

  })

  it('loads and displays completed tasks when Completed section expanded', async () => {
    ;(updateTaskStatus.getCompletedTasks as jest.Mock).mockResolvedValueOnce(mockCompletedTasks)
    
    render(<CompletedTasksMenu token={mockToken} onTaskUncompleted={mockOnTaskUncompleted} />)
    
    const hamburgerButton = screen.getByRole('button', { name: /toggle menu/i })
    fireEvent.click(hamburgerButton)

    const completedHeader = screen.getByRole('button', { name: /completed/i })
    fireEvent.click(completedHeader)

    // Should call getCompletedTasks
    await waitFor(() => {
      expect(updateTaskStatus.getCompletedTasks).toHaveBeenCalledWith(mockToken)
    })

    // Should display completed tasks
    await waitFor(() => {
      expect(screen.getByText('Completed Task 1')).toBeInTheDocument()
      expect(screen.getByText('Completed Task 2')).toBeInTheDocument()
    })
  })

  it('caches backlog tasks after first load', async () => {
    ;(getTasks as jest.Mock).mockResolvedValue(mockBacklogTasks)
    
    render(<CompletedTasksMenu token={mockToken} onTaskUncompleted={mockOnTaskUncompleted} />)
    
    const hamburgerButton = screen.getByRole('button', { name: /toggle menu/i })
    fireEvent.click(hamburgerButton)

    const backlogHeader = screen.getByRole('button', { name: /backlog/i })
    
    // Expand
    fireEvent.click(backlogHeader)
    await waitFor(() => expect(getTasks).toHaveBeenCalledTimes(1))

    // Collapse
    fireEvent.click(backlogHeader)
    
    // Expand again
    fireEvent.click(backlogHeader)
    
    // Should not call getTasks again (cached)
    expect(getTasks).toHaveBeenCalledTimes(1)
  })

  it('displays loading state when fetching backlog tasks', async () => {
    let resolveGetTasks: any
    ;(getTasks as jest.Mock).mockImplementation(() => new Promise(resolve => {
      resolveGetTasks = resolve
    }))
    
    const { container } = render(<CompletedTasksMenu token={mockToken} onTaskUncompleted={mockOnTaskUncompleted} />)
    
    const hamburgerButton = screen.getByRole('button', { name: /toggle menu/i })
    fireEvent.click(hamburgerButton)

    const backlogHeader = screen.getByRole('button', { name: /backlog/i })
    fireEvent.click(backlogHeader)

    // Should show skeleton loading rows
    await waitFor(() => {
      const skeletonRows = container.querySelectorAll('.skeleton-row')
      expect(skeletonRows.length).toBeGreaterThan(0)
    })

    resolveGetTasks(mockBacklogTasks)

    // Skeleton should disappear and tasks should appear
    await waitFor(() => {
      expect(screen.getByText('Backlog Task 1')).toBeInTheDocument()
    })
  })

  it('displays "Complete" button for backlog tasks', async () => {
    ;(getTasks as jest.Mock).mockResolvedValueOnce(mockBacklogTasks)
    
    render(<CompletedTasksMenu token={mockToken} onTaskUncompleted={mockOnTaskUncompleted} />)
    
    const hamburgerButton = screen.getByRole('button', { name: /toggle menu/i })
    fireEvent.click(hamburgerButton)

    const backlogHeader = screen.getByRole('button', { name: /backlog/i })
    fireEvent.click(backlogHeader)

    await waitFor(() => {
      expect(screen.getByText('Backlog Task 1')).toBeInTheDocument()
    })

    const completeButtons = screen.getAllByTitle('Mark as complete')
    expect(completeButtons).toHaveLength(2)
  })

  it('completes backlog task when Complete button clicked', async () => {
    ;(getTasks as jest.Mock).mockResolvedValueOnce(mockBacklogTasks)
    ;(updateTaskStatus.updateTaskStatus as jest.Mock).mockResolvedValueOnce({})
    
    render(<CompletedTasksMenu token={mockToken} onTaskUncompleted={mockOnTaskUncompleted} />)
    
    const hamburgerButton = screen.getByRole('button', { name: /toggle menu/i })
    fireEvent.click(hamburgerButton)

    const backlogHeader = screen.getByRole('button', { name: /backlog/i })
    fireEvent.click(backlogHeader)

    await waitFor(() => {
      expect(screen.getByText('Backlog Task 1')).toBeInTheDocument()
    })

    const completeButtons = screen.getAllByTitle('Mark as complete')
    fireEvent.click(completeButtons[0])

    // First click shows confirmation prompt
    await waitFor(() => {
      expect(screen.getByTitle('Click again to confirm')).toBeInTheDocument()
    })

    // Second click confirms completion
    const confirmButton = screen.getByTitle('Click again to confirm')
    fireEvent.click(confirmButton)

    // Should call updateTaskStatus with COMPLETED status
    await waitFor(() => {
      expect(updateTaskStatus.updateTaskStatus).toHaveBeenCalledWith('1', 'COMPLETED', mockToken)
    })

    // Task should be optimistically removed from list
    await waitFor(() => {
      expect(screen.queryByText('Backlog Task 1')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Backlog Task 2')).toBeInTheDocument()
  })

  it('displays "Undo" button for completed tasks', async () => {
    ;(updateTaskStatus.getCompletedTasks as jest.Mock).mockResolvedValueOnce(mockCompletedTasks)
    
    render(<CompletedTasksMenu token={mockToken} onTaskUncompleted={mockOnTaskUncompleted} />)
    
    const hamburgerButton = screen.getByRole('button', { name: /toggle menu/i })
    fireEvent.click(hamburgerButton)

    const completedHeader = screen.getByRole('button', { name: /completed/i })
    fireEvent.click(completedHeader)

    await waitFor(() => {
      expect(screen.getByText('Completed Task 1')).toBeInTheDocument()
    })

    const undoButtons = screen.getAllByTitle('Undo completion')
    expect(undoButtons).toHaveLength(2)
  })

  it('uncompletes task when Undo button clicked and notifies parent', async () => {
    ;(updateTaskStatus.getCompletedTasks as jest.Mock).mockResolvedValueOnce(mockCompletedTasks)
    ;(updateTaskStatus.updateTaskStatus as jest.Mock).mockResolvedValueOnce({})
    
    render(<CompletedTasksMenu token={mockToken} onTaskUncompleted={mockOnTaskUncompleted} />)
    
    const hamburgerButton = screen.getByRole('button', { name: /toggle menu/i })
    fireEvent.click(hamburgerButton)

    const completedHeader = screen.getByRole('button', { name: /completed/i })
    fireEvent.click(completedHeader)

    await waitFor(() => {
      expect(screen.getByText('Completed Task 1')).toBeInTheDocument()
    })

    const undoButtons = screen.getAllByTitle('Undo completion')
    fireEvent.click(undoButtons[0])

    // Should call updateTaskStatus with NOT_STARTED status
    await waitFor(() => {
      expect(updateTaskStatus.updateTaskStatus).toHaveBeenCalledWith('3', 'NOT_STARTED', mockToken)
    })

    // Should notify parent component
    await waitFor(() => {
      expect(mockOnTaskUncompleted).toHaveBeenCalledWith(
        expect.objectContaining({ _id: '3', title: 'Completed Task 1' }),
        expect.any(Function)
      )
    })
  })

  it('displays empty state when no backlog tasks', async () => {
    ;(getTasks as jest.Mock).mockResolvedValueOnce([])
    
    render(<CompletedTasksMenu token={mockToken} onTaskUncompleted={mockOnTaskUncompleted} />)
    
    const hamburgerButton = screen.getByRole('button', { name: /toggle menu/i })
    fireEvent.click(hamburgerButton)

    const backlogHeader = screen.getByRole('button', { name: /backlog/i })
    fireEvent.click(backlogHeader)

    await waitFor(() => {
      expect(screen.getByText('No backlog tasks')).toBeInTheDocument()
    })
  })

  it('displays empty state when no completed tasks', async () => {
    ;(updateTaskStatus.getCompletedTasks as jest.Mock).mockResolvedValueOnce([])
    
    render(<CompletedTasksMenu token={mockToken} onTaskUncompleted={mockOnTaskUncompleted} />)
    
    const hamburgerButton = screen.getByRole('button', { name: /toggle menu/i })
    fireEvent.click(hamburgerButton)

    const completedHeader = screen.getByRole('button', { name: /completed/i })
    fireEvent.click(completedHeader)

    await waitFor(() => {
      expect(screen.getByText('No completed tasks yet')).toBeInTheDocument()
    })
  })

  it('handles error when fetching backlog tasks fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    ;(getTasks as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
    
    render(<CompletedTasksMenu token={mockToken} onTaskUncompleted={mockOnTaskUncompleted} />)
    
    const hamburgerButton = screen.getByRole('button', { name: /toggle menu/i })
    fireEvent.click(hamburgerButton)

    const backlogHeader = screen.getByRole('button', { name: /backlog/i })
    fireEvent.click(backlogHeader)

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch backlog tasks:',
        expect.any(Error)
      )
    })

    consoleErrorSpy.mockRestore()
  })
})
