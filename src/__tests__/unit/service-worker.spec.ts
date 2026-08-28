jest.mock('workbox-core', () => ({
  clientsClaim: jest.fn(),
}))
jest.mock('workbox-expiration', () => ({
  ExpirationPlugin: jest.fn().mockImplementation(() => ({})),
}))
jest.mock('workbox-precaching', () => ({
  createHandlerBoundToURL: jest.fn(() => jest.fn()),
  precacheAndRoute: jest.fn(),
}))
jest.mock('workbox-routing', () => ({
  registerRoute: jest.fn(),
}))
jest.mock('workbox-strategies', () => ({
  StaleWhileRevalidate: jest.fn().mockImplementation(() => ({})),
}))

type WorkerEventListener = (event: unknown) => void

describe('service worker notifications', () => {
  const listeners = new Map<string, WorkerEventListener>()
  const origin = 'http://localhost'
  let showNotification: jest.Mock
  let clientsApi: { matchAll: jest.Mock; openWindow: jest.Mock }

  beforeAll(() => {
    const workerGlobal = self as unknown as {
      addEventListener: (type: string, listener: WorkerEventListener) => void
    }
    jest.spyOn(workerGlobal, 'addEventListener').mockImplementation((type, listener) => {
      listeners.set(type, listener)
    })

    jest.isolateModules(() => {
      require('../../service-worker')
    })
  })

  beforeEach(() => {
    jest.clearAllMocks()
    showNotification = jest.fn().mockResolvedValue(undefined)
    clientsApi = {
      matchAll: jest.fn(),
      openWindow: jest.fn().mockResolvedValue(undefined),
    }
    Object.defineProperty(self, 'registration', {
      configurable: true,
      value: { showNotification },
    })
    Object.defineProperty(self, 'clients', {
      configurable: true,
      value: clientsApi,
    })
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('shows notifications with the Crystal Path logo', async () => {
    const event = {
      data: {
        json: () => ({
          title: 'Crystal Path',
          body: "Today's top task: Write notes",
          url: '/tasks',
          date: '2026-08-28',
          slot: 'morning',
        }),
      },
      waitUntil: jest.fn(),
    }

    listeners.get('push')!(event)
    await event.waitUntil.mock.calls[0][0]

    expect(showNotification).toHaveBeenCalledWith('Crystal Path', expect.objectContaining({
      icon: expect.stringMatching(/crystal_path_logo\.(png|svg)$/),
    }))
  })

  it('navigates and focuses an installed PWA before opening a website', async () => {
    const appClient = {
      url: `${origin}/`,
      navigate: jest.fn().mockResolvedValue(undefined),
      focus: jest.fn().mockResolvedValue(undefined),
    }
    clientsApi.matchAll.mockResolvedValue([appClient])
    const close = jest.fn()
    const event = {
      notification: { close, data: { url: '/tasks' } },
      waitUntil: jest.fn(),
    }

    listeners.get('notificationclick')!(event)
    await event.waitUntil.mock.calls[0][0]

    expect(close).toHaveBeenCalledTimes(1)
    expect(appClient.navigate).toHaveBeenCalledWith('/tasks')
    expect(appClient.focus).toHaveBeenCalledTimes(1)
    expect(clientsApi.openWindow).not.toHaveBeenCalled()
  })

  it('opens the website when no installed PWA client exists', async () => {
    clientsApi.matchAll.mockResolvedValue([])
    const event = {
      notification: { close: jest.fn(), data: { url: '/tasks?view=today' } },
      waitUntil: jest.fn(),
    }

    listeners.get('notificationclick')!(event)
    await event.waitUntil.mock.calls[0][0]

    expect(clientsApi.openWindow).toHaveBeenCalledWith('/tasks?view=today')
  })
})
