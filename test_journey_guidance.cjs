/* global require */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const ts = require('typescript');

function load(file, imports = {}) {
  const context = { exports: {}, require: name => imports[name] };
  const compiled = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  runInNewContext(compiled.outputText, context);
  return context.exports;
}

const { buildJourneyReminders, readyJourneyReminders } = load('src/services/journeyGuidance.ts', {
  '@/services/journeyDisplay': load('src/services/journeyDisplay.ts'),
});
const ride = (departure_at, arrival_at, mode = 'bus') => ({
  mode, line_name: '24', origin: 'Boarding stop', destination: 'Alighting stop', departure_at, arrival_at,
});
const journey = {
  source: 'tfl', status: 'planned', legs: [
    ride('2026-10-22T23:50:00+01:00', '2026-10-22T23:59:00+01:00'),
    ride('2026-10-22T23:59:00+01:00', '2026-10-23T00:00:00+01:00', 'walking'),
    ride('2026-10-23T00:01:00+01:00', '2026-10-23T00:02:00+01:00', 'train'),
  ],
};

test('overnight transfers avoid prompting before the preceding scheduled arrival', () => {
  const reminders = buildJourneyReminders(journey);
  assert.equal(reminders.length, 4);
  const [board, firstStop, transfer, lastStop] = reminders;
  assert.equal(board.opensAt, Date.parse('2026-10-22T22:45:00Z'));
  assert.equal(transfer.opensAt, firstStop.scheduledAt);
  assert.equal(lastStop.opensAt, transfer.scheduledAt);
});

test('passed timetable windows do not replay, and already delivered reminders are skipped', () => {
  const reminders = buildJourneyReminders(journey);
  const [, firstStop, transfer] = reminders;
  assert.equal(readyJourneyReminders(reminders, transfer.opensAt, new Set([transfer.id])).length, 0);
  const due = readyJourneyReminders(reminders, transfer.opensAt, new Set());
  assert.equal(due.length, 1);
  assert.equal(due[0].id, transfer.id);
  assert.equal(firstStop.scheduledAt, transfer.opensAt);
});

test('completed journeys and legs without timezone-qualified schedules do not trigger reminders', () => {
  assert.equal(buildJourneyReminders({ ...journey, status: 'completed' }).length, 0);
  assert.equal(buildJourneyReminders({ ...journey, legs: [
    ride('2026-10-22T22:45:00', '2026-10-22T22:50:00'),
  ] }).length, 0);
});
