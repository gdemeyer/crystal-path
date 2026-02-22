describe('functions-get-tasks', () => {
  const OLD_ENV = process.env
  let getTasks: any

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
    global.fetch = jest.fn()
    // require after resetModules so we get a fresh instance
    getTasks = require('../../../services/functions-get-tasks').default
  })

  afterEach(() => {
    process.env = OLD_ENV
    ;(global.fetch as jest.Mock).mockRestore()
  })

  it('calls fetch with correct URL and returns JSON (no view param)', async () => {
    process.env.REACT_APP_FUNCTIONS_BASE_URL = 'https://api.example.com/'
    const mockData = [{ id: 1, title: 'a' }]
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ 
      ok: true,
      json: () => Promise.resolve(mockData) 
    })

    const res = await getTasks()

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe(
      `${process.env.REACT_APP_FUNCTIONS_BASE_URL}get-tasks`
    )

    const options = (global.fetch as jest.Mock).mock.calls[0][1]
    expect(options).toMatchObject({ method: 'GET' })
    expect(options.headers).toMatchObject({ 'Content-Type': 'application/json' })

    expect(res).toEqual(mockData)
  })

  it('includes bearer token in Authorization header when provided', async () => {
    process.env.REACT_APP_FUNCTIONS_BASE_URL = 'https://api.example.com/'
    const mockData = [{ id: 1, title: 'a' }]
    const token = 'test-token-123'
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ 
      ok: true,
      json: () => Promise.resolve(mockData) 
    })

    await getTasks(token)

    const options = (global.fetch as jest.Mock).mock.calls[0][1]
    expect(options.headers).toMatchObject({ 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    })
  })

  it('appends view=today query param when view option provided', async () => {
    process.env.REACT_APP_FUNCTIONS_BASE_URL = 'https://api.example.com/'
    const mockData = [{ id: 1, title: 'task1' }]
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ 
      ok: true,
      json: () => Promise.resolve(mockData) 
    })

    const res = await getTasks('token', { view: 'today' })

    expect(global.fetch).toHaveBeenCalledTimes(1)
    const url = (global.fetch as jest.Mock).mock.calls[0][0]
    expect(url).toBe(`${process.env.REACT_APP_FUNCTIONS_BASE_URL}get-tasks?view=today`)
    expect(res).toEqual(mockData)
  })

  it('appends view=backlog query param when view option provided', async () => {
    process.env.REACT_APP_FUNCTIONS_BASE_URL = 'https://api.example.com/'
    const mockData = [{ id: 2, title: 'task2' }]
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ 
      ok: true,
      json: () => Promise.resolve(mockData) 
    })

    const res = await getTasks('token', { view: 'backlog' })

    expect(global.fetch).toHaveBeenCalledTimes(1)
    const url = (global.fetch as jest.Mock).mock.calls[0][0]
    expect(url).toBe(`${process.env.REACT_APP_FUNCTIONS_BASE_URL}get-tasks?view=backlog`)
    expect(res).toEqual(mockData)
  })

  it('appends both view and date query params when both provided', async () => {
    process.env.REACT_APP_FUNCTIONS_BASE_URL = 'https://api.example.com/'
    const mockData = [{ id: 3, title: 'task3' }]
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ 
      ok: true,
      json: () => Promise.resolve(mockData) 
    })

    const res = await getTasks('token', { view: 'today', date: '2026-02-15' })

    expect(global.fetch).toHaveBeenCalledTimes(1)
    const url = (global.fetch as jest.Mock).mock.calls[0][0]
    expect(url).toBe(`${process.env.REACT_APP_FUNCTIONS_BASE_URL}get-tasks?view=today&date=2026-02-15`)
    expect(res).toEqual(mockData)
  })

  it('returns empty array when response is not an array', async () => {
    process.env.REACT_APP_FUNCTIONS_BASE_URL = 'https://api.example.com/'
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ 
      ok: true,
      json: () => Promise.resolve({ today: [], backlog: [] }) 
    })

    const res = await getTasks()

    expect(res).toEqual([])
    expect(consoleSpy).toHaveBeenCalledWith(
      'Expected array from getTasks, got:',
      { today: [], backlog: [] }
    )
    
    consoleSpy.mockRestore()
  })

  it('throws error when fetch fails', async () => {
    process.env.REACT_APP_FUNCTIONS_BASE_URL = 'https://api.example.com/'
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ 
      ok: false,
      statusText: 'Not Found'
    })

    await expect(getTasks()).rejects.toThrow('Failed to fetch tasks: Not Found')
  })
})
