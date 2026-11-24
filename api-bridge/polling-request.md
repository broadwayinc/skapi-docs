
# Polling for the Result

Because third-party APIs can take time to respond, `forwardRequest()` uses a queue-and-poll model. Every call is queued on the server and you can poll for the result.

## Automatic polling with `poll`

Pass a `poll` interval (in milliseconds, `1000` or more) together with `onResponse` and `onError` callbacks. With `poll` greater than `0`, Skapi auto-generates a queue and starts polling automatically; the final result is delivered to `onResponse` once (and errors to `onError`), and the returned promise resolves with that same final result. The status object with a `poll()` method (`{ id, status, ... }`) is returned only when `poll` is omitted or `0`; in that case an `onResponse` you pass is called right away with that status object.

```js
skapi.forwardRequest({ model: 'gpt-image-1.5', prompt: 'A cute baby sea otter', n: 1, size: '1024x1024' }, {
    secretName: 'openai',
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer $CLIENT_SECRET'
    },
    poll: 2000,              // poll every 2 seconds
    onResponse(result) {
        console.log('Done:', result);
    },
    onError(err) {
        console.error('Failed:', err);
    }
});
```

## Manual polling with `poll()`

When `poll` is omitted or `0`, the promise resolves with the status object plus a `poll()` method. Call it whenever you are ready to start polling:

```js
const res = await skapi.forwardRequest({ model: 'gpt-image-1.5', prompt: 'A cute baby sea otter', n: 1, size: '1024x1024' }, {
    secretName: 'openai',
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer $CLIENT_SECRET'
    },
    queue: 'image-queue'
});

// res = { id, status: 'running', queue_name, in_queue, poll }
try {
    const result = await res.poll({ latency: 2000 }); // poll at 2-second intervals
    console.log('Done:', result);
}
catch (err) {
    console.error('Failed:', err);
}
```

This `poll()` takes `latency`, the interval in milliseconds (`1000` or more, default `1000`), and `onStream` for a [streamed request](/api-bridge/streaming-request.md). It resolves with the final result and rejects with the error, so read the outcome from the promise. The `poll()` on a [`forwardRequestHistory()`](/api-bridge/request-history.md) item also takes `onResponse` and `onError`, as shown below.

If your `onResponse` or `onError` throws, the error is printed to the console and the poll still settles as usual, so the next poll on the same queue is not held up.

The poll keeps going only while skapi reports the request as `running` or `pending`. Once it finishes, the poll resolves with the destination's answer, even when that answer has a `status` field of its own (an API that starts a job and replies `{ "status": "pending" }`, for example). Checking on that job is then up to you.

:::warning
Only requests with status `running` or `pending` can be polled.
A request enters `running` or `pending` only when either `params.queue` (queue name) or `params.poll` (poll interval) is provided.
:::

## When a read fails

A poll ends only with the **server's answer** (SDK 2.7.0 or newer). A read that fails on the way
is tried again on a later tick, so a laptop that sleeps, a Wi-Fi change or a short outage never turns
a request that is still running into an error:

- No network (`NETWORK_ERROR`), no answer in time (`TIMEOUT`), rate limited (`RATE_LIMITED` or
  `TOO_MANY_REQUESTS`), a server fault (`SERVER_ERROR`), or a sign-in token refresh that got no
  answer: the poll waits and reads again. The first retry is on the next tick, then the wait doubles
  each time, up to 30 seconds, and goes back to your interval as soon as a read gets through. A
  status message (`notify`) or the end of a stream reads at once, whatever the wait.
- The server refuses the sign-in token (`401`): the SDK refreshes the token once (it waits at most
  15 seconds for the refresh) and the poll carries on.
- No user is signed in any more (logged out, or the session ended): the poll sends nothing and
  waits; it reads on as soon as a user signs in again.
- The server's own refusal ends the poll and is what it rejects with (and hands to `onError`). A
  request that no longer exists (its history expired, or it was deleted) ends it with `NOT_EXISTS`.

So `onError` and a rejected poll mean the server said no, never that the network blinked. Requests
you make yourself fail with the same codes: these transport failures are `SkapiError`s with a
`code` (before 2.7.0 some of them were bare strings such as `'Network error'`; the messages are the
same words).

## One poll per request

A request has at most one poll (SDK 2.7.0 or newer). Starting `poll()` for a request that already has
one, or [`forwardRequestStream()`](/api-bridge/streaming-request.md#reading-a-request-you-did-not-start)
for it, stops the old one first: it resolves with `{ id, status: 'stopped' }` (see
[Handling a stopped poll](#handling-a-stopped-poll)) and its read in flight is aborted. So polling
again when the user comes back never piles a second poll on the first. Keep the promise of the
newest poll.

Polls of requests on one queue read one at a time, oldest request first, because the server runs
a queue one request at a time and in that order: the others wait their turn. When a poll of an
older request starts while a newer one is reading, the newer one steps aside until the older one is
done, then goes on where it left off. With `notify`, a poll still waiting its turn reads at once
when a status message names its request (see [Status push with notify](#status-push-with-notify)).

## How long the call actually took

`onResponse` receives a second argument, `meta`, carrying facts about the **request** rather than about the response. A settled poll resolves with the destination's own answer, and that answer belongs to the destination: there is nowhere in it to put a value of skapi's without changing what you asked for. So request-level facts arrive beside it instead.

`meta.executed` is when the worker **began running** the request, in milliseconds. Subtract it from the request's `updated` to time the call on its own. Polling a request from [`forwardRequestHistory()`](/api-bridge/request-history.md) hands it to you:

```js
const history = await skapi.forwardRequestHistory({
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST'
});

const item = history.list[0];

// Only a request that is still running or pending has a poll().
if (item?.poll) {
    item.poll({
        latency: 2000,
        onResponse(result, meta) {
            if (meta?.executed) {
                console.log('the call began at', new Date(meta.executed));
            }
            console.log('Done:', result);
        }
    });
}
```

Use `executed` rather than `created` when you are timing the destination. `created` is when the request was **queued**, and a queued request can sit there for a long time before a worker picks it up, so `updated - created` measures your own queue depth plus the call while `updated - executed` measures the call.

`meta.executed` is optional and can legitimately be absent, so branch on it rather than assuming it. The value rides on the status envelope that a **running** poll tick returns, so a request that began and finished between two ticks never showed one. When it is missing, show nothing: substituting `created` reports a queue backlog as though the destination had been slow. The value is on the request's own row either way, so a later [`forwardRequestHistory()`](/api-bridge/request-history.md) will still report it as `executed`.

A poll started from a `forwardRequestHistory()` item is the exception: it takes the execution start from the listing that produced it, so it can hand you `meta.executed` even when the request settles on the poll's very first read.

A callback that declares one parameter is unaffected, and `onResponse` on a direct, non-queued `forwardRequest()` receives no `meta`, since nothing ever recorded an execution start for a request that was never queued.


## Status push with `notify`

With `notify: true` (SDK 2.5.0 or newer) the server tells the signed-in user's browser each time a
queued request changes status. The poll then reads the request only when a change arrives, plus
once a minute, instead of at every interval, and the result shows up about a second after the
server has it.

```js
const result = await skapi.forwardRequest(null, {
    url: 'https://api.openai.com/v1/images/generations',
    secretName: 'openai',
    queue: 'image-queue',
    poll: 3000,
    notify: true,
});
```

- It needs a signed-in user and a queue. Without them, or when the server does not support it yet,
  the reply has no `notify: true` and the poll runs at its normal interval.
- The messages travel on skapi's websocket. One is opened while it is needed if your app has none,
  and closed 10 minutes after nothing uses it. A connection your app opened itself is used as it is,
  and these messages never reach your own realtime callback.
- A poll waiting behind another poll of the same queue reads its request as soon as a message
  names it, and settles if the request is done.
- The poll slows down only while messages are actually arriving. If the connection drops, it goes
  back to your interval at once. A message that is lost costs at most the once-a-minute read, never
  a wrong result: the poll always reads the request itself before it settles.

To hear about requests you hold no poll for, and to know when the connection comes back, listen
with `onRequestStatus()`:

```js
const stop = skapi.onRequestStatus((event) => {
    if (event.type === 'connected') {
        // Messages sent while the connection was down are not kept: read again what you show.
        refreshMyList();
        return;
    }
    if (event.type === 'status') {
        console.log(event.id, event.previous, '->', event.status);
    }
});

// later
stop();
```

### [`onRequestStatus(callback): () => void`](/api-reference/api-bridge/README.md#onrequeststatus)

### [`isRequestStatusLive(): boolean`](/api-reference/api-bridge/README.md#isrequeststatuslive)

## Reading many requests at once

An app that shows several requests as unfinished can ask where all of them stand in one call with
`forwardRequestStatus()` (SDK 2.7.0 or newer), for example when the page comes back from sleep or
another tab. It is a light read, without bodies, and asks the server about up to 100 requests per
call (more are sent 100 at a time). The list comes back in the order you asked:

```js
const url = 'https://api.openai.com/v1/images/generations';

const { list } = await skapi.forwardRequestStatus(
    myOpenRequests.map((id) => ({ id, url, method: 'POST' })),
    { deadline: 15000 } // give up after 15 seconds with TIMEOUT
);

for (const item of list) {
    // item.status: 'pending' | 'running' | 'resolved' | 'failed' | 'cancelled' | 'missing'
    if (item.status === 'resolved' || item.status === 'failed') {
        const full = await skapi.forwardRequestRead({ id: item.id, url, method: 'POST', since: 0 });
        show(item.id, full.body, full.error);
    }
    else if (item.status === 'missing') {
        // This user cannot see such a request: it expired, was deleted, or was never sent.
    }
}
```

`missing` takes the place of an error for a request this user cannot see, so one gone request does
not fail the whole call. `has_body` says a result is stored, and on a finished streamed request
`final_seq` is its last piece (`forwardRequestRead()` also tells how far the text has got, as
`last_seq`).

Each status read costs about as much as reading the whole request, so for frequent checks read the
queue counters first with `forwardRequestQueueCounters()`. They are a few bytes per queue: `rct`
grows whenever a request on the queue finishes and `seq` whenever one is added, so read the requests
themselves only when one of them moved:

```js
const { queues } = await skapi.forwardRequestQueueCounters(['image-queue'], { deadline: 15000 });
const c = queues['image-queue'];
if (!last || c.rct !== last.rct || c.seq !== last.seq) {
    // something finished or was added: read the requests
}
last = c;
```

`forwardRequestRead()` reads one request in full and always answers in the same shape,
`{ id, status, body?, error?, ... }`. Unlike a poll it never hands back the bare body, so the status
is always there to read. With `since` (a chunk number, `0` for the beginning) it also returns a
streamed request's text after that point, with `more: true` when there is more than one read
returns, including the text a failed stream got before it failed. `body_unavailable: true` means a
result is stored but could not be loaded this time: read again later.

Both are fresh reads by default: they never join an identical read that is already on its way (one
sent before a sleep could be waiting for an answer that will not come). Both take `deadline`, the
milliseconds the call may take in all (a sign-in token refresh and the wait in the queue included),
after which it fails with `TIMEOUT`, and `signal`, an `AbortSignal` that fails it with `ABORTED`.
`forwardRequestHistory()` takes the same three options.

### [`forwardRequestStatus(requests, opts?): Promise<{ list: ForwardRequestStatus[] }>`](/api-reference/api-bridge/README.md#forwardrequeststatus)

### [`forwardRequestRead(params): Promise<ForwardRequestEnvelope>`](/api-reference/api-bridge/README.md#forwardrequestread)

## Finding a request whose reply was lost

If the network drops while `forwardRequest()` is sending, the request may have reached the server
even though the reply never came back. Sending it again would run it twice. Give each request your
own reference, `cref` (1 to 64 letters, digits, `_` or `-`, a new one per request), and keep it
before you send:

```js
const cref = crypto.randomUUID();
saveLocally({ cref, text });

const res = await skapi.forwardRequest(null, {
    url: 'https://api.openai.com/v1/images/generations',
    secretName: 'openai',
    queue: 'image-queue',
    cref,
});
// res.cref === cref
```

The request is stored with it, and the reply, [`forwardRequestHistory()`](/api-bridge/request-history.md),
`forwardRequestStatus()` and `forwardRequestRead()` all hand it back. When a send failed with no
reply, list the queue with `fields: 'ids'` (only ids, statuses, times and `cref`, no bodies) and look
for your `cref` before sending again:

```js
const history = await skapi.forwardRequestHistory({
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST',
    queue: 'image-queue',
    fields: 'ids',
});
const sent = history.list.find((item) => item.cref === cref);
```

`after: '<request id>'` lists only the requests newer than one you already know.

## Stopping Polling

Polling and the request itself are separate things. `stopForwardRequestPolling()` stops *watching* a
request; the server keeps working on it, and you can pick the result up later.

This matters because polling is real network traffic. A long-running request polled every second keeps
issuing calls for as long as it takes, whether or not anyone is looking at the result. Stop polling when
the user navigates away or the tab is hidden, and start again when they come back.

```js
// Stop watching one request. It keeps running on the server.
skapi.stopForwardRequestPolling({
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST',
    id: 'stamp:entropy'   // the id from the forwardRequest response
});

// Stop every poll on a queue.
skapi.stopForwardRequestPolling({ queue: 'image-queue' });

// Stop everything this client is polling.
skapi.stopForwardRequestPolling();
```

Each call returns how many polls it stopped. A poll's read that is on its way when it stops is
aborted (SDK 2.7.0 or newer), so a stopped poll holds no connection and no place in the queue.

### Handling a stopped poll

A stopped poll **resolves** with `{ id, status: 'stopped' }` rather than rejecting, so `await` sites do
not need a `catch`. Its `onResponse` and `onError` callbacks are **not** called, because a stop is not a
result. Use `isPollStopped()` to tell the two apart:

```js
const res = await skapi.forwardRequest(null, { /* ... */ });

const result = await res.poll({ latency: 2000 });

if (skapi.isPollStopped(result)) {
    // We stopped watching. Nothing failed, and the request may still be running.
    return;
}

console.log('Done:', result);
```

### Resuming

There is nothing to resume, as such: just poll again. Fetch the request from
[`forwardRequestHistory()`](/api-reference/api-bridge/README.md#forwardrequesthistory) and call
`poll()` on it. If it finished while you were not watching, the history entry already carries the result.

```js
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        skapi.stopForwardRequestPolling({ queue: 'image-queue' });
    }
});
```

### [`stopForwardRequestPolling(params?): number`](/api-reference/api-bridge/README.md#stopforwardrequestpolling)

### [`isPollStopped(res): boolean`](/api-reference/api-bridge/README.md#ispollstopped)

:::tip
Requests sharing a queue are polled **one at a time**, because the server runs them one at a time. A
request that never settles therefore holds up every poll queued behind it, so stopping it also
unblocks the rest. Stopping a request that has not started yet removes it from the queue entirely,
freeing the slot immediately. Polls waiting on one queue go **oldest request first** (SDK 2.7.0 or
newer), the order the server runs them in, even when you start them newest first (as a history page
lists them).
:::

## Cancelling a Request

To cancel a pending request before it is processed, call [`cancelForwardRequest()`](/api-reference/api-bridge/README.md#cancelforwardrequest):

```js
const result = await skapi.cancelForwardRequest({
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST',
    id: 'stamp:entropy',  // the id from the forwardRequest response
    queue: 'image-jobs'   // required if the request was submitted with a queue name
});

console.log(result.removed); // true if successfully removed
```

Provide `queue` when the original request was submitted with a queue name. This removes the pending job from the client-side queue in addition to cancelling it on the server. If a poll for that request is still waiting its turn in the queue, it ends right away and resolves with `{ id, status: 'stopped' }`, the same as a [stopped poll](#handling-a-stopped-poll). Only that request's own queued job is removed: the other requests in the queue keep their place.

:::info
`cancelForwardRequest()` cancels the **request**. [`stopForwardRequestPolling()`](#stopping-polling)
only stops **watching** it: the request carries on, and its result stays available. Use cancel when the
work is no longer wanted, and stop-polling when only the traffic is.
:::

### [`cancelForwardRequest(params): Promise<{ removed: boolean; message: string }>`](/api-reference/api-bridge/README.md#cancelforwardrequest)


## Checking Queue Size

To check how many requests are currently waiting in a named queue, use [`forwardRequestQueueCount()`](/api-reference/api-bridge/README.md#forwardrequestqueuecount):

```js
const info = await skapi.forwardRequestQueueCount({ queue: 'image-jobs' });
console.log(info.in_queue); // number of requests waiting
```

### [`forwardRequestQueueCount(params): Promise<{ queue_name: string; in_queue: number }>`](/api-reference/api-bridge/README.md#forwardrequestqueuecount)