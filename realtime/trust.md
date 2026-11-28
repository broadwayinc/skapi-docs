# Trusting the Sender

A realtime message or a push notification carries two kinds of data:

- **What the server sets.** It comes from the sender's verified login, and the sender cannot change it. Your app can rely on it.
- **What the sender writes.** That is the message itself, and the title and body of a notification. Treat it as user input, like any form field.

This page lists which is which, so your app can tell a message from an admin apart from one any user could have written.

## Who Sent It: `sender_type`

Every realtime message and every push notification says who sent it:

| `sender_type` | Who | `sender` |
|---|---|---|
| `"owner"` | The project owner, from their Skapi account | The owner's user ID |
| `"admin"` | A user in access group `90` to `99` | The user's ID |
| `"user"` | Any other user of the project | The user's ID |
| `"service"` | Skapi itself (push notifications only): a [notification from records](/notification/send-notifications.md#notifications-from-records). Its `title` and `body` may be text the record's uploader chose; `user_id` names that uploader. | The project ID |

The server sets both fields from the sender's login. A user cannot send a message that arrives as `"admin"` or `"owner"`, and cannot send one that names another user as `sender`. A message sent with a login from another project is refused.

:::tip
The access group is read from the sender's login. A user whose access group changes keeps their old `sender_type` until their login refreshes, at most a day later. To apply a change at once, have the user sign in again.
:::

## Realtime Messages

In the [RealtimeCallback](/realtime/connecting.md#creating-connection), these fields are set by the server:

| Field | What you can rely on |
|---|---|
| `type` | How the message was delivered: `"private"` (sent to you), `"message"` (sent to a group you joined), `"notice"` (someone joined or left), `"rtc:incoming"` (a call). |
| `sender` | The sender's user ID. |
| `sender_type` | `"owner"`, `"admin"` or `"user"`. `null` on notices and connection events. |
| `sender_cid` | The connection the message came from. |
| `sender_rid` | The group, for group messages and notices. |
| `code` | `USER_JOINED`, `USER_LEFT` or `USER_DISCONNECTED`, on notices. |

`message` is what the sender wrote. Any label inside it, such as `{ kind: "announcement" }`, is the sender's word, not the server's.

### Example: an announcement only admins can make

```js
skapi.connectRealtime((rt) => {
    if (rt.type !== 'private' && rt.type !== 'message') return;

    const fromStaff = rt.sender_type === 'admin' || rt.sender_type === 'owner';

    if (rt.message?.kind === 'announcement') {
        // Anyone can write "announcement" in their message: show it as one only from staff.
        if (fromStaff) showAnnouncement(rt.message.text);
        return;
    }

    showChatMessage({
        text: rt.message?.text,
        from: rt.sender,       // a real user ID, safe to look up with getUsers()
        badge: fromStaff ? 'Staff' : null,
    });
});
```

### Example: muting a user

`sender` cannot be faked, so a mute list keyed by user ID works:

```js
const muted = new Set(JSON.parse(localStorage.getItem('muted') || '[]'));

skapi.connectRealtime((rt) => {
    if (rt.sender && muted.has(rt.sender) && rt.sender_type === 'user') return; // staff is never muted
    handle(rt);
});
```

## Push Notifications

Every push notification reaches your service worker (`sw.js`) as JSON. These fields are set by the server:

```ts
{
    title: string;       // written by the sender (or the record's uploader, or Skapi's default text)
    body: string;        // written by the sender (or the record's uploader, or Skapi's default text)
    sender: string;      // set by the server: the sender's user ID, or the project ID for "service"
    sender_type: 'owner' | 'admin' | 'user' | 'service'; // set by the server
    // Only on notifications from records (sender_type "service"), all set by the server:
    type?: 'record' | 'reference';
    record_id?: string;
    table?: string;
    user_id?: string;    // the user who posted the record
    reference?: string;  // only for "reference"
}
```

Where each one comes from:

| Sent by | How | `sender_type` |
|---|---|---|
| The project owner | [`pushNotification()`](/notification/send-notifications.md#sending-notifications-for-admins) | `"owner"` |
| An admin | [`pushNotification()`](/notification/send-notifications.md#sending-notifications-for-admins), or a [`postRealtime()`](/notification/send-notifications.md#sending-notifications) notification | `"admin"` |
| Any user | A [`postRealtime()`](/notification/send-notifications.md#sending-notifications) notification | `"user"` |
| Skapi | A [notification from records](/notification/send-notifications.md#notifications-from-records) | `"service"` |

The `title` and `body` are always written by someone. Only `sender`, `sender_type` and the record fields are set by the server. A `"service"` notification is sent by Skapi, but its `title` and `body` can be text the record's uploader chose: read `user_id` for who posted the record, and do not show a `"service"` notification as official on its text alone.

### Example: style staff notifications, mute users

```js
// sw.js
self.addEventListener('push', (event) => {
    const data = event.data.json();
    event.waitUntil((async () => {
        const staff = data.sender_type === 'admin' || data.sender_type === 'owner';

        // A user on the mute list (kept by the page in IndexedDB or a cache) still gets a
        // notification shown, because browsers require one per push, but folded into one quiet entry.
        if (data.sender_type === 'user' && await isMuted(data.sender)) {
            return self.registration.showNotification('New messages', {
                tag: 'muted', renotify: false, silent: true,
            });
        }

        await self.registration.showNotification(staff ? '[Official] ' + data.title : data.title, {
            body: data.body,
            icon: 'icon-192x192.png',
            tag: data.sender_type === 'service' ? 'records' : 'from-' + data.sender, // one entry per sender
            requireInteraction: staff,
            data: { sender: data.sender, sender_type: data.sender_type, record_id: data.record_id || null },
        });
    })());
});
```

The `[Official]` prefix is added by your app from `sender_type`, so no user can produce it. A user who writes "[Official]" in their own title still arrives with `sender_type: "user"`.

## What Can Be Trusted

| | Trust it | Why |
|---|---|---|
| `sender`, `sender_type` | Yes | Set by the server from the sender's login. |
| `type`, `sender_cid`, `sender_rid`, `code` of a realtime message | Yes | Set by the server. |
| `type`, `record_id`, `table`, `user_id`, `reference` of a record notification | Yes | Set by the server from the record that was written. |
| `message` of a realtime message | No | Written by the sender. |
| `title`, `body` of a notification | No | Written by the sender, or by the uploader of a record. |
| A role or label inside `message` | No | Written by the sender. Use `sender_type` instead. |

## Limiting What Users Send

The project owner can limit how many realtime messages and notifications each user sends in a minute, or stop users from sending any. Admins and the owner are never limited. See [Send Limits](/realtime/limits.md).
