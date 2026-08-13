import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import NotificationSettings from '../../../components/NotificationSettings'
import {
  getNotificationSupport,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
} from '../../../services/browser-notifications'
import {
  getNotificationPreference,
  registerPushSubscription,
  removePushSubscription,
  setNotificationPreference,
} from '../../../services/functions-notifications'

jest.mock('../../../services/browser-notifications')
jest.mock('../../../services/functions-notifications')

describe('NotificationSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getNotificationSupport as jest.Mock).mockReturnValue('supported')
    ;(requestNotificationPermission as jest.Mock).mockResolvedValue('granted')
    ;(subscribeToPush as jest.Mock).mockResolvedValue({
      endpoint: 'https://fcm.googleapis.com/fcm/send/subscription-1',
      keys: { p256dh: 'p256dh-key', auth: 'auth-key' },
      timezone: 'America/New_York',
    })
    ;(unsubscribeFromPush as jest.Mock).mockResolvedValue('https://fcm.googleapis.com/fcm/send/subscription-1')
    ;(getNotificationPreference as jest.Mock).mockResolvedValue({ enabled: true })
    ;(setNotificationPreference as jest.Mock).mockResolvedValue({ enabled: true })
    ;(registerPushSubscription as jest.Mock).mockResolvedValue(undefined)
    ;(removePushSubscription as jest.Mock).mockResolvedValue(undefined)
  })

  it('does not request permission during render or settings load', async () => {
    render(<NotificationSettings token="token" />)
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }))

    await waitFor(() => expect(getNotificationPreference).toHaveBeenCalledWith('token'))
    expect(requestNotificationPermission).not.toHaveBeenCalled()
  })

  it('shows the default-on master setting', async () => {
    render(<NotificationSettings token="token" />)
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }))

    const checkbox = await screen.findByRole('checkbox', { name: /enable task notifications/i })
    expect(checkbox).toBeChecked()
  })

  it('requests permission only after Enable is clicked and registers the device', async () => {
    render(<NotificationSettings token="token" />)
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }))
    const enableButton = await screen.findByRole('button', { name: /enable on this device/i })

    fireEvent.click(enableButton)

    await waitFor(() => expect(registerPushSubscription).toHaveBeenCalled())
    expect(requestNotificationPermission).toHaveBeenCalledTimes(1)
    expect(subscribeToPush).toHaveBeenCalledWith(expect.any(String))
    expect(requestNotificationPermission.mock.invocationCallOrder[0])
      .toBeLessThan(subscribeToPush.mock.invocationCallOrder[0])
  })

  it('persists master-off before best-effort device removal', async () => {
    render(<NotificationSettings token="token" />)
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }))
    const checkbox = await screen.findByRole('checkbox', { name: /enable task notifications/i })

    fireEvent.click(checkbox)

    await waitFor(() => expect(setNotificationPreference).toHaveBeenCalledWith('token', false))
    expect(unsubscribeFromPush).toHaveBeenCalled()
    expect(removePushSubscription).toHaveBeenCalledWith('token', 'https://fcm.googleapis.com/fcm/send/subscription-1')
  })

  it('keeps the master setting off when local device cleanup fails', async () => {
    ;(unsubscribeFromPush as jest.Mock).mockRejectedValueOnce(new Error('device cleanup failed'))
    render(<NotificationSettings token="token" />)
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }))
    const checkbox = await screen.findByRole('checkbox', { name: /enable task notifications/i })

    fireEvent.click(checkbox)

    await waitFor(() => expect(setNotificationPreference).toHaveBeenCalledWith('token', false))
    expect(checkbox).not.toBeChecked()
    expect(screen.getByRole('alert')).toHaveTextContent('device cleanup failed')
  })
})
