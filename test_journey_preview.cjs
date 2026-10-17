/* global require */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

// Compile the real dependency-free demo service, without requiring a native runtime.
const source = fs.readFileSync('src/services/journeyService.ts', 'utf8');
const output = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const context = { exports: {}, setTimeout };
vm.runInNewContext(output, context);
const { planJourneyOptions } = context.exports;

test('route previews keep requested context and wrap midnight correctly', async () => {
  const routes = await planJourneyOptions({ mode: 'bus', origin: 'Station', destination: 'Home',
    departureDate: '2026-12-01', departureTime: '23:55', useAccessibilityPreferences: true });
  assert.equal(routes.length, 2);
  assert.notEqual(routes[0].id, routes[1].id);
  assert.equal(routes[0].departureDate, '2026-12-02');
  assert.equal(routes[0].arrivalDate, '2026-12-02');
  assert.equal(routes[0].departureTime, '00:00');
  assert.equal(routes[0].arrivalTime, '00:18');
  assert.equal(routes[0].destination, 'Home');
  assert.equal(routes[0].serviceNumber, '24');
});

test('extra transfer time changes the alternative duration only when preferences are enabled', async () => {
  const input = { mode: 'bus', origin: 'Station', destination: 'Home', departureTime: '14:30', extraTransferTime: true };
  const enabled = await planJourneyOptions({ ...input, useAccessibilityPreferences: true });
  const disabled = await planJourneyOptions({ ...input, useAccessibilityPreferences: false });
  assert.equal(enabled[1].durationMinutes - disabled[1].durationMinutes, 8);
  assert.equal(enabled[0].durationMinutes, disabled[0].durationMinutes);
  assert.equal(disabled[0].accessibilityFeatures[0], 'Route preview');
});
