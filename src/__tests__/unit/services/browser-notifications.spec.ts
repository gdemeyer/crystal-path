import {
  getNotificationSupport,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
} from '../../../services/browser-notifications'

describe('browser notification service', () => {
  const existingSubscription = {
    endpoint: 'https://fcm.googleapis.com/fcm/send/subscription-1',
    toJSON: () => ({
      endpoint: 'https://fcm.googleapis.com/fcm/send/subscription-1',
      keys: { p256dh: 'p256dh-key', auth: 'auth-key' },
    }),
    unsubscribe: jest.fn().mockResolvedValue(true),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    Object.defineProperty(window, 'Notification', {
      configurable: true,
      value: { requestPermission: jest.fn().mockResolvedValue('granted') },
    })
    Object.defineProperty(window, 'PushManager', { configurable: true, value: function PushManager() {} })
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        ready: Promise.resolve({
          pushManager: {
            getSubscription: jest.fn().mockResolvedValue(existingSubscription),
            subscribe: jest.fn(),
          },
        }),
      },
    })
  })

  it('detects supported browsers', () => {
    expect(getNotificationSupport()).toBe('supported')
  })

  it('requests permission through the browser API', async () => {
    await expect(requestNotificationPermission()).resolves.toBe('granted')
    expect(Notification.requestPermission).toHaveBeenCalledTimes(1)
  })

  it('reuses an existing subscription', async () => {
    await expect(subscribeToPush('public-key')).resolves.toEqual({
      endpoint: existingSubscription.endpoint,
      keys: { p256dh: 'p256dh-key', auth: 'auth-key' },
      timezone: expect.any(String),
    })
  })

  it('unsubscribes the current device and returns its endpoint', async () => {
    await expect(unsubscribeFromPush()).resolves.toBe(existingSubscription.endpoint)
    expect(existingSubscription.unsubscribe).toHaveBeenCalledTimes(1)
  })
})
