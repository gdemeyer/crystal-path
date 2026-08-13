import { NotificationPayload, NotificationSlotId } from '../types/types.ts'

const slots: NotificationSlotId[] = ['morning', 'afternoon', 'evening']

export interface NotificationWindowClient {
  navigate(url: string): Promise<unknown>;
  focus(): Promise<unknown>;
}

export function parsePushPayload(value: unknown): NotificationPayload {
  if (typeof value !== 'object' || value === null) {
    return {
      title: 'Crystal Path',
      body: 'You have a top task for today.',
      url: '/',
      date: '',
      slot: 'morning',
    }
  }

  const data = value as Record<string, unknown>
  const slot = typeof data.slot === 'string' && slots.includes(data.slot as NotificationSlotId)
    ? data.slot as NotificationSlotId
    : 'morning'
  return {
    title: typeof data.title === 'string' && data.title.length > 0 ? data.title.slice(0, 100) : 'Crystal Path',
    body: typeof data.body === 'string' && data.body.length > 0
      ? data.body.slice(0, 500)
      : 'You have a top task for today.',
    url: typeof data.url === 'string' ? data.url : '/',
    date: typeof data.date === 'string' ? data.date : '',
    slot,
  }
}

export function getNotificationClickUrl(value: string, origin: string): string {
  try {
    const url = new URL(value, origin)
    return url.origin === origin ? `${url.pathname}${url.search}${url.hash}` : '/'
  } catch {
    return '/'
  }
}

export async function navigateNotificationClient(
  client: NotificationWindowClient,
  targetUrl: string,
): Promise<void> {
  await client.navigate(targetUrl)
  await client.focus()
}

export function getNotificationTag(payload: Pick<NotificationPayload, 'date' | 'slot'>): string {
  return `crystal-path-${payload.date || 'today'}-${payload.slot}`
}
