# Web Push notifications

Crystal Path uses browser Web Push, so notifications can arrive while the app is closed.

## Configuration

Generate one VAPID key pair. Set the public key in the frontend as `REACT_APP_VAPID_PUBLIC_KEY`. Set the matching public key, private key, and a contact address in the backend as `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT`.

Never expose `VAPID_PRIVATE_KEY` to the frontend or commit it to source control.

The browser must support Push API and Notification API. The deployed app must use HTTPS, and the existing production service worker must be active. Permission is requested only after the user selects **Enable on this device** in the Notifications section.

## Behavior

- The account preference defaults to enabled when no preference record exists.
- The user can turn the master preference off in the Notifications section.
- The sender runs every minute and catches up missed slots from the current local day.
- Slots are 09:00, 13:00, and 18:00 in the timezone last registered by each device.
- A notification contains today's top scheduled pending task.
- No notification is sent when today's schedule has no pending task.
- A device can be registered again to update its timezone and push keys.
- If the device timezone changes while the app is closed, it updates the next time the authenticated app registers the subscription.

Netlify Scheduled Functions must be enabled for the site and support the configured one-minute schedule. The scheduled function uses MongoDB delivery claims to prevent duplicate sends during normal concurrent invocations. Web Push providers do not offer an exactly-once guarantee: a process crash after provider acceptance can still produce a rare duplicate.