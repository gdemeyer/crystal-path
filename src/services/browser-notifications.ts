import { PushSubscriptionPayload } from '../types/types.ts'

export type NotificationSupport = 'supported' | 'unsupported'

export function getNotificationSupport(): NotificationSupport {
  return typeof window !== 'undefined'
    && 'Notification' in window
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    ? 'supported'
    : 'unsupported'
}

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (getNotificationSupport() === 'unsupported') {
    return Promise.resolve('denied')
  }

  return Notification.requestPermission()
}

function decodeVapidKey(value: string): Uint8Array {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  return Uint8Array.from(raw, character => character.charCodeAt(0))
}

function isSubscriptionKeys(value: unknown): value is { p256dh: string; auth: string } {
  if (typeof value !== 'object' || value === null) return false
  const keys = value as Record<string, unknown>
  return typeof keys.p256dh === 'string' && typeof keys.auth === 'string'
}

export async function subscribeToPush(vapidPublicKey: string): Promise<PushSubscriptionPayload> {
  if (getNotificationSupport() === 'unsupported') {
    throw new Error('Notifications are not supported in this browser')
  }
  if (!vapidPublicKey) {
    throw new Error('Push notifications are not configured')
  }

  const registration = await navigator.serviceWorker.ready
  const existing = await registration.pushManager.getSubscription()
  const subscription = existing ?? await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: decodeVapidKey(vapidPublicKey) as BufferSource,
  })
  const json = subscription.toJSON()

  if (!json.endpoint || !isSubscriptionKeys(json.keys)) {
    throw new Error('Browser returned an incomplete push subscription')
  }

  return {
    endpoint: json.endpoint,
    keys: json.keys,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}

export async function unsubscribeFromPush(endpoint?: string): Promise<string | undefined> {
  if (getNotificationSupport() === 'unsupported') return undefined
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  if (subscription && (!endpoint || subscription.endpoint === endpoint)) {
    await subscription.unsubscribe()
    return subscription.endpoint
  }
  return undefined
}
