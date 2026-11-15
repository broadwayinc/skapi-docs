# Two-Step Login (MFA)

Users can protect their account with an authenticator app. Once it is turned on, logging in takes two steps: the password, then a 6 digit code from the app on their phone. Someone who learns the password still cannot log in without the phone.

It is optional and each user decides for their own account. Any authenticator app works: an app that shows 6 digit codes that change every 30 seconds.

Codes are never sent by SMS.

## Turning it on

Turning it on takes two calls: [`setupMFA()`](/api-reference/authentication/README.md#setupmfa) gives a code to scan, and [`enableMFA()`](/api-reference/authentication/README.md#enablemfa) checks that the app works before switching it on.

### Step 1: Show the QR code

The user must be logged in. [`setupMFA()`](/api-reference/authentication/README.md#setupmfa) returns:

- `uri`: an `otpauth://` link. Show it as a QR code (any QR code library can draw one) for the user to scan with their authenticator app.
- `secret`: the same key as text, for users who type it into the app instead of scanning.

```js
skapi.setupMFA().then(({ uri, secret }) => {
    // Draw `uri` as a QR code, and show `secret` for manual entry.
    console.log(uri); // otpauth://totp/My%20Project:user%40email.com?secret=...&issuer=My%20Project&...
});
```

The app lists the account under your project name and the user's e-mail. To show other names, pass `issuer` (the name shown in the app) and `account_name` (the account label):

```js
skapi.setupMFA({ issuer: 'My App', account_name: 'ana' });
```

### Step 2: Confirm a code

The user types the code the app now shows. [`enableMFA()`](/api-reference/authentication/README.md#enablemfa) checks it and turns two-step login on.

::: code-group

```html [Form]
<form onsubmit="skapi.enableMFA(event).then(r => alert(r)).catch(err => alert(err.message))">
    <label>
        Code from your authenticator app<br />
        <input name="code" inputmode="numeric" autocomplete="one-time-code" required />
    </label>
    <input type="submit" value="Turn on" />
</form>
```

```js [JS]
skapi.enableMFA({ code: '123456' }).then((res) => {
    console.log(res); // 'SUCCESS: MFA has been enabled.'
});
```

:::

A wrong code answers `INVALID_CODE` and nothing changes, so the user can try the next code. Calling `enableMFA()` without `setupMFA()` first answers `INVALID_REQUEST` (`Call setupMFA() first.`).

## Logging in with a code

When two-step login is on, [`login()`](/api-reference/authentication/README.md#login) checks the password and then rejects with the code `MFA_REQUIRED`. The user is not logged in yet. Ask for the code from the app and pass it to [`verifyMFA()`](/api-reference/authentication/README.md#verifymfa), which finishes the login and returns the [`UserProfile`](/api-reference/data-types/README.md#userprofile), just like a normal `login()`.

```js
async function logIn(email, password) {
    try {
        return await skapi.login({ email, password });
    }
    catch (err) {
        if (err.code !== 'MFA_REQUIRED') throw err;
        // Show a code field, then:
        let code = prompt('Code from your authenticator app');
        return await skapi.verifyMFA({ code });
    }
}
```

With HTML forms, show a second form for the code when the login form fails with `MFA_REQUIRED`:

```html
<form id="login" action="welcome.html"
    onsubmit="skapi.login(event).catch(err => {
        if (err.code === 'MFA_REQUIRED') { login.hidden = true; mfa.hidden = false; }
        else alert(err.message);
    })">
    <input type="email" name="email" required />
    <input type="password" name="password" required />
    <input type="submit" value="Login" />
</form>

<form id="mfa" hidden action="welcome.html"
    onsubmit="skapi.verifyMFA(event).catch(err => alert(err.message))">
    <input name="code" inputmode="numeric" autocomplete="one-time-code" required />
    <input type="submit" value="Verify" />
</form>
```

Things to know:

- **3 minutes.** Call `verifyMFA()` within 3 minutes of `login()`. After that it answers `INVALID_REQUEST` (`The sign-in has expired. Call login() again.`).
- **Same page.** The waiting login is kept in memory only, never saved. If the page reloads between the two steps, call `login()` again.
- **Wrong code.** `INVALID_CODE` (`Incorrect authenticator code.`) can be retried with the next code. A code that was already used answers `INVALID_CODE` too: wait for the app to show a new one.
- [`openIdLogin()`](/api-reference/authentication/README.md#openidlogin) works the same way: it rejects with `MFA_REQUIRED` when the account has two-step login on, and `verifyMFA()` finishes it (returning the `UserProfile` alone, without the `openid` value).

## Checking and turning it off

[`getMFAStatus()`](/api-reference/authentication/README.md#getmfastatus) tells whether the logged-in user has it on, for example to show the right button on a settings page.

```js
skapi.getMFAStatus().then(({ enabled }) => {
    console.log(enabled); // true or false
});
```

[`disableMFA()`](/api-reference/authentication/README.md#disablemfa) turns it off. The next login takes the password alone.

```js
skapi.disableMFA().then((res) => {
    console.log(res); // 'SUCCESS: MFA has been disabled.'
});
```

## Lost phone

[Resetting the password](/authentication/forgot-password.md) does **not** turn two-step login off, so a user who lost their phone cannot log in on their own. An admin of your project turns it off for them with [`disableUserMFA()`](/admin/account.md#turning-off-a-user-s-mfa); the user then logs in with their password and can set it up again.

## Anonymous accounts

A temporary account made with [`anonymousLogin()`](/authentication/anonymous-login.md) cannot use two-step login: `setupMFA()`, `enableMFA()`, `disableMFA()` and `getMFAStatus()` answer `INVALID_REQUEST` with a message starting with `Anonymous accounts cannot`.
