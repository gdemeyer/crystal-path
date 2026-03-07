import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import TaskEntryBlock from '../../../components/taskEntryBlock'

// Mock the postTask service
jest.mock('../../../services/functions-post-task.ts', () => ({
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
})
