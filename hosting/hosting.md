# Hosting your website

Skapi hosts the files of a static website under a subdomain of `skapi.com`, served over HTTPS through a CDN. Upload the files, and they are online.

Everything about hosting is done on your project's pages at [skapi.com](https://www.skapi.com), by the **project owner's Skapi account**:

- The address, the subdomain your site is served on, is registered, changed and removed on the project's **Settings** page.
- The files, the 404 page and the CDN are managed on the project's **Web Hosting** page.

## Quick start

1. Open your project's **Settings** page and click **Register** in the **Web Hosting** card.
2. Type a name, wait for **This address is available.**, and click **Register**.
3. Wait a few minutes for the address to go live.
4. Open the **Web Hosting** page and click **+ Upload Files**, or drag your site's folder onto the file list.
5. Click **[Open]** on the **Address** row to see your site.

If your site is a single-page app, also set `index.html` as the [404 page](#setting-the-404-page).

:::tip Let an AI agent do it
The Skapi MCP server can register a project's first address and upload, edit and delete the files of its site from a prompt. See [Connecting the Skapi MCP server](/introduction/getting-started.md#connecting-the-skapi-mcp-server).
:::

## Registering your subdomain

Before you upload files, the project needs a subdomain. Open the project's **Settings** page and click **Register** in the **Web Hosting** card.

![The Web Hosting card on the Settings page of a project with no address: No hosting address yet, and a Register button](/screenshots/hosting-settings-empty.webp)

*The Web Hosting card on the Settings page, before an address is registered.*

The **Web Hosting** page itself sends you there while the project has no address: it opens with a notice, and **OK** takes you to the card.

![The Web Hosting page of a project with no address: a notice reading Register a web hosting subdomain in Settings first, over a page whose rows are all empty](/screenshots/hosting-no-address.webp)

*The Web Hosting page without an address. Nothing can be uploaded yet.*

The dialog checks the name as you type and lets you register it once it is available.

![The Web Hosting Address dialog: the name aurora typed in front of .skapi.com, the message This address is available, and a Register button](/screenshots/hosting-register.webp)

*The name is checked while you type. Register unlocks when the address is available.*

Under the field, the dialog says one of:

| Message | What it means |
| --- | --- |
| **Checking availability...** | The name is being looked up. |
| **This address is available.** | You can register it. |
| **This address is already in use.** | Another project has it. Choose another name. |
| **This address is reserved. Please choose another name.** | The name is one of the reserved ones described below. |

A subdomain is 5 to 32 characters long and can use lowercase letters, digits and hyphens. It cannot start or end with a hyphen, or have two hyphens in a row. Your site is then served at `https://<name>.skapi.com`.

Since every website is hosted under `skapi.com`, names that could pass as an official page are reserved and cannot be registered:

- Skapi's own addresses and brand, such as `tutorial` or `skapi-support`.
- Sign-in, payment, support and notice pages, such as `checkout`, `password-reset` or `secure-login`.
- Names of banks, payment services and other brands that are impersonated for logins, such as `paypal` or `mybank-verify`, and any brand next to a sign-in or support word, such as `netflix-login`.

A brand used for a project of your own, such as `netflix-clone` or `kakao-map-demo`, can be registered.

A new address takes a few minutes to go live. Until then the card says that it is being set up, and the **Web Hosting** page cannot list files yet.

Once it is live, the card shows the address. Click the address to open your site, and click the copy icon beside it to copy it.

![The Web Hosting card on the Settings page with an address: aurora.skapi.com with a copy icon, and Change and Remove buttons](/screenshots/hosting-settings-card.webp)

*The card once the address is registered.*

### Changing or removing the address

**Change** in the **Web Hosting** card moves the site to a new name. The old address is released and the new one set up, which again takes a few minutes; the file list is unavailable while the change is in process, and the name cannot be changed again until it is done.

![The Change Web Hosting Address dialog: the new name padaria-aurora in front of .skapi.com, the message This address is available, and a Change button](/screenshots/hosting-change.webp)

*Changing the address. The files move with the site.*

**Remove** releases the address. The site stops being served there, and the files stay in storage, so registering a new name serves them again.

![The Remove Hosting Address confirmation: your site stops being served at this address, files stay in storage, with Cancel and Remove buttons](/screenshots/hosting-remove.webp)

*Removing the address takes the site offline and keeps the files.*

:::warning The subdomain is a project setting
Registering a subdomain, moving it and dropping it belong to the **project owner's Skapi account**. An [admin](/admin/permissions.md#project-settings-belong-to-the-project-owner) of the project, access group `99` included, is refused with `INVALID_REQUEST` and `Only the project owner can change project settings.`
:::

:::danger A temporarily banned subdomain
Skapi can temporarily ban a subdomain, for example one reported for abuse. While it is banned the site is offline, the **Web Hosting** page says that the address has been suspended, and the subdomain of the project cannot be changed or removed: every request is refused with `INVALID_REQUEST` and `Current subdomain "<name>" is temporarily banned.` The name stays reserved to the project during the ban.
:::

## The Web Hosting page

The **Web Hosting** page has a card for the state of the site, and the list of its files under it.

![The Web Hosting page: a card with the Address, Storage in Use, 404 Page, Browser caching and CDN cache rows, the Upload Files button, and the file list with folders and files, their size, upload time and browser caching](/screenshots/hosting-page.webp)

*The Web Hosting page of a site with files.*

The card has five rows:

- **Address**: where the site is served. **[Open]** opens it in a new tab.
- **Storage in Use**: how much file storage the site takes.
- **404 Page**: the file that answers for an address that does not exist. See [Setting the 404 page](#setting-the-404-page).
- **Browser caching**: how long a visitor's browser keeps your files. See [Browser caching](#browser-caching).
- **CDN cache**: the copies of your files the CDN serves, and whether they are being refreshed. See [The CDN cache](#the-cdn-cache).

## Uploading your website files

On the **Web Hosting** page, click **+ Upload Files**, use the folder icon on the right of the toolbar to upload a whole folder, or drag files or folders onto the file list. On a phone, tap the list to pick files.

![An empty file list on the Web Hosting page: a cloud icon and the line Drop files or folders here, or use Upload Files](/screenshots/hosting-empty.webp)

*A site with no files yet. Drop your site's folder here, or use the buttons.*

While files upload, the first row of the list names the file on the wire and counts the files done. The list fills in as each file lands.

Folders are kept: a file uploaded as `css/style.css` is served at `https://<name>.skapi.com/css/style.css`. The list shows one folder at a time. Click a folder to open it, and click a file to open it on your site in a new tab. The path above the list shows where you are, and every part of it leads back up, as does the first row of an opened folder.

![The file list inside the img folder: the path reads /img, the first row /img/ leads back up, followed by a menu folder and four image files](/screenshots/hosting-folder.webp)

*Inside a folder. The path and the first row both lead back up.*

A folder row shows the total size of what it holds. Click a column header to sort by **Name**, **Size** or **Uploaded**, and use the column icon on the right of the header to show or hide columns.

A file uploaded to a path that already exists replaces the old file.

### Downloading and deleting files

Tick the files or folders you want. The toolbar counts the selection, and its icons act on it:

- **Download selected** downloads each ticked file on its own, and each ticked folder as its own ZIP file.
- **Download selected as one .zip** puts everything you ticked into a single ZIP file, folders included with their structure. The server builds it while the toolbar reads **Building zip**, then the download starts. One zip holds up to 2 GB; for more, download in parts.
- **Delete selected** deletes the selection.

![The Delete Files confirmation over the file list, with one file and one folder ticked: 1 file and 1 folder will be permanently deleted from your site](/screenshots/hosting-delete.webp)

*Deleting a file and a folder. A folder is deleted with everything inside it.*

A folder is deleted with everything inside it, and a delete cannot be undone.

:::info
- Only the **project owner** can upload and delete hosted files. Admins of the project cannot, access group `99` included.
- A file name cannot start with `#`: that character marks a folder in the file list, and the upload is refused.
- The `__skapi__` folder at the root of your site is reserved for Skapi features such as [link previews](#link-previews), and an upload there is refused. A folder of that name inside another folder is yours.
- Hosted files count toward your plan's [file storage](/introduction/plans.md), together with record files and cloud files. The **Storage in Use** row on the page shows how much your site takes.
:::

:::danger
Since the files are hosted publicly, **DO NOT** upload any sensitive files in your hosting page.
:::

## index.html

The `index.html` file in the root of your site is served at `https://<name>.skapi.com/`, so it is the page a visitor gets for the address itself.

## Setting the 404 page

The **404 Page** row on the **Web Hosting** page names the file that answers when a visitor opens an address that does not exist on your site. It reads **Not set** until you choose one.

1. Click **[Upload]** on the **404 Page** row.
2. Pick an HTML file. It is uploaded to the root of your site and set as the 404 page.

The row then shows the file, as `/404.html` in the screenshot above. **[Replace]** uploads another file in its place, and **[Remove]** clears the setting; the file itself stays in the list.

Choosing it is a project setting, so only the **project owner's Skapi account** can, and an admin is refused with `Only the project owner can change project settings.`

:::danger
If you are using an **SPA framework** such as Vue, React, or Angular, **YOU MUST** set your **`index.html`** as the 404 page, so every route of your app is answered by it.
:::

## Link previews

When someone posts a link on Threads, X, Facebook, KakaoTalk, Slack or Discord, the site reads the page's Open Graph tags (`og:title`, `og:image`, ...) to show a preview card. It does not run the page's scripts. A single-page app sets its tags with JavaScript, so every link to it shows the same preview, whatever the link points to.

Every hosted site answers one more address for this:

```
https://<name>.skapi.com/__skapi__/og/<record_id>
```

It answers with a page whose preview tags come from that record of your project, and sends a person who opens the link on to an address of your site. Share this address instead of your app's own one, and each link shows its own title, text and picture.

### Making a record a link preview

Post a record in the `public` access group with an `og` object inside `__skapi__` in its data, and attach the preview picture to the record:

```js
const record = await skapi.postRecord(
    {
        post: postId, // your own data, as usual
        __skapi__: {
            og: {
                title: 'Sunset over the bay',                      // required
                description: 'A photo by Ann on Aurora Photos.',
                image: 'preview',                                  // the picture attached below
                url: '/index.html#post=' + postId,                 // where a person is sent
            },
        },
    },
    { table: { name: 'share_cards', access_group: 'public' } },
    [{ name: 'preview', file: previewImageFile }] // a 1200 x 630 PNG or JPEG reads well everywhere
);

const shareLink = `https://aurora.skapi.com/__skapi__/og/${record.record_id}`;
```

| Key of `__skapi__.og` | What it is |
| --- | --- |
| `title` | The preview's title, and the page title. **Required**: without it there is no preview, and a person is sent straight on. Up to 200 characters; longer text is cut. |
| `description` | The text under the title. Up to 500 characters. |
| `image` | The preview picture: the name of a file attached to this same record (`preview` above), or that file's url. It must be a `.png`, `.jpg`, `.jpeg`, `.gif` or `.webp` file. Any other file, or a picture of another record, gives a preview without a picture. |
| `url` | Where a person who opens the link is sent: a path on your site, starting with `/`, such as `/index.html#post=42` or `/gallery?photo=42`. Anything else, such as another site's address, is replaced by `/`. Defaults to `/`. |

The page also carries the matching `twitter:` tags, and `og:site_name` is your site's name.

:::info Only what is inside `__skapi__` is read
Skapi reads `data.__skapi__.og` and nothing else of the record's data, so the rest of the data stays your app's own, and a top-level `og` key of your own is never read. `__skapi__` is where Skapi features find their settings in record data; see [Creating a Record](/database/create.md#reserved-data-key-skapi).
:::

### What happens when the address is opened

- **A crawler** (the site building the preview card) reads the tags of the page and shows the title, the text and the picture.
- **A person** is sent on at once to `url`, with a script, so they land on your app: for example `https://aurora.skapi.com/index.html#post=42`. A browser without JavaScript shows the title as a link to it.
- **When there is nothing to show**, the address sends the visitor to the root of your site (`/`): the record does not exist or is not in the `public` access group, its data has no `__skapi__.og`, or its project could not be reached. A shared link always leads somewhere.

### Things to know

- **Public records only.** The record is read without signing in, as any visitor could read it, so only the `public` access group works. Anything in its data, and the attached picture, can be read by anyone who has the address.
- **Your CORS setting must allow your site.** The record is read on behalf of `https://<name>.skapi.com`. If your project's [CORS setting](/service-settings/service-settings.md) lists addresses, include your site's, or every link preview of it sends people to `/`.
- **Records encrypted with [client-side encryption](/database/encryption.md)** cannot be read, and give no preview.
- **Previews are kept by the sites that show them.** A site that has already built a preview card for an address may keep showing it after you change the record. Post a new record, and share its address, when a preview must change.
- **Delete the record** to retire a preview: its address then sends people to `/`.
- The address of a record works only on the site of the record's own project.

## The CDN cache

Your files are served through a CDN, which keeps a copy of each file close to your visitors for up to six months. That is what makes the site fast, and it is safe because every change you make refreshes those copies, as described next.

The CDN refreshes by itself whenever there is a change. About a minute after an upload, overwrite or delete finishes on the **Web Hosting** page (or through the [Skapi MCP server](/introduction/getting-started.md#connecting-the-skapi-mcp-server)), the CDN drops its copies of the whole site and fetches the new files on the next visit. Changes that land during that minute ride the same refresh. The **CDN cache** row on the **Web Hosting** page reads **Updating** while the refresh runs and **Live** when it is done. There is nothing to click.

If the CDN misses a change, you do not have to wait for the copies to expire: a check runs every 30 minutes and refreshes any site whose files changed without a refresh, and you can start one yourself at any time. **[Refresh now]** on the same row republishes every file of the site to the CDN at once. A refresh does not change what your visitors' browsers already keep; that is [Browser caching](#browser-caching).

An address that has no file is never cached, by the CDN or by the browser. A file you upload at that address shows at once, and so does a newly set [404 page](#setting-the-404-page).

## Browser caching

A visitor's browser keeps its own copy of each file it has fetched, and reuses it without asking for as long as you allow. Longer makes return visits faster, but a changed file is not seen by a visitor who already has it until that time passes or the file's name changes.

The **Browser caching** row on the **Web Hosting** page holds the setting for your uploads:

| Choice | The browser keeps a file for |
|---|---|
| No caching | not at all: it asks the CDN before every use and gets a tiny "unchanged" answer when nothing changed. The default |
| 5 minutes | 5 minutes |
| 1 hour | 1 hour |
| 1 day | 1 day |
| 7 days | 7 days |
| 30 days | 30 days |
| 1 year | 1 year |
| Ask on upload | the page asks you once per upload, and offers to make your answer the default |

![The Browser caching dialog the Web Hosting page shows once per upload when the setting is Ask on upload: Browser caching for these files, a choice list reading No caching, a Set as default and stop asking checkbox, a Learn more link, and Cancel and Upload buttons](/screenshots/hosting-browser-caching-ask.webp)

*Asked once per upload when the setting is Ask on upload.*

Anything above 5 minutes comes with a warning: visitors who already have a file will not see a new version for that long unless its name changes.

**7 days or more needs a second look.** Choosing it opens an alert you have to accept, because of what it means:

- Visitors who already have a file will not see a new version of it for that long, even after you upload a change.
- Once a visitor's browser has downloaded a file, you have no control over it. Nothing you do on the Web Hosting page, not a new upload and not a CDN refresh, reaches a copy a browser already holds. You cannot change this for a file with the same name.

![The Browser caching alert for 7 days: visitors who already have a file will not see a new version of it for 7 days, even after you upload a change; once a visitor's browser has downloaded a file you have no control over it and cannot change this for a file with the same name; with Cancel and I understand buttons](/screenshots/hosting-browser-caching-alert.webp)

*The alert for 7 days or more.*

The only way to ship a change to such a file is a new address: a new file name, or a version on the address as shown below.

**Pages are never kept.** Every HTML file is served as "No caching" whatever the setting, so a reload always shows the newest page, and a page is what names your other files. The 404 page is a page too.

The choice is written onto each file when it is uploaded. Files you uploaded before you changed the setting keep what they had; upload a file again to change it. The file list shows each file's value in its **Browser caching** column.

### Shipping a new version of a long-cached file

Give it a new address. Either rename the file, as build tools do with a hash in the name (`app.3f9c1e.js`), or add a version to the address you use in your pages:

```html
<script src="/app.js?v=2"></script>
```

`?v=` is the one query string the CDN and the browser treat as a new address; any other query string is ignored. Change the number whenever you change the file, and every visitor gets the new one on their next visit, however long the old one was allowed to live.
