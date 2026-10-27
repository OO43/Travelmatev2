/* global require */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync('src/services/journeyDisplay.ts', 'utf8');
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const context = { exports: {} }; vm.runInNewContext(output, context);
const { journeySummary, journeyWarnings, legServiceLabel, transferMinutes, legTimeRange, snapshotLabel } = context.exports;
const walk = { mode: 'walking', duration_minutes: 4, departure_at: '2026-10-22T09:15:00+01:00', arrival_at: '2026-10-22T09:19:00+01:00', disruptions: [] };
const bus = { mode: 'bus', line_name: '148', duration_minutes: 4, departure_at: '2026-10-22T09:19:00+01:00', arrival_at: '2026-10-22T09:23:00+01:00', disruptions: ['Roadworks'] };

test('door-to-door total remains separate from walking and in-vehicle durations', () => {
  const journey = { durationMinutes: 20, legs: [walk, bus, { ...walk, duration_minutes: 12 }], changes: 0 };
  const summary = journeySummary(journey);
  assert.equal(summary.walkingMinutes, 16); assert.equal(summary.changes, 0);
  assert.equal(summary.changesLabel, 'No vehicle changes'); assert.equal(journey.durationMinutes, 20);
});
test('walking transfers do not count as vehicle changes', () => {
  const summary = journeySummary({ legs: [walk, bus, walk, { ...bus, line_name: '11' }], changes: 99 });
  assert.equal(summary.changes, 1); assert.equal(summary.changesLabel, '1 change');
});
test('scheduled waiting is derived from times and negative or invalid gaps are ignored', () => {
  assert.equal(transferMinutes(bus, { ...bus, departure_at: '2026-10-22T09:33:00+01:00' }), 10);
  assert.equal(transferMinutes(bus, walk), 0);
  assert.equal(transferMinutes(bus, { ...bus, departure_at: 'not-a-time' }), 0);
});
test('long line labels and transport types remain readable without duplicating a mode', () => {
  assert.equal(legServiceLabel(bus), 'Bus 148');
  assert.equal(legServiceLabel({ mode: 'tube', line_name: 'District' }), 'Tube District');
  assert.equal(legServiceLabel({ mode: 'elizabeth-line', line_name: 'Elizabeth line' }), 'Elizabeth line');
  assert.equal(legServiceLabel(walk), 'Walk');
});
test('midnight steps show the changed arrival date without converting to phone timezone', () => {
  const range = legTimeRange({ ...bus, departure_at: '2026-07-01T23:55:00+01:00', arrival_at: '2026-07-02T00:15:00+01:00' });
  assert.equal(range, '23:55–00:15 (2026-07-02)');
});
test('disruption and route notices are combined without duplicates', () => {
  const result = journeyWarnings({ warnings: ['Roadworks', 'Lift closed'], legs: [bus] });
  assert.equal(result.length, 2); assert.equal(result[0], 'Roadworks'); assert.equal(result[1], 'Lift closed');
});
test('legacy journeys and invalid fetch times have safe fallback summaries', () => {
  assert.equal(journeySummary({ changes: 2 }).changes, 2);
  assert.equal(snapshotLabel('bad-date'), 'TfL journey snapshot');
  assert.match(snapshotLabel('2026-07-01T12:00:00Z'), /13:00.*London time/);
});
