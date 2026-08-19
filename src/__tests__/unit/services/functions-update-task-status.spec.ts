import { updateTaskStatus } from '../../../services/functions-update-task-status'

describe('functions-update-task-status', () => {
  beforeEach(() => {
    process.env.REACT_APP_FUNCTIONS_BASE_URL = 'https://api.example.com/'
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ _id: 'task-1' }),
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('sends the browser timezone with a status update', async () => {
    await updateTaskStatus('task-1', 'COMPLETED', 'token')

    const [, options] = (global.fetch as jest.Mock).mock.calls[0]
    expect(JSON.parse(options.body)).toEqual({
      taskId: 'task-1',
      status: 'COMPLETED',
      timezone: expect.any(String),
    })
  })
})