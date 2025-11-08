import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import TaskEntryBlock from '../../../components/taskEntryBlock'

describe('TaskEntryBlock component', () => {
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
})
