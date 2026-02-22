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
})
