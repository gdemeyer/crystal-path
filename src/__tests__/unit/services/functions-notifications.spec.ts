import {
  getNotificationPreference,
  registerPushSubscription,
  removePushSubscription,
  setNotificationPreference,
} from '../../../services/functions-notifications'
import { AuthenticationError } from '../../../services/errors'

const mockSubscription = {
  endpoint: 'https://push.example.com/subscription-1',
  keys: { p256dh: 'p256dh-key', auth: 'auth-key' },
  timezone: 'America/New_York',
}

describe('notification services', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  it('gets the notification preference', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ enabled: true }),
    })

    await expect(getNotificationPreference('token')).resolves.toEqual({ enabled: true })
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('notification-preference'),
      expect.objectContaining({ method: 'GET', headers: expect.objectContaining({ Authorization: 'Bearer token' }) }),
    )
  })

  it('updates the master preference', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ enabled: false }),
    })

    await expect(setNotificationPreference('token', false)).resolves.toEqual({ enabled: false })
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('notification-preference'),
      expect.objectContaining({ method: 'PUT', body: JSON.stringify({ enabled: false }) }),
    )
  })

  it('registers a device subscription', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({ ok: true })

    await expect(registerPushSubscription('token', mockSubscription)).resolves.toBeUndefined()
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('push-subscription'),
      expect.objectContaining({ method: 'PUT', body: JSON.stringify(mockSubscription) }),
    )
  })

  it('removes a device subscription', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({ ok: true })

    await removePushSubscription('token', mockSubscription.endpoint)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('push-subscription'),
      expect.objectContaining({
        method: 'DELETE',
        body: JSON.stringify({ endpoint: mockSubscription.endpoint }),
      }),
    )
  })

  it('maps unauthorized responses to AuthenticationError', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      json: jest.fn().mockResolvedValue({ error: 'Unauthorized' }),
    })

    await expect(getNotificationPreference('token')).rejects.toBeInstanceOf(AuthenticationError)
  })
})
