// The Skapi SDKs, in one list. The same file is in all four docs sites (docs-skapi-js, -py,
// -swift, -kotlin): change it in one and copy it to the other three.
//
// Read by OtherLanguages.vue (the home page tiles: `name`, `logos`, `details`, `link`, `host`)
// and by agent-docs.mjs (the "Skapi SDKs" section of every base prompt: `sdk`, `use`,
// `missing`, `prompt`). `tile: false` is a prompt row with no tile of its own.

/** @typedef {{ id: string, sdk: string, name: string, logos?: { src: string, alt: string }[], details?: string, link: string, host: string, use: string, missing: string, prompt: string, tile?: boolean }} SdkPlatform */

/** @type {SdkPlatform[]} */
export const SDK_PLATFORMS = [
  {
    id: 'js',
    sdk: 'skapi-js',
    name: 'HTML, JavaScript & TypeScript',
    logos: [
      { src: '/lang/html.svg', alt: 'HTML logo' },
      { src: '/lang/javascript.svg', alt: 'JavaScript logo' },
      { src: '/lang/typescript.svg', alt: 'TypeScript logo' },
    ],
    details: 'npm install skapi-js. Use it in plain HTML, any JavaScript framework, or Node.js.',
    link: 'https://docs.skapi.com',
    host: 'docs.skapi.com',
    use: 'web apps (static HTML or an SPA framework)',
    missing: 'Every feature, including HTML forms, realtime, WebRTC calls, web push and the admin methods.',
    prompt: 'https://docs.skapi.com/SKAPI.md',
  },
  {
    id: 'node',
    sdk: 'skapi-js in Node.js',
    name: 'Node.js',
    link: 'https://docs.skapi.com',
    host: 'docs.skapi.com',
    use: 'terminal programs run with `node` (command line tools and scripts)',
    missing: 'The same API as in the browser, without realtime, WebRTC, web push, HTML forms, files on `postRecord()` or a remembered encryption key. A web app built with Node.js tooling (Vite, webpack) is a web app.',
    prompt: 'https://docs.skapi.com/SKAPI.md',
    tile: false,
  },
  {
    id: 'py',
    sdk: 'skapi-py',
    name: 'Python',
    logos: [{ src: '/lang/python.svg', alt: 'Python logo' }],
    details: 'pip install skapi. Use it in client applications: command line tools and scripts.',
    link: 'https://py.skapi.com',
    host: 'py.skapi.com',
    use: 'Python client applications (command line tools and scripts)',
    missing: 'No HTML forms, WebRTC, web push or admin methods.',
    prompt: 'https://py.skapi.com/SKAPI.md',
  },
  {
    id: 'swift',
    sdk: 'skapi-swift',
    name: 'Swift',
    logos: [{ src: '/lang/swift.svg', alt: 'Swift logo' }],
    details: 'One Swift package for iOS and macOS apps, with async/await calls and no third-party dependencies.',
    link: 'https://ios.skapi.com',
    host: 'ios.skapi.com',
    use: 'iOS and macOS apps (SwiftUI, UIKit) and Mac command line tools',
    missing: 'No web push, WebRTC, HTML forms or admin methods.',
    prompt: 'https://ios.skapi.com/SKAPI.md',
  },
  {
    id: 'jvm',
    sdk: 'skapi-kotlin',
    name: 'Kotlin & Java',
    logos: [
      { src: '/lang/kotlin.svg', alt: 'Kotlin logo' },
      { src: '/lang/java.svg', alt: 'Java logo' },
    ],
    details: 'One library for client applications: Android apps, Kotlin and Java desktop programs and command line tools.',
    link: 'https://jvm.skapi.com',
    host: 'jvm.skapi.com',
    use: 'Android apps, and Kotlin or Java desktop programs and command line tools',
    missing: 'No web push, WebRTC, HTML forms or admin methods.',
    prompt: 'https://jvm.skapi.com/SKAPI.md',
  },
]

/**
 * The "Skapi SDKs" section of a base prompt, for the site whose SDK is `current` (an id above).
 * Plain markdown: one line per SDK, then which one this prompt is for.
 */
export function sdkPlatformsMarkdown(current) {
  const self = SDK_PLATFORMS.find((p) => p.id === current)
  if (!self) throw new Error(`sdk-platforms: no SDK "${current}"`)
  const lines = [
    'Every Skapi SDK works with the same project: the same user accounts, records, files and error codes. Build with the SDK for the platform the user is building for:',
    '',
    ...SDK_PLATFORMS.map((p) => `- **${p.sdk}**, for ${p.use}. Base prompt: ${p.prompt}. ${p.missing}`),
    '',
    current === 'js'
      ? 'This base prompt is for **skapi-js**, in the browser and in Node.js. When the user is building for another platform, read that SDK\'s base prompt and build with it instead.'
      : `This base prompt is for **${self.sdk}**. When the user is building for another platform, read that SDK's base prompt and build with it instead.`,
  ]
  return lines.join('\n')
}
