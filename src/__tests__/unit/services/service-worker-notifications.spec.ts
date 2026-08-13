import {
  getNotificationClickUrl,
  getNotificationTag,
  navigateNotificationClient,
  parsePushPayload,
} from '../../../services/service-worker-notifications'

describe('service worker notification helpers', () => {
  it('parses a notification payload', () => {
    expect(parsePushPayload({
      title: 'Crystal Path',
      body: "Today's top task: Write notes",
      url: '/tasks',
      date: '2026-08-13',
      slot: 'afternoon',
    })).toEqual({
      title: 'Crystal Path',
      body: "Today's top task: Write notes",
      url: '/tasks',
      date: '2026-08-13',
      slot: 'afternoon',
    })
  })

  it('uses a safe fallback for malformed data', () => {
    expect(parsePushPayload(null)).toEqual(expect.objectContaining({
      title: 'Crystal Path',
      url: '/',
    }))
  })

  it('keeps notification clicks same-origin', () => {
    expect(getNotificationClickUrl('/tasks?view=today', 'https://crystal.example')).toBe('/tasks?view=today')
    expect(getNotificationClickUrl('https://evil.example/phishing', 'https://crystal.example')).toBe('/')
  })

  it('navigates an existing app window before focusing it', async () => {
    const client = {
      navigate: jest.fn().mockResolvedValue(undefined),
      focus: jest.fn().mockResolvedValue(undefined),
    }

    await navigateNotificationClient(client, '/tasks')

    expect(client.navigate).toHaveBeenCalledWith('/tasks')
    expect(client.focus).toHaveBeenCalledTimes(1)
    expect(client.navigate.mock.invocationCallOrder[0])
      .toBeLessThan(client.focus.mock.invocationCallOrder[0])
  })

  it('creates a stable tag for a date and slot', () => {
    expect(getNotificationTag({ date: '2026-08-13', slot: 'evening' })).toBe('crystal-path-2026-08-13-evening')
  })
})
