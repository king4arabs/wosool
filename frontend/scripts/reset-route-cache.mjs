import { rmSync } from 'node:fs'

// Next 16 can retain runtime page responses across in-place builds. Clear only
// generated responses so the new build's prerendered pages become the source.
rmSync(new URL('../.next/server/route-cache/', import.meta.url), { recursive: true, force: true })
