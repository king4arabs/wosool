import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);

function loadPackage(resolver, expectedVersion) {
  const entry = resolver.resolve('picomatch');
  const metadata = resolver(join(dirname(entry), 'package.json'));

  assert.equal(
    metadata.name,
    'picomatch',
    `Expected picomatch, but ${entry} resolved to ${metadata.name}@${metadata.version}`,
  );
  assert.equal(
    metadata.version,
    expectedVersion,
    `Expected patched picomatch ${expectedVersion}, but ${entry} resolved to ${metadata.version}`,
  );

  return resolver('picomatch');
}

const picomatchV4 = loadPackage(require, '4.0.8-wosool.1');
const reloadPluginRequire = createRequire(require.resolve('vite-plugin-full-reload'));
const reloadPluginPicomatch = loadPackage(reloadPluginRequire, '4.0.8-wosool.1');

assert.equal(picomatchV4.makeRe('+(*a)').source, '^(?:\\+\\(\\*a\\))$');
assert.equal(picomatchV4.makeRe('*(*a)').source, '^(?:\\*\\(\\*a\\))$');

const adversarialInput = `${'a'.repeat(50)}b`;
const startedAt = performance.now();

for (const matcher of [picomatchV4, reloadPluginPicomatch]) {
  for (const pattern of ['+(*a)', '*(*a)']) {
    assert.equal(matcher.isMatch(adversarialInput, pattern), false);
  }
}

assert.ok(
  performance.now() - startedAt < 1_000,
  'The picomatch ReDoS regression check exceeded one second',
);

console.log('Verified the patched picomatch dependency across all backend build paths.');
