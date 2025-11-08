describe('functions-health', () => {
  const OLD_ENV = process.env
  let getHealth: any

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
    global.fetch = jest.fn()
    getHealth = require('../../../services/functions-health').default
  })

  afterEach(() => {
    process.env = OLD_ENV
    ;(global.fetch as jest.Mock).mockRestore()
  })

  it('calls health endpoint and returns JSON', async () => {
    process.env.REACT_APP_FUNCTIONS_BASE_URL = 'https://api.example.com/'
    const mockData = { healthy: true }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ json: () => Promise.resolve(mockData) })

    const res = await getHealth()

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe(
      `${process.env.REACT_APP_FUNCTIONS_BASE_URL}health`
    )
    const options = (global.fetch as jest.Mock).mock.calls[0][1]
    expect(options).toMatchObject({ method: 'GET' })
    expect(res).toEqual(mockData)
  })
})
