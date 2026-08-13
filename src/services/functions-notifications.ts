import { NotificationPreference, PushSubscriptionPayload } from '../types/types.ts'
import consts from './consts.ts'
import { AuthenticationError } from './errors.ts'

function getUrl(route: string): string {
  return `${process.env.REACT_APP_FUNCTIONS_BASE_URL}${route}`
}

function getHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

async function throwResponseError(response: Response, fallback: string): Promise<never> {
  if (response.status === 401) {
    throw new AuthenticationError()
  }
  const data: unknown = await response.json().catch(() => null)
  if (typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string') {
    throw new Error(data.error)
  }
  throw new Error(fallback)
}

export async function getNotificationPreference(token: string): Promise<NotificationPreference> {
  const response = await fetch(getUrl(consts.routes.notificationPreference), {
    method: 'GET',
    headers: getHeaders(token),
  })
  if (!response.ok) {
    await throwResponseError(response, 'Failed to load notification preference')
  }
  return response.json() as Promise<NotificationPreference>
}

export async function setNotificationPreference(token: string, enabled: boolean): Promise<NotificationPreference> {
  const response = await fetch(getUrl(consts.routes.notificationPreference), {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify({ enabled }),
  })
  if (!response.ok) {
    await throwResponseError(response, 'Failed to save notification preference')
  }
  return response.json() as Promise<NotificationPreference>
}

export async function registerPushSubscription(token: string, subscription: PushSubscriptionPayload): Promise<void> {
  const response = await fetch(getUrl(consts.routes.pushSubscription), {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(subscription),
  })
  if (!response.ok) {
    await throwResponseError(response, 'Failed to register push subscription')
  }
}

export async function removePushSubscription(token: string, endpoint: string): Promise<void> {
  const response = await fetch(getUrl(consts.routes.pushSubscription), {
    method: 'DELETE',
    headers: getHeaders(token),
    body: JSON.stringify({ endpoint }),
  })
  if (!response.ok) {
    await throwResponseError(response, 'Failed to remove push subscription')
  }
}
