
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

Two cards at the end of the same page are worth knowing from day one: **Application Examples** and **For AI Agents**.

The **Application Examples** card lists plain HTML pages that already run against your project: User Account, Newsletter, Send Inquiry, Database, Realtime Chat and RTC Video Chat. Click **[Open]** on a row to run that page with your project ID already filled in, and see the backend at work before you write a line of code. Click **[Download]** on the last row to get every page as a ZIP file to study or build on. [Full Examples](/full-example/intro.md) walks through each page.

![The Application Examples card on a project's Settings page: an introduction line, one row per example page (User Account, Newsletter, Send Inquiry, Database, Realtime Chat, RTC Video Chat and Shared Drawing) with an Open link, and a Download the template row for the ZIP](/screenshots/settings-examples.webp)

*The Application Examples card at the end of the Settings page. Open runs a page against your project; Download gets all of them as a ZIP.*

The **For AI Agents** card downloads the base prompt for your AI coding tool (see [Building With Your AI Agent](#building-with-your-ai-agent) below).

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

> **Note:** When running Skapi in Node.js, browser-specific features such as WebSocket, WebRTC, and Notifications are unavailable.

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
            prevent_anonymous: boolean // Anonymous users cannot write to the database
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
            prevent_anonymous: boolean // Anonymous users cannot write to the database
        }
    }
    */
   window.alert(`Connected to ${info.service_name}`);
});
```
:::

The `Skapi` instance takes options too, from auto login to in-browser encryption and event listeners. They are on [Advanced Settings](/introduction/advanced-settings.md).


## Building With Your AI Agent

Skapi works smoothly with AI coding tools, such as Claude Code, Codex CLI, Gemini CLI, GitHub Copilot, Cursor and Windsurf.

There are two ways an AI agent can help you build on Skapi, and they work well together:

- A **base prompt** in your project teaches the agent how to write code against the Skapi API.
- The **Skapi MCP server** lets the agent work on your project itself: your database, your settings, your tickets, your secret keys and more, signed in as you.

### Download the base prompt for your tool

Every tool reads the same file under its own name. Pick your tool, and the file downloads with the name it expects.

<AgentPromptDownloads />

You can also download the plain <a href="/SKAPI.md" download="SKAPI.md">SKAPI.md</a> and rename it yourself.

The file is small on purpose, about 25 KB: the rules, a map of this documentation and an index of every SDK method, each linking to its page. The agent reads a page when it builds the feature, from `https://docs.skapi.com/md/` (every page of this site is there as raw markdown, at the same path), so a session carries only the pages it needs. If your agent cannot fetch urls, allow it access to `docs.skapi.com`, or connect the [Skapi MCP server](#connecting-the-skapi-mcp-server): its `readDocs` tool returns the same pages. A tool that indexes one document can take the whole documentation as a single file, [SKAPI-full.md](https://docs.skapi.com/SKAPI-full.md); it is too large to paste into a chat.

Your project's `Settings` page at [skapi.com](https://www.skapi.com) offers the same downloads under **For AI Agents**, next to the opening prompt with your project ID already filled in. Click **[Download]** on the row of your tool, and click the prompt to copy it.

![The For AI Agents card on a project's Settings page: the opening prompt with the project ID filled in, and one Download row per tool, from Claude Code to Windsurf](/screenshots/settings-agents.webp)

*The For AI Agents card on the Settings page. The file is the same for every tool; only its name differs.*

### Put the file in your project folder

Save the base prompt file in your project's root folder, where your agent reads it, or attach the file directly to your agent's prompt input, which is how a chat platform takes it.

Browsers drop the leading dot from a download name, so `.cursorrules` and `.windsurfrules` are saved as `cursorrules` and `windsurfrules`. Add the dot back after saving.

### Open your agent and start building

Open your AI coding agent in that folder and start with a prompt like this:

```text
My Skapi project ID is: "<Project ID>".
Build me a [describe what you want].
```

Replace the placeholder `<Project ID>` with your actual project ID before running your prompt. The Project ID is on the **Information** card of your project's `Settings` page (see [Creating a Project](#creating-a-project)).

## Connecting the Skapi MCP server

**Connecting the MCP server is optional.** The base prompt above is all an agent needs to write your application's code, and your application never talks to the MCP server.

What the server adds is the **administrative side** of a project, the work you would otherwise do by hand on the Skapi dashboard: it connects the agent to your Skapi projects, signed in as you, so it can register the tickets and secret keys an integration needs, set up OpenID sign-in, change the project's settings, publish the website, read and fix records, and manage the project's users, from invitations to access groups. Each of those becomes a sentence in a prompt instead of a form. Skip this section if you only want help writing code, and come back when a feature needs something set up on the project.

1. Add this MCP endpoint to your AI platform:

   **https://mcp.broadwayinc.computer**

2. Choose OAuth. No client ID or client secret is needed.

3. Sign in with your Skapi account when the platform asks. The server answers nothing until you have signed in, so a platform that lists it as needing authentication is waiting for that sign-in; see [Signing in](#signing-in).

Any platform that speaks MCP works. The endpoint is the same everywhere; only the place you put it differs.

### Coding agents

Each of these opens your browser to sign you in with your Skapi account. Leave any client ID or client secret field empty.

The steps below were checked against each tool's own documentation in November 2026. Every tool does this a little differently and changes as it updates: if a step does not match what you see, follow the tool's own MCP guide. The endpoint and the Skapi sign-in stay the same.

::: code-group

```sh [Claude Code]
claude mcp add --transport http skapi https://mcp.broadwayinc.computer
claude mcp login skapi
```

```sh [Codex CLI]
codex mcp add skapi --url https://mcp.broadwayinc.computer
```

```sh [Gemini CLI]
gemini mcp add --transport http -s user skapi https://mcp.broadwayinc.computer
```

```json [Cursor]
{
  "mcpServers": {
    "skapi": {
      "url": "https://mcp.broadwayinc.computer"
    }
  }
}
```

```json [VS Code / Copilot]
{
  "mcpServers": {
    "skapi": {
      "type": "http",
      "url": "https://mcp.broadwayinc.computer",
      "tools": ["*"]
    }
  }
}
```

```json [Devin Desktop]
{
  "mcpServers": {
    "skapi": {
      "url": "https://mcp.broadwayinc.computer"
    }
  }
}
```

:::

| Tool | Where it goes | Signing in |
| --- | --- | --- |
| Claude Code | The command above. Add `--scope user` to have the server in every project. | `claude mcp list` shows the server as **Needs authentication** until you sign in. Run `claude mcp login skapi`, or `/mcp` in a session, pick **skapi** and choose **Authenticate**. |
| Codex CLI | The command above writes `[mcp_servers.skapi]` with `url` into `~/.codex/config.toml`, for every project. | Starts as soon as the command runs. Sign in again later with `codex mcp login skapi`. |
| Gemini CLI | The command above. `-s user` puts it in every project; without it, only this one. | Run `/mcp auth skapi` in a session. Since June 2026, free, Google One and AI Pro/Ultra accounts use **Antigravity CLI** instead: add the server in `/mcp`, or in `~/.gemini/config/mcp_config.json` with `"serverUrl": "https://mcp.broadwayinc.computer"`. Sign-in starts by itself there. |
| Cursor | `~/.cursor/mcp.json` for every project, or `.cursor/mcp.json` in one. Turn it on or off from **Customize** in the sidebar. | Cursor opens the sign-in page in your browser. |
| VS Code with GitHub Copilot | Command Palette, **MCP: Add Server** (or **Chat: Open Customizations > MCP Servers > +**): choose **HTTP**, paste the endpoint, name it `skapi` and choose **Global > Copilot Global**. That writes `~/.copilot/mcp-config.json`, shown above, which Copilot CLI reads too. The older `.vscode/mcp.json` format (`"servers"`) works until February 2027. | Sign in when asked, or use **Authenticate** in the server's actions. On Copilot Business and Enterprise, an admin must turn on the **MCP servers in Copilot** policy. |
| Devin Desktop (formerly Windsurf) | **Customize** in the agent sidebar, **MCPs** tab, or `~/.config/devin/mcp_config.json`, shown above. The Devin CLI takes `devin mcp add -s user skapi https://mcp.broadwayinc.computer`. | Click **Authenticate** when it shows **Needs authentication**, or run `devin mcp login skapi`. |
| Zed | **Settings > AI > MCP Servers > Add Server > Add Remote Server**, or `"context_servers": { "skapi": { "url": "https://mcp.broadwayinc.computer" } }` in `settings.json`. | Zed asks you to sign in. |
| JetBrains Junie | **Settings \| Tools \| Junie \| MCP Settings**, or `~/.junie/mcp/mcp.json` with `mcpServers` and `url`, as for Cursor. | Choose **Authorize** when it says **Authorization required**. |
| JetBrains AI Assistant | **Settings \| Tools \| AI Assistant \| Model Context Protocol (MCP)**, then **Add**. | Cannot sign in with OAuth yet: use an [access token](#signing-in-without-a-browser). |
| Cline | In the Cline panel, the **MCP Servers** icon, **Remote Servers** tab: name, endpoint, and **Transport Type** set to **Streamable HTTP**. In its JSON file, set `"type": "streamableHttp"`; without it Cline uses the older SSE transport. | Sign in when asked. |
| Kiro | `~/.kiro/settings/mcp.json` with `mcpServers` and `url`, as for Cursor. | Kiro opens the sign-in page itself. |
| Amp | `amp mcp add skapi https://mcp.broadwayinc.computer` | The sign-in page opens when Amp starts. |
| opencode | `opencode mcp add skapi --url https://mcp.broadwayinc.computer` | `opencode mcp auth skapi` |

### Chat platforms on the web

A web platform has no command line, so the server is added in its settings instead.

- **Claude** (claude.ai, the desktop app and Cowork): open **Customize > Connectors**, click **+ Add**, then **Add custom connector**. Enter a name and the endpoint, click **Continue** twice, keep sign-in on with **Register automatically** as the OAuth client, click **Add**, then **Connect** and sign in. In a chat, turn it on under **+ > Connectors**. Every plan can add custom connectors; Free allows one. On Team and Enterprise an Owner adds it under **Organization settings > Connectors** (**Add > Custom > Web**), and every member clicks **Connect** under **Customize > Connectors**. Once added on the web or desktop, the mobile apps have it too.
- **ChatGPT**: open **chatgpt.com/plugins**, click **+**, then **Add custom MCP server**. Enter a name, paste the endpoint as the **Server URL** and choose **OAuth**, accept the warning, click **Create as a plugin**, then install it from your plugins. In a chat, type **@** and pick it, and sign in when asked. Developer mode is no longer needed. It is set up on the web only; Business and Enterprise/Edu get full use (on Business, admins and owners add it), and Pro connects with read and fetch only.

Other platforms follow the same pattern: add a remote MCP server by its URL in the settings page or the config file. Wherever a platform asks for a transport, choose **Streamable HTTP**; wherever it asks how to authenticate, choose **OAuth**.

Then tell the agent which project to work on:

```text
Use my Skapi project "<Project ID>".
```

You can also ask it to list your projects and pick one. If you have no project yet, or want a new one for the service you are building, the agent can create it on the Free plan: it asks you for the project's name, an optional description and the region, then gives you the new Project ID. A project on a paid plan from the start is created on the [project form](https://www.skapi.com/new-project) instead.

### Signing in

The server signs you in with OAuth, using your Skapi account. Your platform registers itself with the server and proves each sign-in with PKCE, so there is no client ID or client secret to enter anywhere.

- **Nothing works before you sign in.** The server refuses every request that carries no sign-in, the first connection included. That refusal is what makes a platform open the sign-in page, and until you finish it the platform shows the server as needing authentication and the agent sees none of its tools.
- **The sign-in renews itself.** The platform refreshes it in the background while you use it. If the agent has not used the server for about 30 days, the platform asks you to sign in again.
- **The agent acts as you.** It reaches only the projects and data your account can reach; see [What the MCP server can do for you](#what-the-mcp-server-can-do-for-you).

If a tool answers **Unauthorized**, the platform shows the server as **Needs authentication**, or it reports an incompatible authorization server, it is not signed in or holds a connection made before the current sign-in. Sign in again the way your tool does it (checked against each tool's documentation in November 2026):

| Tool | Sign in again |
| --- | --- |
| Claude (web, desktop) | **Customize > Connectors**, open skapi and click **Connect**. |
| ChatGPT | Open the plugin at **chatgpt.com/plugins** and sign in again. |
| Claude Code | `claude mcp login skapi`, or `/mcp` in a session, pick **skapi** and choose **Authenticate**. |
| Codex CLI | `codex mcp login skapi` |
| Gemini CLI | `/mcp auth skapi` in a session |
| GitHub Copilot CLI | `/mcp auth` in a session, then pick skapi |
| Cursor | **Customize** in the sidebar, then the sign-in button on skapi |
| VS Code | **Authenticate** in the skapi server's actions |
| Devin Desktop, Devin CLI | **Authenticate** on the server, or `devin mcp login skapi` |
| Zed | The sign-in prompt on the server in **Settings > AI > MCP Servers** |
| JetBrains Junie | **Authorize** on the server |
| Cline | Sign in when asked; in Cline CLI, `cline mcp` and **Authorize OAuth** |
| Kiro | **Re-authenticate** in the MCP panel, or `/mcp auth` in Kiro CLI |
| opencode | `opencode mcp auth skapi` |
| Amp | `amp mcp oauth logout skapi`, then start Amp again |

With an access token, the token was revoked or has expired: create a new one on the [token page](#signing-in-without-a-browser) and replace it. If nothing helps, remove the server and add it again.

### Signing in without a browser

The sign-in above opens a browser. On a machine that has none, over SSH, in a container, in continuous integration or in a script, there are two ways in.

**An access token you set as a header.** This works in every tool that can send a header. You create the token by hand, once, on any device with a browser, at the MCP server's token page:

**[https://mcp.broadwayinc.computer/connect](https://mcp.broadwayinc.computer/connect)**

Open it in any browser (`https://www.skapi.com/mcp` is a shortcut to the same page). It runs the same Skapi sign-in a platform would open, then lets you create tokens. The steps:

1. Open the page and sign in with your Skapi account.
2. Click **Create token**, and optionally label it so you can tell your machines apart.
3. Copy the token. It starts with `skmcp_` and is shown once, right then, never again.
4. Give it to your tool as the `Authorization: Bearer` header. The `/connect` page prints the whole entry for each tool; the commands are:

::: code-group

```sh [Claude Code]
claude mcp add --transport http skapi https://mcp.broadwayinc.computer \
  --header "Authorization: Bearer skmcp_YOUR_TOKEN"
```

```sh [Codex CLI]
export SKAPI_MCP_TOKEN=skmcp_YOUR_TOKEN
codex mcp add skapi --url https://mcp.broadwayinc.computer --bearer-token-env-var SKAPI_MCP_TOKEN
```

```sh [Gemini CLI]
gemini mcp add --transport http -s user \
  -H "Authorization: Bearer skmcp_YOUR_TOKEN" skapi https://mcp.broadwayinc.computer
```

```sh [Copilot CLI]
copilot mcp add --transport http skapi https://mcp.broadwayinc.computer \
  --header "Authorization: Bearer skmcp_YOUR_TOKEN"
```

```sh [Devin CLI]
devin mcp add -s user skapi https://mcp.broadwayinc.computer \
  -H "Authorization: Bearer skmcp_YOUR_TOKEN"
```

```sh [Cline CLI]
cline mcp add skapi https://mcp.broadwayinc.computer --transport http \
  --header "Authorization: Bearer skmcp_YOUR_TOKEN" --yes
```

```json [Config file]
"skapi": {
  "url": "https://mcp.broadwayinc.computer",
  "headers": { "Authorization": "Bearer skmcp_YOUR_TOKEN" }
}
```

:::

The config file form fits Cursor, VS Code, Devin Desktop, Zed, JetBrains, Cline, Kiro and Amp: add `headers` next to the server's address. On claude.ai, a token goes under **Request headers** when adding the connector, with sign-in set to **No sign in**; only some organizations have that option yet. ChatGPT does not take tokens.

**A command-line sign-in that prints a link.** A few tools print a sign-in link you open on another device:

- **Claude Code:** `claude mcp login skapi --no-browser`. Open the link on any device, sign in, and paste the full address from that browser's address bar back into the terminal. It needs a real terminal, so over SSH connect with `ssh -t`.
- **Codex CLI:** `codex mcp login skapi --no-browser`, then the same: open the link, sign in, and paste the address back.
- **opencode:** `opencode mcp auth skapi`. After you sign in, the browser lands on a page that fails to load: copy its address and paste it into the prompt.
- **Amp:** start `amp`, open the sign-in page on another device, then copy the address of the page that fails to load and paste it into Amp's dialog.

Gemini CLI, Antigravity CLI, Devin, Kiro, Cline and Copilot CLI have no such option today; use an access token with them.

The token acts as you, with everything your account can reach, for as long as that sign-in lasts or until you revoke it. Return to the same page any time to see your tokens and revoke one. A platform set up with a token never opens the sign-in page; when you revoke the token it reports the server as unauthorized until you give it a new one. Keep the token as secret as a password.

### What the MCP server can do for you

Everything below runs with the permissions of the signed-in account, so the agent can only reach what you can, and every change it makes is one you could have made on the dashboard yourself. Your Skapi account, the project owner, gets all of it. An admin of the project (a user in access group `90` ~ `99`) who signs in through the server gets the user management tools, under the same rules the app applies to admins; see [Admin Permissions](/admin/permissions.md).

- **Projects** (your Skapi account only). Create a new project on the Free plan, with the name, description and region you give the agent. When the project later reaches a limit of the Free plan, the agent gives you the link to its plan page, `https://www.skapi.com/subscription/<the project's id>`, where you upgrade it.
- **Users.** Search the project's users, and manage their accounts the way the dashboard's Users page does: send, resend, cancel and list invitations, create accounts, grant access groups, update profiles, and block, unblock or delete accounts. The agent asks before it blocks or deletes. An invitation is an e-mail and counts as one of the project's monthly e-mail sends, resends included; see [Inviting Users](/admin/invite.md) and [Managing Users](/admin/account.md). It also lists and searches newsletter subscribers; see [Managing subscribers](/email/newsletters.md#managing-subscribers).
- **Tickets.** Register the endpoints that accept a webhook from your payment provider, a link, or a signed-in request, with their conditions, placeholders, actions and error handling, and read their logs afterwards. See [Registering a Ticket](/tickets/introduction.md).
- **Secret keys.** Store the API keys of the third-party services your project calls, so your front end never holds them, and limit the URLs each key may be sent to. See [Secret Keys](/api-bridge/client-secret-request.md).
- **OpenID loggers.** Set up sign-in through an external identity provider, including the profile request, the header it needs and a condition on who may sign in, such as one e-mail domain. See [OpenID Login](/authentication/openid-login.md).
- **Database.** Read, search, create, update and delete records. List tables, tags, indexes and unique IDs, and find any of them by how its name starts or ends. It can also read the files attached to a record and give you a download link for them, but it cannot attach a file to a record or remove one: a record sent with files to attach or remove is refused and not saved, while the other records in the same request are still saved. Attach and remove a record's files in the Skapi dashboard (Database page) or with the SDK. Deleting a record still deletes the files attached to it, as it does everywhere else.
- **Project settings.** Turn sign-ups or inquiries on and off, restrict anonymous writes, set the [SMS text](/email/email-templates.md#the-sms-text-for-phone-verification) that verifies a phone number, and change the other settings of the project.
- **Hosting.** Register a web address, then upload, edit and delete the files of your project's website.
- **E-mails** (project owner only). Compose an automated e-mail template, of any type, or a newsletter, and upload it as e-mail HTML or as plain text, with the same checks the dashboard makes (e-mail HTML, the type's required placeholders, the size), and create a [named newsletter group](/email/newsletters.md#creating-a-named-group). Nothing is switched on or sent for you: an uploaded template is added to its list and you put it in use on the Automated Emails page, and an uploaded newsletter is saved without sending until you send it from the Newsletters page or a ticket's Send newsletter action names it; the agent gives you the page for each. A custom template is sent when a ticket's Send e-mail action names it. Automated e-mails and newsletters go out from the project's email alias, so register one on the project's Settings page first; the agent tells you when it is missing. See [Uploading a template](/email/email-templates.md#uploading-a-template) and [Uploading a newsletter](/email/newsletters.md#uploading-a-newsletter).
- **What stays on the dashboard.** Some things only the project owner does, by hand, on [skapi.com](https://www.skapi.com): creating a project on a paid plan, enabling, disabling or deleting a project, plans and billing, changing or removing a registered subdomain, the sender e-mail address (email alias), putting an e-mail template in use, deleting an e-mail template or going back to the default one, sending or deleting a newsletter, deleting a named newsletter group or changing who may subscribe to it, adding or uploading subscribers, attaching or removing a record's files, and your skapi.com account. Ask the agent for one and it tells you so and gives you the link to the page that does it.

The ticket, secret key and OpenID logger pages of this documentation each show the dashboard forms these tools fill in for you. A few prompts to start with:

```text
Save this API key as a secret named "weather_api", usable only for https://api.weather.example: <your key>.
Create a ticket that saves each incoming webhook payload to the "orders" table, readable by admins only.
Register a Google OpenID logger for this project, and let in only addresses that end with "@mycompany.com".
Show me what my "orders" ticket received today.
Make every record in the "posts" table private.
Write a welcome e-mail for my shop, in my brand's tone, and upload it as the welcome template.
Compose this month's newsletter about the new autumn menu and save it to the public list without sending it.
```

The agent picks the tools, asks when something is missing, and reports what it changed.

When a project is at a limit of its plan (users, monthly e-mail sends, newsletter subscribers, storage or bandwidth), the agent is told which limit, and is given the link to the project's plan page, where the project owner upgrades. The server itself never changes a plan, and never creates or deletes a project; see [Plans and Limits](/introduction/plans.md).

With the project created, the codebase connected and the agent set up, the rest happens in your code: every other page of this documentation calls methods on the `skapi` instance from [Setting Up Your Codebase](#setting-up-your-codebase).
