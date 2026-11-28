# Send Limits

The project owner can limit how many realtime messages and notifications one user of the project sends in a minute. This keeps a single user from flooding others with messages or push notifications.

## Setting the Limits

Open your project in the Skapi dashboard and go to the **Users** page. The **Realtime Limits** card above the user list has two settings:

| Setting | What it counts | Empty | `0` |
|---|---|---|---|
| **Messages per User** | Realtime messages one user sends in a minute with [`postRealtime()`](/realtime/post.md), to other users or to a group. | No limit (the default) | Users cannot send realtime messages. |
| **Notifications per User** | Notifications one user sends in a minute with their [`postRealtime()`](/notification/send-notifications.md#sending-notifications) messages. | No limit (the default) | Users cannot send notifications. Their messages still go. |

Click **[Edit]**, enter a whole number, or leave it empty for no limit, and save. A change reaches every connection within a minute.

The Skapi MCP server can set them too, with `setProjectSettings` (`realtime_message_limit`, `realtime_notification_limit`; `null` for no limit).

## Who Is Limited

Only users of the project. Admins (access group `90` to `99`) and the project owner are never limited, so an admin can still reach everyone when users are set to `0`. [`pushNotification()`](/notification/send-notifications.md#sending-notifications-for-admins) is admin only, so it is never limited either.

## How Messages Are Counted

- Each message counts once when it is sent, whether it goes to a user or to a group, and whether or not anyone receives it (a message to a user who is not connected still counts).
- Messages the SDK sends together to a busy group still count one by one. When only some of them fit, the first ones that fit are delivered and the rest are not.
- WebRTC calls ([`connectRTC()`](/realtime/webRTC.md)) are not counted: a call needs many signals to connect.
- A notification counts only when it is sent. Without `config.always`, a notification is sent only when the recipient is not connected, so a message to a connected user uses no notification.
- The count starts over every minute.

## What the Sender Sees

[`postRealtime()`](/api-reference/realtime/README.md#postrealtime) still resolves with `Message sent.` when the message leaves the device. The server checks the limit, and a refusal reaches the sender's [RealtimeCallback](/realtime/connecting.md#creating-connection) as an `error`:

| Case | `rt.message` | What happens |
|---|---|---|
| Over the message limit | `Limit reached: a user can send 30 realtime messages a minute.` | The message is not delivered. |
| Over the message limit in the middle of messages sent together to a group | `Limit reached: a user can send 30 realtime messages a minute. 2 of 5 messages were not sent.` | The first ones that fit are delivered. |
| Messages set to `0` | `This project does not allow users to send realtime messages.` | The message is not delivered. |
| Over the notification limit | `Limit reached: a user can send 5 notifications a minute. The notification was not sent.` | The message is delivered, without its notification. |
| Notifications set to `0` | `This project does not allow users to send notifications. The notification was not sent.` | The message is delivered, without its notification. |

```js
skapi.connectRealtime((rt) => {
    if (rt.type === 'error') {
        showToast(rt.message); // e.g. "Limit reached: a user can send 30 realtime messages a minute."
        return;
    }
    // ...
});
```

## Telling Users Apart

The receiver can tell an admin's message from a user's with `sender_type`, which the server sets. See [Trusting the Sender](/realtime/trust.md).
