// The published skapi-js version, so every `skapi-js@latest` a code example writes (the CDN
// script tag, mostly) is published as the release it loads today. The sources keep `@latest`,
// which is still right when read raw, and a build that cannot reach the registry keeps it too.
//
// Read from the npm registry ONCE per build. `npm run dev|build` runs agent-docs.mjs and then
// vitepress in a second process; agent-docs asks the registry (`fresh`) and leaves the answer
// in VERSION_FILE, and the vitepress config reads that file instead of asking again, so the
// pages and the agent files always carry the same version. The config asks the registry itself
// only when the file is missing (vitepress started without agent-docs).

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const REGISTRY = 'https://registry.npmjs.org/skapi-js/latest';
const LATEST = /skapi-js@latest\b/g;
const SEMVER = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;
// In VitePress's own cache folder, which is git-ignored.
const VERSION_FILE = fileURLToPath(new URL('./cache/skapi-version.json', import.meta.url));
let cached;

async function fromRegistry() {
    try {
        let res = await fetch(REGISTRY, { signal: AbortSignal.timeout(10000) });
        let v = res.ok ? (await res.json()).version : null;
        return typeof v === 'string' && SEMVER.test(v) ? v : null;
    } catch {
        return null;
    }
}

function fromFile() {
    try {
        let { version } = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf-8'));
        return typeof version === 'string' && SEMVER.test(version) ? version : null;
    } catch {
        return undefined;   // no file: ask the registry
    }
}

/** `fresh`: ask the registry and save the answer for the vitepress process (agent-docs.mjs). */
export async function skapiVersion({ fresh = false } = {}) {
    if (cached !== undefined) return cached;
    let saved = fresh ? undefined : fromFile();
    if (saved !== undefined) {
        cached = saved;
    } else {
        cached = await fromRegistry();
        try {
            fs.mkdirSync(new URL('./cache/', import.meta.url), { recursive: true });
            fs.writeFileSync(VERSION_FILE, JSON.stringify({ version: cached }) + '\n');
        } catch { /* read-only checkout: the config asks the registry itself */ }
    }
    if (!cached) console.warn('  skapi-js version: the npm registry did not answer, code examples keep "skapi-js@latest"');
    return cached;
}

/** `text` with every `skapi-js@latest` written as `skapi-js@<version>`; unchanged without one. */
export function withVersion(text, version) {
    return version && typeof text === 'string' ? text.replace(LATEST, `skapi-js@${version}`) : text;
}
