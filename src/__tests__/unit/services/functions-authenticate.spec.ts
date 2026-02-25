describe('functions-authenticate', () => {
    const OLD_ENV = process.env
    let authenticate: any

    beforeEach(() => {
        jest.resetModules()
        process.env = { ...OLD_ENV }
        process.env.REACT_APP_FUNCTIONS_BASE_URL = 'https://api.example.com/'
        global.fetch = jest.fn()
        authenticate = require('../../../services/functions-authenticate').default
    })

    afterEach(() => {
        process.env = OLD_ENV
        ;(global.fetch as jest.Mock).mockRestore()
    })

    it('should POST the Google token and return the backend JWT + userId', async () => {
        const mockResponse = { token: 'backend-jwt-abc', userId: 'user-123' }
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockResponse),
        })

        const result = await authenticate('google-id-token-xyz')

        expect(global.fetch).toHaveBeenCalledTimes(1)
        const [url, options] = (global.fetch as jest.Mock).mock.calls[0]
        expect(url).toBe('https://api.example.com/authenticate')
        expect(options.method).toBe('POST')
        expect(options.headers).toMatchObject({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer google-id-token-xyz',
        })
        expect(result).toEqual(mockResponse)
    })

    it('should throw an error when the server returns a non-ok response', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
        })

        await expect(authenticate('invalid-token')).rejects.toThrow('Authentication failed')
    })

    it('should throw an error when fetch fails', async () => {
        ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

        await expect(authenticate('some-token')).rejects.toThrow('Network error')
    })

    it('should use the REACT_APP_FUNCTIONS_BASE_URL env var', async () => {
        process.env.REACT_APP_FUNCTIONS_BASE_URL = 'https://custom-api.com/'
        jest.resetModules()
        authenticate = require('../../../services/functions-authenticate').default

        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ token: 'jwt', userId: 'u' }),
        })

        await authenticate('token')

        const url = (global.fetch as jest.Mock).mock.calls[0][0]
        expect(url).toBe('https://custom-api.com/authenticate')
    })
})
