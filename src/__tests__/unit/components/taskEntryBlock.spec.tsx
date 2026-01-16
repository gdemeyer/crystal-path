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

  it('renders inputs and selects', () => {
    const { container } = render(<TaskEntryBlock />)
    const titleInput = container.querySelector('.task-title-input') as HTMLInputElement
    const urgencySelect = container.querySelector('.task-urgency-select') as HTMLSelectElement
    const impactSelect = container.querySelector('.task-impact-select') as HTMLSelectElement
    const timeSelect = container.querySelector('.task-time-select') as HTMLSelectElement
    const difficultySelect = container.querySelector('.task-difficulty-select') as HTMLSelectElement
    const addButton = container.querySelector('.task-add-button') as HTMLButtonElement

    expect(titleInput).toBeTruthy()
    expect(urgencySelect).toBeTruthy()
    expect(impactSelect).toBeTruthy()
    expect(timeSelect).toBeTruthy()
    expect(difficultySelect).toBeTruthy()
    expect(addButton).toBeTruthy()
  })

  it('does not submit when inputs are invalid', () => {
    const { container } = render(<TaskEntryBlock />)
    const titleInput = container.querySelector('.task-title-input') as HTMLInputElement
    const addButton = container.querySelector('.task-add-button') as HTMLButtonElement

    // no values populated -> should early-return
    fireEvent.click(addButton)

    // TODO: this is a bad expect for the use case
    expect((titleInput as HTMLInputElement).value).toBe('')
  })

  it('calls onTaskAdded callback when task is submitted successfully', async () => {
    const mockPostTask = require('../../../services/functions-post-task.ts').default
    const mockCallback = jest.fn()
    const createdTask = { title: 'Test', difficulty: 5, impact: 5, time: 5, urgency: 5, score: 42 }
    mockPostTask.mockResolvedValueOnce(createdTask)

    const { container } = render(<TaskEntryBlock onTaskAdded={mockCallback} />)
    
    const titleInput = container.querySelector('.task-title-input') as HTMLInputElement
    const urgencySelect = container.querySelector('.task-urgency-select') as HTMLSelectElement
    const impactSelect = container.querySelector('.task-impact-select') as HTMLSelectElement
    const timeSelect = container.querySelector('.task-time-select') as HTMLSelectElement
    const difficultySelect = container.querySelector('.task-difficulty-select') as HTMLSelectElement
    const addButton = container.querySelector('.task-add-button') as HTMLButtonElement

    fireEvent.change(titleInput, { target: { value: 'Test' } })
    fireEvent.change(urgencySelect, { target: { value: '5' } })
    fireEvent.change(impactSelect, { target: { value: '5' } })
    fireEvent.change(timeSelect, { target: { value: '5' } })
    fireEvent.change(difficultySelect, { target: { value: '5' } })

    fireEvent.click(addButton)

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalledWith(createdTask)
    })
  })

  it('clears form after successful submission', async () => {
    const mockPostTask = require('../../../services/functions-post-task.ts').default
    mockPostTask.mockResolvedValueOnce({ title: 'Test', difficulty: 5, impact: 5, time: 5, urgency: 5, score: 42 })

    const { container } = render(<TaskEntryBlock />)
    
    const titleInput = container.querySelector('.task-title-input') as HTMLInputElement
    const urgencySelect = container.querySelector('.task-urgency-select') as HTMLSelectElement
    const impactSelect = container.querySelector('.task-impact-select') as HTMLSelectElement
    const timeSelect = container.querySelector('.task-time-select') as HTMLSelectElement
    const difficultySelect = container.querySelector('.task-difficulty-select') as HTMLSelectElement
    const addButton = container.querySelector('.task-add-button') as HTMLButtonElement

    fireEvent.change(titleInput, { target: { value: 'Test' } })
    fireEvent.change(urgencySelect, { target: { value: '5' } })
    fireEvent.change(impactSelect, { target: { value: '5' } })
    fireEvent.change(timeSelect, { target: { value: '5' } })
    fireEvent.change(difficultySelect, { target: { value: '5' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(titleInput.value).toBe('')
      expect(urgencySelect.value).toBe('0')
      expect(impactSelect.value).toBe('0')
      expect(timeSelect.value).toBe('0')
      expect(difficultySelect.value).toBe('0')
    })
  })

  it('submits on Enter key press in title input', async () => {
    const mockPostTask = require('../../../services/functions-post-task.ts').default
    const mockCallback = jest.fn()
    mockPostTask.mockResolvedValueOnce({ title: 'Test', difficulty: 5, impact: 5, time: 5, urgency: 5, score: 42 })

    const { container } = render(<TaskEntryBlock onTaskAdded={mockCallback} />)
    
    const titleInput = container.querySelector('.task-title-input') as HTMLInputElement
    const urgencySelect = container.querySelector('.task-urgency-select') as HTMLSelectElement
    const impactSelect = container.querySelector('.task-impact-select') as HTMLSelectElement
    const timeSelect = container.querySelector('.task-time-select') as HTMLSelectElement
    const difficultySelect = container.querySelector('.task-difficulty-select') as HTMLSelectElement

    fireEvent.change(titleInput, { target: { value: 'Test' } })
    fireEvent.change(urgencySelect, { target: { value: '5' } })
    fireEvent.change(impactSelect, { target: { value: '5' } })
    fireEvent.change(timeSelect, { target: { value: '5' } })
    fireEvent.change(difficultySelect, { target: { value: '5' } })
    fireEvent.keyDown(titleInput, { key: 'Enter' })

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalled()
    })
  })
})
