import sortTasks from '../../../utils/algo'
import { Task } from '../../../types/types'

describe('utils/algo sortTasks', () => {
  it('sorts tasks descending by calculated score', () => {
    const tasks: Task[] = [
      { title: 'low', difficulty: 20, impact: 1, time: 20, urgency: 1 } as any,
      { title: 'high', difficulty: 1, impact: 10, time: 1, urgency: 10 } as any,
      { title: 'mid', difficulty: 10, impact: 5, time: 10, urgency: 5 } as any,
    ]

    // replicate the scoring used by the module so we can assert expected ordering
    // TODO: hardcode score so we aren't duplicating code
    const score = (a: Task) =>
      Math.sqrt(
        Math.pow(21 - (a.difficulty as number), 2) +
          Math.pow(a.impact as number, 2) * 1.2 +
          Math.pow(21 - (a.time as number), 2) +
          Math.pow(a.urgency as number, 2) * 1.2
      )

    const expected = [...tasks].sort((a, b) => score(b) - score(a))

    const sorted = sortTasks([...tasks])

    expect(sorted.map(t => t.title)).toEqual(expected.map(t => t.title))
  })

  it('handles empty arrays', () => {
    expect(sortTasks([])).toEqual([])
  })

  it('maintains stable order for equal scores', () => {
    const a = { title: 'a', difficulty: 10, impact: 5, time: 10, urgency: 5 } as any
    const b = { title: 'b', difficulty: 10, impact: 5, time: 10, urgency: 5 } as any
    const arr = [a, b]
    const sorted = sortTasks([...arr])
    // since scores are equal, stable sort should keep original relative order
    expect(sorted[0].title).toBe('a')
    expect(sorted[1].title).toBe('b')
  })
})
