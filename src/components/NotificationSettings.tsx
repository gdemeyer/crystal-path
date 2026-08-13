import React, { useEffect, useState } from 'react'
import {
  getNotificationSupport,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
} from '../services/browser-notifications.ts'
import {
  getNotificationPreference,
  registerPushSubscription,
  removePushSubscription,
  setNotificationPreference,
} from '../services/functions-notifications.ts'

type DeviceState = 'idle' | 'enabling' | 'enabled' | 'denied' | 'unsupported' | 'error'

interface NotificationSettingsProps {
  token: string
}

export default function NotificationSettings({ token }: NotificationSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [preferenceEnabled, setPreferenceEnabled] = useState(true)
  const [preferenceLoaded, setPreferenceLoaded] = useState(false)
  const [deviceState, setDeviceState] = useState<DeviceState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isExpanded || preferenceLoaded) return

    let active = true
    getNotificationPreference(token)
      .then(preference => {
        if (!active) return
        setPreferenceEnabled(preference.enabled)
        setPreferenceLoaded(true)
      })
      .catch(error => {
        if (!active) return
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load notification settings')
      })

    return () => {
      active = false
    }
  }, [isExpanded, preferenceLoaded, token])

  const handleTogglePreference = async () => {
    const nextEnabled = !preferenceEnabled
    setErrorMessage(null)
    setPreferenceEnabled(nextEnabled)

    try {
      await setNotificationPreference(token, nextEnabled)
    } catch (error) {
      setPreferenceEnabled(!nextEnabled)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save notification settings')
      return
    }

    if (!nextEnabled) {
      try {
        const endpoint = await unsubscribeFromPush()
        if (endpoint) {
          await removePushSubscription(token, endpoint)
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to remove notifications from this device')
      }
      setDeviceState('idle')
    }
  }

  const handleEnableDevice = async () => {
    setErrorMessage(null)
    if (getNotificationSupport() === 'unsupported') {
      setDeviceState('unsupported')
      return
    }

    setDeviceState('enabling')
    const permission = await requestNotificationPermission()
    if (permission !== 'granted') {
      setDeviceState('denied')
      return
    }

    try {
      const subscription = await subscribeToPush(process.env.REACT_APP_VAPID_PUBLIC_KEY ?? '')
      await setNotificationPreference(token, true)
      await registerPushSubscription(token, subscription)
      setPreferenceEnabled(true)
      setPreferenceLoaded(true)
      setDeviceState('enabled')
    } catch (error) {
      setDeviceState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to enable notifications')
    }
  }

  return (
    <div className="section notification-settings">
      <button
        className="section-header"
        onClick={() => setIsExpanded(previous => !previous)}
        aria-expanded={isExpanded}
      >
        <span className="section-title">Notifications</span>
        <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className="section-content notification-settings-content">
          <label className="notification-toggle">
            <input
              type="checkbox"
              checked={preferenceEnabled}
              onChange={handleTogglePreference}
              aria-label="Enable task notifications"
            />
            <span>Task notifications</span>
          </label>
          <p className="notification-schedule">09:00 · 13:00 · 18:00 local time</p>
          <p className="notification-description">Notifications describe today&apos;s top todo item.</p>

          {preferenceEnabled && deviceState !== 'enabled' && (
            <button
              className="notification-enable-button"
              onClick={handleEnableDevice}
              disabled={deviceState === 'enabling'}
            >
              {deviceState === 'enabling' ? 'Enabling…' : 'Enable on this device'}
            </button>
          )}
          {deviceState === 'enabled' && <p role="status">Notifications enabled on this device.</p>}
          {deviceState === 'denied' && <p role="status">Permission denied. Allow notifications in browser settings.</p>}
          {deviceState === 'unsupported' && <p role="status">This browser does not support push notifications.</p>}
          {errorMessage && <p role="alert">{errorMessage}</p>}
        </div>
      )}
    </div>
  )
}
