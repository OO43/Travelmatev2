/* global require, AbortController, setTimeout, clearTimeout */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const code = ts.transpileModule(fs.readFileSync('src/services/journeyService.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
function service() {
  let body;
  const route = { id: 'tfl-names', source: 'tfl', mode: 'train', provider: 'Transport for London', service_number: 'DLR / Jubilee / Windrush',
    origin: 'Victoria Station', destination: 'London Euston Station', departure_at: '2026-10-24T12:00:00Z', arrival_at: '2026-10-24T12:30:00Z',
    duration_minutes: 30, changes: 2, fare_pence: null, accessibility_features: [], warnings: [], legs: [] };
  const context = { exports: {}, setTimeout, clearTimeout, AbortController,
    process: { env: { EXPO_PUBLIC_API_URL: 'http://localhost:8000' } }, require: () => ({}),
    fetch: async (_, options) => { body = JSON.parse(options.body); return { ok: true,
      json: async () => ({ source: 'tfl', fetched_at: '2026-10-24T11:00:00Z', journeys: [route] }) }; } };
  vm.runInNewContext(code, context);
  return { api: context.exports, request: () => body };
}
test('partial Google search labels never override full TfL names for coordinate journeys', async () => {
  const { api, request } = service();
  const journeys = await api.planJourneyOptions({ mode: 'train', origin: '51.4965,-0.1447', destination: '51.5282,-0.1337', originName: 'Vic', destinationName: 'London e' });
  assert.equal('origin_name' in request(), false); assert.equal('destination_name' in request(), false);
  assert.equal(journeys[0].origin, 'Victoria Station'); assert.equal(journeys[0].destination, 'London Euston Station');
  assert.equal(journeys[0].timeline.at(-1).title, 'Arrive at London Euston Station');
});
test('TfL station identifiers keep their fully selected station labels', async () => {
  const { api, request } = service();
  await api.planJourneyOptions({ mode: 'train', origin: '1000248', destination: '1000085', originName: 'Victoria Underground Station', destinationName: 'Euston Underground Station' });
  assert.equal(request().origin_name, 'Victoria Underground Station'); assert.equal(request().destination_name, 'Euston Underground Station');
});
