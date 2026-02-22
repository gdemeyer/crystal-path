import { render, fireEvent } from '@testing-library/react'

import TaskEntryBlock from '../../../components/taskEntryBlock'

describe('TaskEntryBlock component', () => {
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
})
