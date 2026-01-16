describe('functions-post-task', () => {
  const OLD_ENV = process.env
  let postTask: any

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
    global.fetch = jest.fn()
    postTask = require('../../../services/functions-post-task').default
  })

  afterEach(() => {
    process.env = OLD_ENV
    ;(global.fetch as jest.Mock).mockRestore()
  })

  it('POSTs the task with correct headers and returns JSON', async () => {
    process.env.REACT_APP_FUNCTIONS_BASE_URL = 'https://api.example.com/'
    const task = { title: 'T', difficulty: 5, impact: 5, time: 5, urgency: 5 }
    const mockResp = { success: true }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ json: () => Promise.resolve(mockResp) })

    const res = await postTask(task as any)

    expect(global.fetch).toHaveBeenCalledTimes(1)
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0]
    expect(url).toBe(`${process.env.REACT_APP_FUNCTIONS_BASE_URL}post-task`)
    expect(options).toMatchObject({ method: 'POST' })
    expect(options.headers).toMatchObject({ 'Content-Type': 'application/json' })
    expect(options.body).toBe(JSON.stringify(task))
    expect(res).toEqual(mockResp)
  })

  it('returns task with score from server response', async () => {
    process.env.REACT_APP_FUNCTIONS_BASE_URL = 'https://api.example.com/'
    const task = { title: 'Test', difficulty: 5, impact: 5, time: 5, urgency: 5 }
    const mockTaskWithScore = { ...task, score: 42.5, _id: '123' }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ json: () => Promise.resolve(mockTaskWithScore) })

    const res = await postTask(task as any)

    expect(res).toEqual(mockTaskWithScore)
    expect(res.score).toBeDefined()
  })
})
