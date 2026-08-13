import {
  getNotificationClickUrl,
  getNotificationTag,
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

  it('creates a stable tag for a date and slot', () => {
    expect(getNotificationTag({ date: '2026-08-13', slot: 'evening' })).toBe('crystal-path-2026-08-13-evening')
  })
})
