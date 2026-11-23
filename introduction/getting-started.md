
# Getting Started

Skapi is a serverless backend API for web applications.

To build a full-stack web application, create a project, connect your codebase to it, and build on it: yourself, or with an AI coding agent that writes the code for you. This page follows that order, and ends with the optional MCP server that lets the agent run the project as well.


## Creating a Project

1. Sign up at [skapi.com](https://www.skapi.com) if you do not have an account yet.
2. Log in and [Create a new Project](https://www.skapi.com/new-project). If you are not signed in, the page sends you to log in first and brings you back to the project form once you are in.
3. Give your project a name, an optional description and a region, and click **Continue**.
4. Choose a plan and proceed.

An account that already has projects can also click **+ New Project** on its project list.

Your new project opens on its `Settings` page. The **Information** card holds the **Project ID**, the value every example in this documentation calls `<Project ID>`. Click it to copy it.

![The Settings page of a Skapi project: the Project card with its name and description, the Information card with the Project ID, Owner ID, Service ID, Region, creation date and a link to the documentation, and the top of the Plan & Usage card below](/screenshots/settings-page.webp)

*The Settings page of a project. The Project ID is on the Information card.*

The card at the end of the same page are worth knowing from day one: **Application Examples**. 

The **Application Examples** card lists plain HTML pages that already run against your project: User Account, Newsletter, Send Inquiry, Database, Realtime Chat and RTC Video Chat. Click **[Open]** on a row to run that page with your project ID already filled in, and see the backend at work before you write a line of code. Click **[Download]** on the last row to get every page as a ZIP file to study or build on. [Full Examples](/full-example/intro.md) walks through each page.

![The Application Examples card on a project's Settings page: an introduction line, one row per example page (User Account, Newsletter, Send Inquiry, Database, Realtime Chat, RTC Video Chat and Shared Drawing) with an Open link, and a Download the template row for the ZIP](/screenshots/settings-examples.webp)

*The Application Examples card at the end of the Settings page. Open runs a page against your project; Download gets all of them as a ZIP.*

:::tip For BunnyQuery users
[BunnyQuery](https://www.bunnyquery.com) projects are fully compatible with Skapi. Your project will appear in both your BunnyQuery and Skapi project lists.
:::

With the Project ID in hand, connect your codebase to the project below. If an AI coding agent writes your code, go on to [Building With Your AI Agent](#building-with-your-ai-agent): the agent sets the codebase up itself.


## Setting Up Your Codebase

Whether you write the code yourself or an AI coding agent writes it for you, this is the part that lives in your codebase: load the Skapi library, create one instance connected to your project, and build on it. Every other page of this documentation calls methods on that instance.

You need the **Project ID** of your project. It is on the project's `Settings` page, under **Information** (see [Creating a Project](#creating-a-project)). An AI agent takes it from your opening prompt (see [Building With Your AI Agent](#building-with-your-ai-agent)).

### For HTML Projects

For a vanilla HTML project, load Skapi with a script tag and initialize the library as shown below.
Add the Skapi script and initialize the `Skapi` class in the `<head>` of each page that uses Skapi.
Use your Skapi project's exact Project ID when initializing the library.

```html
<!-- index.html -->
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script>
    // Replace "<Project ID>" with your actual project ID
    const skapi = new Skapi("<Project ID>");
</script>
```

:::warning Replace the placeholder
`<Project ID>` is a placeholder, including the angle brackets.

Replace the entire placeholder with your actual Project ID from the Skapi dashboard. For example:

```js
const skapi = new Skapi("abc123defg456hij78-9klmnop012qrstu345vwxyz");
```

Every example in this documentation uses the same `"<Project ID>"` placeholder. Replace it wherever you copy an example.
:::

The Project ID uniquely identifies your Skapi project.


### For SPA Projects

To use Skapi in a single-page application (SPA) such as Vue, React, or Angular, install `skapi-js` with npm.

```sh
$ npm i skapi-js@latest
```

Then import the library in your main JavaScript file:

```javascript
// main.js
import { Skapi } from "skapi-js";
const skapi = new Skapi("<Project ID>");

export { skapi }

// You can now import skapi from anywhere in your project.
```

### For TypeScript Projects

Skapi includes TypeScript support, so you can import the `Skapi` class and related types.

```typescript
import { Skapi } from 'skapi-js';
import type { RecordData, DatabaseResponse } from 'skapi-js';

const skapi = new Skapi("<Project ID>");
let databaseRecords: DatabaseResponse<RecordData>;
```

For lists of types, refer [Data Types](/api-reference/data-types/README.md).

### Node.js (CommonJS)

Node.js here means a program you run with `node` in a terminal, such as a script or a command line tool. A web app built with Node.js tooling (Vite, webpack ...) runs in the browser: set it up as an SPA above.

To use Skapi in Node.js (CommonJS), import the library as shown below:

```javascript
const { Skapi } = require('skapi-js');
const skapi = new Skapi("<Project ID>");
```

### Node.js (ESM)

```javascript
import { Skapi } from 'skapi-js';
const skapi = new Skapi("<Project ID>");
```

In Node.js, skapi-js works the same as in the browser, except for the features that need a browser:

- **Realtime:** `connectRealtime()`, `postRealtime()`, `joinRealtime()` and `closeRealtime()` throw `NOT_SUPPORTED`.
- **WebRTC calls:** `connectRTC()` and `closeRTC()` throw `NOT_SUPPORTED`.
- **Web push notifications:** `subscribeNotification()`, `unsubscribeNotification()`, `vapidPublicKey()` and `pushNotification()` throw `NOT_SUPPORTED`.
- **HTML forms:** there is no form element or `SubmitEvent` to pass: pass plain objects. `getFormResponse()` has no form submit to read.
- **Files on a record:** files passed to `postRecord()` are not uploaded.
- **Record encryption:** the key is not remembered between runs. After a session is restored, call `unlockEncryption()` with the password.

The session is saved as files under `./states/localStorage/` in the working directory, so the next run starts signed in.

### Checking the Connection

After your client connects to Skapi, call [`getConnectionInfo()`](/api-reference/connection/README.md#getconnectioninfo) to retrieve information about the connection.

::: code-group
```html [HTML]
<!-- index.html -->
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script>
    const skapi = new Skapi("<Project ID>");
</script>
<script>
skapi.getConnectionInfo().then(info => {
    console.log(info);
    /*
    Returns:
    {
        project_id: "Public ID of the connected project",
        user_ip: "Connected user's IP address",
        user_agent: "Connected user's user agent",
        user_location: "Connected user's country code",
        service_name: "Your project name",
        service_description: "Your project description",
        version: 'x.x.x', // Skapi library version
        ai_agent: "AI agent instructions configured for the project",
        conf: {
            freeze_database: boolean, // The database is read-only
            prevent_signup: boolean, // Sign-up is blocked
            prevent_inquiry: boolean, // Inquiries are blocked
            prevent_anonymous: boolean, // Anonymous users cannot write to the database
            require_login: boolean, // Signed-out visitors cannot read the database (REQUIRE_LOGIN)
            anonymous_login: boolean // Visitors may sign in with a temporary account (anonymousLogin())
        },
        // Only when Skapi was created with the `encryption` option and a user is signed in:
        encryption_recovery: {
            code: "GDQ9-0MZS-X7AV-6YG5-8Z76-4CJ1-PWG0", // The user's encryption recovery code, on the first call
                                                    // after their first login with encryption on; null after that
            message: "This is your encryption recovery code. Save it now: it is shown only this once. ..."
        }
    }
    */
   window.alert(`Connected to ${info.service_name}`);
});
</script>
```

```javascript [SPA]
import { skapi } from '../location/of/your/main.js';
skapi.getConnectionInfo().then(info => {
    console.log(info);
    /*
    Returns:
    {
        project_id: "Public ID of the connected project",
        user_ip: "Connected user's IP address",
        user_agent: "Connected user's user agent",
        user_location: "Connected user's country code",
        service_name: "Your project name",
        service_description: "Your project description",
        version: 'x.x.x', // Skapi library version
        ai_agent: "AI agent instructions configured for the project",
        conf: {
            freeze_database: boolean, // The database is read-only
            prevent_signup: boolean, // Sign-up is blocked
            prevent_inquiry: boolean, // Inquiries are blocked
            prevent_anonymous: boolean, // Anonymous users cannot write to the database
            require_login: boolean, // Signed-out visitors cannot read the database (REQUIRE_LOGIN)
            anonymous_login: boolean // Visitors may sign in with a temporary account (anonymousLogin())
        },
        // Only when Skapi was created with the `encryption` option and a user is signed in:
        encryption_recovery: {
            code: "GDQ9-0MZS-X7AV-6YG5-8Z76-4CJ1-PWG0", // The user's encryption recovery code, on the first call
                                                    // after their first login with encryption on; null after that
            message: "This is your encryption recovery code. Save it now: it is shown only this once. ..."
        }
    }
    */
   window.alert(`Connected to ${info.service_name}`);
});
```
:::

The `Skapi` instance takes options too, from auto login to in-browser encryption and event listeners. They are on [Advanced Settings](/introduction/advanced-settings.md).


## Building With Your AI Agent

An AI can build your Skapi app for you, in one of two ways, depending on your AI app:

- **Your AI app supports MCP** (Claude, ChatGPT, Grok, Lovable, Cursor, Claude Code and most coding agents): connect the [Skapi MCP server](#connecting-the-skapi-mcp-server). The AI then works on your Skapi projects directly, signed in as you, and writes your app's code.
- **Your AI app has no MCP** (DeepSeek Chat, Microsoft Copilot, Poe and others): give it Skapi's [base prompt](#using-the-base-prompt). The AI then writes your app's code with every Skapi feature, and you set up the project yourself on the Skapi dashboard.

### Connecting the Skapi MCP server

The Skapi MCP server connects your AI app to your Skapi projects, signed in with your Skapi account. Everything you would do on the Skapi dashboard becomes a sentence in a prompt: create a Free plan project, change its settings, manage records and users, publish the website, write e-mail templates and newsletters, store secret keys, and register tickets and OpenID loggers. The server also gives the AI this documentation, so it writes your app's code too. It reaches only what your account can.

Add this address to your AI app as a remote MCP server, then sign in with your Skapi account:

**https://mcp.skapi.com**

The same address, opened in a browser, is the full guide: the steps for each AI app, connecting without a browser, what to ask, and troubleshooting.

**[Open the Skapi MCP guide](https://mcp.skapi.com)**

### Using the base prompt

The base prompt is one Markdown file that teaches an AI how to build with Skapi:

- **[SKAPI.md](https://docs.skapi.com/SKAPI.md)** (<a href="/SKAPI.md" download="SKAPI.md">download</a>), about 16 KB: the rules, a map of this documentation and an index of every SDK method. The map and the index link to each page under `https://docs.skapi.com/md/` (every page of this site as raw markdown, at the same path), and the AI opens a page when it builds that feature, so it needs to be able to open public web pages.
- **[SKAPI-full.md](https://docs.skapi.com/SKAPI-full.md)**, about 1.3 MB: the whole documentation in one file, for an AI that cannot open web pages. It is too large to paste, so attach it as a file, in an app that accepts files that size.

To use it:

1. Download the file.
2. Attach it to your chat, or save it in your project folder, where coding agents read it.
3. Ask the AI to use it as its base prompt, with your Project ID:

```text
Use SKAPI.md as your base prompt.
My Skapi project ID is "<Project ID>".
Build me a [describe what you want].
```

Replace the placeholder `<Project ID>` with your actual project ID before running your prompt. The Project ID is on the **Information** card of your project's `Settings` page (see [Creating a Project](#creating-a-project)).

With the base prompt alone, the AI writes the code and you do the project's own setup on the Skapi dashboard: secret keys, tickets, uploading the website and settings.

With the project created, the codebase connected and the agent set up, the rest happens in your code: every other page of this documentation calls methods on the `skapi` instance from [Setting Up Your Codebase](#setting-up-your-codebase).
