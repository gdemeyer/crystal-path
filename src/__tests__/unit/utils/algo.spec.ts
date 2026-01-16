import sortTasks from '../../../utils/algo'
import { Task } from '../../../types/types'

describe('utils/algo sortTasks', () => {
  it('sorts tasks descending by pre-calculated score', () => {
    const tasks: Task[] = [
      { title: 'low', difficulty: 20, impact: 1, time: 20, urgency: 1, score: 10 } as any,
      { title: 'high', difficulty: 1, impact: 10, time: 1, urgency: 10, score: 50 } as any,
      { title: 'mid', difficulty: 10, impact: 5, time: 10, urgency: 5, score: 30 } as any,
    ]

    const sorted = sortTasks([...tasks])

    expect(sorted.map(t => t.title)).toEqual(['high', 'mid', 'low'])
  })

  it('handles empty arrays', () => {
    expect(sortTasks([])).toEqual([])
  })

  it('maintains stable order for equal scores', () => {
    const a = { title: 'a', difficulty: 10, impact: 5, time: 10, urgency: 5, score: 25 } as any
    const b = { title: 'b', difficulty: 10, impact: 5, time: 10, urgency: 5, score: 25 } as any
    const arr = [a, b]
    const sorted = sortTasks([...arr])
    // since scores are equal, stable sort should keep original relative order
    expect(sorted[0].title).toBe('a')
    expect(sorted[1].title).toBe('b')
  })

  it('handles tasks without score (treats as 0)', () => {
    const scored = { title: 'scored', score: 10 } as any
    const unscored = { title: 'unscored' } as any
    const arr = [unscored, scored]
    const sorted = sortTasks([...arr])
    // scored should come first since unscored defaults to 0
    expect(sorted[0].title).toBe('scored')
    expect(sorted[1].title).toBe('unscored')
  })
})
