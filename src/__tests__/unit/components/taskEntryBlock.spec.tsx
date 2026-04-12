import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import TaskEntryBlock from '../../../components/taskEntryBlock'

// Mock the postTask service
jest.mock('../../../services/functions-post-task.ts', () => ({
  __esModule: true,
  default: jest.fn()
}))

// Mock the editTask service
jest.mock('../../../services/functions-edit-task.ts', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('TaskEntryBlock component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders title input, sliders, and add button', () => {
    const { container } = render(<TaskEntryBlock />)
    const titleInput = container.querySelector('.task-title-input') as HTMLInputElement
    const urgencySlider = container.querySelector('#urgency-slider') as HTMLInputElement
    const impactSlider = container.querySelector('#impact-slider') as HTMLInputElement
    const timeSlider = container.querySelector('#time-slider') as HTMLInputElement
    const difficultySlider = container.querySelector('#difficulty-slider') as HTMLInputElement
    const addButton = container.querySelector('.task-add-button') as HTMLButtonElement

    expect(titleInput).toBeTruthy()
    expect(urgencySlider).toBeTruthy()
    expect(impactSlider).toBeTruthy()
    expect(timeSlider).toBeTruthy()
    expect(difficultySlider).toBeTruthy()
    expect(addButton).toBeTruthy()
  })

  it('does not submit when title is empty', () => {
    const { container } = render(<TaskEntryBlock />)
    const titleInput = container.querySelector('.task-title-input') as HTMLInputElement
    const addButton = container.querySelector('.task-add-button') as HTMLButtonElement

    fireEvent.click(addButton)

    expect((titleInput as HTMLInputElement).value).toBe('')
  })

  it('calls onTaskAdded callback when task is submitted successfully', async () => {
    const mockPostTask = require('../../../services/functions-post-task.ts').default
    const mockCallback = jest.fn()
    const createdTask = { title: 'Test', difficulty: 1, impact: 1, time: 1, urgency: 1 }
    mockPostTask.mockResolvedValueOnce(createdTask)

    const { container } = render(<TaskEntryBlock onTaskAdded={mockCallback} />)

    const titleInput = container.querySelector('.task-title-input') as HTMLInputElement
    const addButton = container.querySelector('.task-add-button') as HTMLButtonElement

    fireEvent.change(titleInput, { target: { value: 'Test' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalled()
    })
  })

  it('clears form after successful submission', async () => {
    const mockPostTask = require('../../../services/functions-post-task.ts').default
    mockPostTask.mockResolvedValueOnce({ title: 'Test', difficulty: 1, impact: 1, time: 1, urgency: 1 })

    const { container } = render(<TaskEntryBlock />)

    const titleInput = container.querySelector('.task-title-input') as HTMLInputElement
    const urgencySlider = container.querySelector('#urgency-slider') as HTMLInputElement
    const impactSlider = container.querySelector('#impact-slider') as HTMLInputElement
    const timeSlider = container.querySelector('#time-slider') as HTMLInputElement
    const difficultySlider = container.querySelector('#difficulty-slider') as HTMLInputElement
    const addButton = container.querySelector('.task-add-button') as HTMLButtonElement

    fireEvent.change(titleInput, { target: { value: 'Test' } })
    fireEvent.change(urgencySlider, { target: { value: '3' } })
    fireEvent.change(impactSlider, { target: { value: '3' } })
    fireEvent.change(timeSlider, { target: { value: '3' } })
    fireEvent.change(difficultySlider, { target: { value: '3' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(titleInput.value).toBe('')
      expect(urgencySlider.value).toBe('0')
      expect(impactSlider.value).toBe('0')
      expect(timeSlider.value).toBe('0')
      expect(difficultySlider.value).toBe('0')
    })
  })

  it('submits on Enter key press in title input', async () => {
    const mockPostTask = require('../../../services/functions-post-task.ts').default
    const mockCallback = jest.fn()
    mockPostTask.mockResolvedValueOnce({ title: 'Test', difficulty: 1, impact: 1, time: 1, urgency: 1 })

    const { container } = render(<TaskEntryBlock onTaskAdded={mockCallback} />)

    const titleInput = container.querySelector('.task-title-input') as HTMLInputElement

    fireEvent.change(titleInput, { target: { value: 'Test' } })
    fireEvent.keyDown(titleInput, { key: 'Enter' })

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalled()
    })
  })

  describe('Repeat on Completion', () => {
    it('renders advanced accordion with "Advanced" header', () => {
      const { container } = render(<TaskEntryBlock />)
      const accordion = container.querySelector('.advanced-accordion')
      const header = container.querySelector('.accordion-header')

      expect(accordion).toBeTruthy()
      expect(header?.textContent).toContain('Advanced')
    })

    it('shows checkbox when accordion is opened', () => {
      const { container } = render(<TaskEntryBlock />)
      const header = container.querySelector('.accordion-header') as HTMLElement
      
      fireEvent.click(header)

      const checkbox = container.querySelector('.repeat-on-complete-checkbox') as HTMLInputElement
      expect(checkbox).toBeTruthy()
      expect(checkbox.type).toBe('checkbox')
    })

    it('submits with repeatOnComplete: true when checkbox is checked', async () => {
      const mockPostTask = require('../../../services/functions-post-task.ts').default
      mockPostTask.mockResolvedValueOnce({ title: 'Test', difficulty: 1, impact: 1, time: 1, urgency: 1, repeatOnComplete: true })

      const { container } = render(<TaskEntryBlock />)
      const titleInput = container.querySelector('.task-title-input') as HTMLInputElement
      const header = container.querySelector('.accordion-header') as HTMLElement
      
      fireEvent.click(header)

      const checkbox = container.querySelector('.repeat-on-complete-checkbox') as HTMLInputElement
      const addButton = container.querySelector('.task-add-button') as HTMLButtonElement

      fireEvent.change(titleInput, { target: { value: 'Repeating Task' } })
      fireEvent.click(checkbox)
      fireEvent.click(addButton)

      await waitFor(() => {
        expect(mockPostTask).toHaveBeenCalled()
        const callArgs = mockPostTask.mock.calls[0][0]
        expect(callArgs.repeatOnComplete).toBe(true)
      })
    })

    it('submits without repeatOnComplete field when checkbox is unchecked', async () => {
      const mockPostTask = require('../../../services/functions-post-task.ts').default
      mockPostTask.mockResolvedValueOnce({ title: 'Test', difficulty: 1, impact: 1, time: 1, urgency: 1 })

      const { container } = render(<TaskEntryBlock />)
      const titleInput = container.querySelector('.task-title-input') as HTMLInputElement
      const addButton = container.querySelector('.task-add-button') as HTMLButtonElement

      fireEvent.change(titleInput, { target: { value: 'Non-Repeating Task' } })
      fireEvent.click(addButton)

      await waitFor(() => {
        expect(mockPostTask).toHaveBeenCalled()
        const callArgs = mockPostTask.mock.calls[0][0]
        expect(callArgs.repeatOnComplete).toBeUndefined()
      })
    })

    it('resets checkbox after successful submission', async () => {
      const mockPostTask = require('../../../services/functions-post-task.ts').default
      mockPostTask.mockResolvedValueOnce({ title: 'Test', difficulty: 1, impact: 1, time: 1, urgency: 1, repeatOnComplete: true })

      const { container } = render(<TaskEntryBlock />)
      const titleInput = container.querySelector('.task-title-input') as HTMLInputElement
      const header = container.querySelector('.accordion-header') as HTMLElement
      
      fireEvent.click(header)

      const checkbox = container.querySelector('.repeat-on-complete-checkbox') as HTMLInputElement
      const addButton = container.querySelector('.task-add-button') as HTMLButtonElement

      fireEvent.change(titleInput, { target: { value: 'Repeating Task' } })
      fireEvent.click(checkbox)
      fireEvent.click(addButton)

      await waitFor(() => {
        expect(checkbox.checked).toBe(false)
      })
    })

    it('toggles accordion open and closed', () => {
      const { container } = render(<TaskEntryBlock />)
      const header = container.querySelector('.accordion-header') as HTMLElement
      const content = container.querySelector('.accordion-content') as HTMLElement
      
      // Initially closed - content should be display: none
      expect(content.style.display).toBe('none')

      // Open accordion
      fireEvent.click(header)
      expect(content.style.display).toBe('block')
      const checkbox = container.querySelector('.repeat-on-complete-checkbox') as HTMLInputElement
      expect(checkbox).toBeTruthy()

      // Close accordion
      fireEvent.click(header)
      expect(content.style.display).toBe('none')
    })
  })

  describe('Edit mode', () => {
    const editingTask = {
      _id: 'task-123',
      title: 'Existing Task',
      difficulty: 5,  // Fibonacci index 3
      impact: 8,      // Fibonacci index 4
      time: 3,        // Fibonacci index 2
      urgency: 13,    // Fibonacci index 5
      repeatOnComplete: true,
    }

    it('pre-populates form with task values when editingTask is provided', () => {
      const { container } = render(<TaskEntryBlock editingTask={editingTask} token="test-token" />)
      const titleInput = container.querySelector('.task-title-input') as HTMLInputElement
      const urgencySlider = container.querySelector('#urgency-slider') as HTMLInputElement
      const impactSlider = container.querySelector('#impact-slider') as HTMLInputElement
      const timeSlider = container.querySelector('#time-slider') as HTMLInputElement
      const difficultySlider = container.querySelector('#difficulty-slider') as HTMLInputElement

      expect(titleInput.value).toBe('Existing Task')
      // Fibonacci reverse-mapping: [1,2,3,5,8,13] → urgency 13 = index 5
      expect(urgencySlider.value).toBe('5')
      // impact 8 = index 4
      expect(impactSlider.value).toBe('4')
      // time 3 = index 2
      expect(timeSlider.value).toBe('2')
      // difficulty 5 = index 3
      expect(difficultySlider.value).toBe('3')
    })

    it('auto-opens Advanced accordion and checks repeatOnComplete when editing a repeating task', () => {
      const { container } = render(<TaskEntryBlock editingTask={editingTask} token="test-token" />)
      const content = container.querySelector('.accordion-content') as HTMLElement
      const checkbox = container.querySelector('.repeat-on-complete-checkbox') as HTMLInputElement

      expect(content.style.display).toBe('block')
      expect(checkbox.checked).toBe(true)
    })

    it('shows "Save" button instead of "Add"', () => {
      const { container } = render(<TaskEntryBlock editingTask={editingTask} token="test-token" />)
      const button = container.querySelector('.task-add-button') as HTMLButtonElement

      expect(button.textContent).toBe('Save')
    })

    it('calls editTask (not postTask) on submit', async () => {
      const mockEditTask = require('../../../services/functions-edit-task.ts').default
      const mockPostTask = require('../../../services/functions-post-task.ts').default
      mockEditTask.mockResolvedValueOnce({ ...editingTask, title: 'Existing Task' })
      const mockOnEditComplete = jest.fn()

      const { container } = render(
        <TaskEntryBlock editingTask={editingTask} token="test-token" onEditComplete={mockOnEditComplete} />
      )
      const button = container.querySelector('.task-add-button') as HTMLButtonElement

      fireEvent.click(button)

      await waitFor(() => {
        expect(mockEditTask).toHaveBeenCalledWith(
          'task-123',
          expect.objectContaining({
            title: 'Existing Task',
            urgency: 13,
            impact: 8,
            time: 3,
            difficulty: 5,
            repeatOnComplete: true,
          }),
          'test-token'
        )
        expect(mockPostTask).not.toHaveBeenCalled()
      })
    })

    it('calls onEditComplete after successful edit', async () => {
      const mockEditTask = require('../../../services/functions-edit-task.ts').default
      mockEditTask.mockResolvedValueOnce(editingTask)
      const mockOnEditComplete = jest.fn()

      const { container } = render(
        <TaskEntryBlock editingTask={editingTask} token="test-token" onEditComplete={mockOnEditComplete} />
      )
      const button = container.querySelector('.task-add-button') as HTMLButtonElement

      fireEvent.click(button)

      await waitFor(() => {
        expect(mockOnEditComplete).toHaveBeenCalled()
      })
    })

    it('resets form after successful edit', async () => {
      const mockEditTask = require('../../../services/functions-edit-task.ts').default
      mockEditTask.mockResolvedValueOnce(editingTask)

      const { container } = render(
        <TaskEntryBlock editingTask={editingTask} token="test-token" onEditComplete={jest.fn()} />
      )
      const titleInput = container.querySelector('.task-title-input') as HTMLInputElement
      const urgencySlider = container.querySelector('#urgency-slider') as HTMLInputElement
      const button = container.querySelector('.task-add-button') as HTMLButtonElement

      fireEvent.click(button)

      await waitFor(() => {
        expect(titleInput.value).toBe('')
        expect(urgencySlider.value).toBe('0')
      })
    })

    it('shows Cancel button in edit mode that calls onEditCancelled', () => {
      const mockOnEditCancelled = jest.fn()
      const { container } = render(
        <TaskEntryBlock editingTask={editingTask} token="test-token" onEditCancelled={mockOnEditCancelled} />
      )
      const cancelButton = container.querySelector('.task-cancel-button') as HTMLButtonElement

      expect(cancelButton).toBeTruthy()
      expect(cancelButton.textContent).toBe('Cancel')

      fireEvent.click(cancelButton)
      expect(mockOnEditCancelled).toHaveBeenCalled()
    })

    it('does not show Cancel button when not in edit mode', () => {
      const { container } = render(<TaskEntryBlock />)
      const cancelButton = container.querySelector('.task-cancel-button')
      expect(cancelButton).toBeNull()
    })

    it('re-populates form when a different editingTask is provided', () => {
      const task1 = { ...editingTask, _id: 'task-1', title: 'First Task', urgency: 1 }
      const task2 = { ...editingTask, _id: 'task-2', title: 'Second Task', urgency: 8 }

      const { container, rerender } = render(
        <TaskEntryBlock editingTask={task1} token="test-token" />
      )

      const titleInput = container.querySelector('.task-title-input') as HTMLInputElement
      const urgencySlider = container.querySelector('#urgency-slider') as HTMLInputElement

      expect(titleInput.value).toBe('First Task')
      expect(urgencySlider.value).toBe('0') // urgency 1 = index 0

      rerender(<TaskEntryBlock editingTask={task2} token="test-token" />)

      expect(titleInput.value).toBe('Second Task')
      expect(urgencySlider.value).toBe('4') // urgency 8 = index 4
    })
  })
})
