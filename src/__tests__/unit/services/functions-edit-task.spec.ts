describe('functions-edit-task', () => {
  const OLD_ENV = process.env
  let editTask: (taskId: string, task: any, token: string) => Promise<any>

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
    process.env.REACT_APP_FUNCTIONS_BASE_URL = 'https://api.example.com/'
    global.fetch = jest.fn()
    editTask = require('../../../services/functions-edit-task').default
  })

  afterEach(() => {
    process.env = OLD_ENV
    ;(global.fetch as jest.Mock).mockRestore()
  })

  it('PUTs the task with taskId, correct headers, and returns JSON', async () => {
    const task = { title: 'Updated', difficulty: 5, impact: 5, time: 5, urgency: 5 }
    const mockResp = { ...task, _id: '123' }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResp) })

    const res = await editTask('123', task as any, 'test-token')

    expect(global.fetch).toHaveBeenCalledTimes(1)
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0]
    expect(url).toBe('https://api.example.com/edit-task')
    expect(options.method).toBe('PUT')
    expect(options.headers).toMatchObject({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token',
    })
    const body = JSON.parse(options.body)
    expect(body.taskId).toBe('123')
    expect(body.title).toBe('Updated')
    expect(res).toEqual(mockResp)
  })

  it('throws AuthenticationError on 401 response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    })

    try {
      await editTask('123', { title: 'T', difficulty: 1, impact: 1, time: 1, urgency: 1 } as any, 'expired-token')
      fail('Expected an error to be thrown')
    } catch (err: any) {
      expect(err.name).toBe('AuthenticationError')
      expect(err.status).toBe(401)
    }
  })

  it('throws a regular error for non-401 failures', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
    })

    try {
      await editTask('123', { title: 'T', difficulty: 1, impact: 1, time: 1, urgency: 1 } as any, 'valid-token')
      fail('Expected an error to be thrown')
    } catch (err: any) {
      expect(err.name).not.toBe('AuthenticationError')
    }
  })
})
