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

  it('calls fetch with correct URL and returns JSON', async () => {
    process.env.REACT_APP_FUNCTIONS_BASE_URL = 'https://api.example.com/'
    const mockData = [{ id: 1, title: 'a' }]
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ json: () => Promise.resolve(mockData) })

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
})
