# Realtime Groups

Realtime groups are used to send realtime data to multiple users at once.
This can be used to create group chats, group notifications, etc.

## Joining a Group

Users can join a group by calling [`joinRealtime()`](/api-reference/realtime/README.md#joinrealtime) method.

params argument takes the following parameters:

-   `group`: The name of the group to join.

Group name can be anything you want.
If the group does not exist, it will be created automatically, otherwise the user will be joined to the existing group.

```js
skapi.joinRealtime({ group: "HelloWorld" }).then((res) => {
    console.log(res.message); // Joined realtime message group: "HelloWorld".
});
```

When the user is joined to the group successfully, the method will return the following object:

```ts
{
  type: 'success',
  message: 'Joined realtime message group: "HelloWorld".'.
}
```

For more detailed information on all the parameters and options available with the [`joinRealtime()`](/api-reference/realtime/README.md#joinrealtime) method,
please refer to the API Reference below:

### [`joinRealtime(params): Promise<{ type: 'success', message: string }>`](/api-reference/realtime/README.md#joinrealtime)

:::tip
Even if the user has joined the group, they can still receive realtime data sent individually to them.
:::

## Sending Data to a Group

Once the user has joined the group, they can send any JSON data to it using the [`postRealtime()`](/api-reference/realtime/README.md#postrealtime) method. The message (JSON data) will be broadcast to all users in the group.

The example below shows how to send realtime data to a group named "HelloWorld":

::: code-group

```html [Form]
<form
    onsubmit="skapi.postRealtime(event, 'HelloWorld').then(u=>console.log(u))"
>
    <input name="msg" required /><input type="submit" value="Send" />
</form>
```

```js [JS]
skapi
    .postRealtime({ msg: "Hello World!" }, "HelloWorld")
    .then((res) => console.log(res));
```

:::

For more detailed information on all the parameters and options available with the [`postRealtime()`](/api-reference/realtime/README.md#postrealtime) method,
please refer to the API Reference below:

## Receiving Data from the Group

When a message (JSON data) is broadcast in the group, every user receives it as an argument to the RealtimeCallback defined when creating the realtime connection with [`connectRealtime()`](/api-reference/realtime/README.md#connectrealtime). The callback receives an object whose `type` property is set to `"message"`.

The example below shows how other users receive the broadcasted data from the group named "HelloWorld" via [RealtimeCallback](/api-reference/data-types/README.md#realtimecallback) function:

```js
let RealtimeCallback = (rt) => {
    /**
    {
        "type": "message",
        "message": {
            "msg": "Hello World!",
        },
        "sender": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "sender_cid": "cid:xx-xxxxxxxxxxxx=",
        "sender_rid": "HelloWorld",
        "code": null
    }
    */
};

skapi.connectRealtime(RealtimeCallback);
```

### Busy Groups

When a group is both big and busy, the server sends its messages together to save traffic. This starts when the number of members times the messages sent in the same second goes over 500, for example 300 members and 2 messages in one second, or 10 members and 51 messages.

- The first message goes out at once. The ones that follow are held for a moment and sent together. The wait is 1 second for every 2,000 members, and at least a tenth of a second: 100 milliseconds in a group of up to 200 members, 1 second at 2,000, 5 seconds at 10,000.
- Your callback still receives each message on its own, in the order they were sent, with the same `type`, `message`, `sender`, `sender_cid` and `sender_rid`. Nothing in your code needs to change.
- A group under that line is never held, so a small group that sends now and then gets every message at once, as before.
- SDK versions before 2.2.23 cannot read grouped messages. They keep receiving each message on its own.

Join and leave notices (`USER_JOINED`, `USER_LEFT`, `USER_DISCONNECTED`) are grouped the same way when several come close in time: the first one goes out at once, the ones that follow within 1 second (5 seconds in a group of 1,000 members or more, longer above 10,000) together. Your callback still receives one `notice` per join or leave, in order.

### Sending Often

A page that posts to its group faster than ten times a second (a game sending on every tick, a drawing board on every mouse move) has its messages gathered by the SDK for up to 100 milliseconds and sent as one. Every member still receives each message on its own, in order. A message sent 100 milliseconds or more after the one before goes at once, so a chat never waits. A message with a notification is never gathered.

Each send is one request to the service and one message to every member, so this is where the cost of a fast app is decided: a page that sends 120 times a second costs about as much as one that sends 10 times a second.

For a fast game, send only what changed, and consider a [WebRTC data channel](/realtime/webRTC.md) between the players for the gameplay itself: it goes straight from one browser to the other, with no message fee and the lowest delay, while the realtime group carries the lobby, the chat and who is there.

### Message Order

Messages of one sender reach every member in the order they were sent. Two messages sent quickly can travel different paths through the service; the SDK numbers them and puts them back in order on arrival. A message that does not arrive within 1.5 seconds no longer holds back the ones after it. Messages from different senders have no fixed order between them.

A member's first message after joining is sent once the group has heard that they joined (at most 3 seconds later), so nobody receives a message from someone who is not in their list yet. The sender receives their own group messages too; a page that shows them as they are typed should skip the ones whose `sender` is the current user.

### [`postRealtime(message, recipient, notification?): Promise<{ type: 'success', message: string }>`](/api-reference/realtime/README.md#postrealtime)

:::warning
The user must be joined to the group to send data to the group.
:::

## Leaving a Group

Also, if you want to leave the group, you can call [`joinRealtime(params)`](/api-reference/realtime/README.md#joinrealtime) method with a `params.group` value as empty `string` or `null`.

```js
skapi.joinRealtime({ group: null });
```

## Changing the Group

Users can join only one group at a time.
If you want your user to change groups, you can call [`joinRealtime(params)`](/api-reference/realtime/README.md#joinrealtime) method with a different `params.group` value.

```js
skapi.joinRealtime({ group: "Another Group Name" });
```

## Listing Groups

Users can get a list of realtime groups by calling [`getRealtimeGroups()`](/api-reference/realtime/README.md#getrealtimegroups) method.

Example below shows listing all groups existing in your service:

```js
skapi.getRealtimeGroups().then((res) => {
    console.log(res.list); // [{ group: 'HelloWorld', number_of_users: 1 }, ...]
});
```

You can search groups by the name.
Below example shows how to search group names that start with "Hello":

```js
skapi
    .getRealtimeGroups({ searchFor: "group", value: "Hello", condition: ">=" })
    .then((res) => {
        console.log(res.list); // [{ group: 'HelloWorld', number_of_users: 1 }, ...]
    });
```

You can also list groups that have more than 10 users:

```js
skapi
    .getRealtimeGroups({
        searchFor: "number_of_users",
        value: 10,
        condition: ">=",
    })
    .then((res) => {
        console.log(res.list); // [{ group: 'HelloUniverse', number_of_users: 11 }, ...]
    });
```

For more detailed information on all the parameters and options available with the [`getRealtimeGroups()`](/api-reference/realtime/README.md#getrealtimegroups) method,
please refer to the API Reference below:

### [`getRealtimeGroups(params?, fetchOptions?): Promise<DatabaseResponse<{ group: string; number_of_users: number; }>>`](/api-reference/realtime/README.md#getrealtimegroups)

## Listing Users in a Group

Users can get a list of users in a group by calling [`getRealtimeUsers()`](/api-reference/realtime/README.md#getrealtimeusers) method.

Example below shows listing all users in the "HelloWorld" group:

```js
skapi.getRealtimeUsers({ group: "HelloWorld" }).then((res) => {
    console.log(res.list); // [{user_id: 'user_a', cid: 'user_cid'}, ...]
});
```

You can also search users in the group by their user ID.
This is useful if you want to check if the user is in the group.

```js
skapi
    .getRealtimeUsers({ group: "HelloWorld", user_id: "user_a" })
    .then((res) => {
        console.log(res.list); // [{user_id: 'user_a', cid: 'user_cid'}]
    });
```

For more detailed information on all the parameters and options available with the [`getRealtimeUsers()`](/api-reference/realtime/README.md#getrealtimeusers) method,
please refer to the API Reference below:

The list is what the service knows at that moment. A member whose connection broke without closing (a cable pulled, a phone that died) can stay listed for up to 10 minutes, unless a message is sent to them or they connect again, which removes the old entry at once. A page that must know who is really there should also watch the `notice` events and treat a member who has not been heard from as away.

### [`getRealtimeUsers(params?, fetchOptions?): Promise<DatabaseResponse<{ user_id:string; cid:string; }[]>>`](/api-reference/realtime/README.md#getrealtimeusers)
