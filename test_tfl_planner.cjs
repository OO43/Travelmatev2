/* global require, process, AbortController, setTimeout, clearTimeout */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync('src/services/journeyService.ts', 'utf8');
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const route = {
  id: 'tfl-test', source: 'tfl', mode: 'bus', provider: 'Transport for London', service_number: '24',
  origin: 'Victoria', destination: 'Westminster', departure_at: '2026-07-01T23:55:00+01:00', arrival_at: '2026-07-02T00:15:00+01:00',
  duration_minutes: 20, changes: 0, fare_pence: 175, accessibility_features: ['Step-free to vehicle requested'], warnings: ['Roadworks'],
  legs: [{ mode: 'bus', origin: 'Victoria', destination: 'Westminster', departure_at: '2026-07-01T23:55:00+01:00', arrival_at: '2026-07-02T00:15:00+01:00', duration_minutes: 20, instruction: 'Take 24', line_id: '24', line_name: '24', departure_stop_id: 'stop-a', arrival_stop_id: 'stop-b', stop_ids: ['stop-a', 'stop-b'], disruptions: ['Roadworks'] }],
};
const input = { mode: 'bus', origin: 'Victoria', destination: 'Westminster', departureDate: '2026-07-01', departureTime: '23:55', useAccessibilityPreferences: true, stepFree: true };
function service(fetch, environment = {}) {
  const context = { exports: {}, setTimeout, clearTimeout, AbortController, fetch,
    process: { env: { EXPO_PUBLIC_API_URL: 'http://localhost:8000', ...environment } },
    require: () => ({ planJourneyOptions: async () => [{ source: 'demo' }] }) };
  vm.runInNewContext(output, context); return context.exports;
}
const response = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

test('live planner sends only route preferences to FastAPI and keeps TfL keys off the device', async () => {
  let request;
  const api = service(async (url, options) => { request = { url, body: JSON.parse(options.body) }; return response(200, { source: 'tfl', fetched_at: '2026-07-01T22:00:00Z', journeys: [route] }); });
  const journeys = await api.planJourneyOptions(input);
  assert.equal(request.url, 'http://localhost:8000/api/v1/journeys/plan'); assert.equal(request.body.step_free, true);
  assert.equal(request.body.departure_date, '2026-07-01'); assert.equal('app_key' in request.body, false);
  assert.equal(journeys[0].source, 'tfl'); assert.equal(journeys[0].price, '£1.75');
  assert.equal(journeys[0].departureTime, '23:55'); assert.equal(journeys[0].arrivalDate, '2026-07-02');
  assert.equal(journeys[0].timeline[0].completed, false); assert.equal(journeys[0].legs[0].line_id, '24');
});
test('preference toggle disables both step-free and slow-walking request flags', async () => {
  let body;
  const api = service(async (_, options) => { body = JSON.parse(options.body); return response(200, { source: 'tfl', fetched_at: 'now', journeys: [] }); });
  const routes = await api.planJourneyOptions({ ...input, useAccessibilityPreferences: false, extraTransferTime: true });
  assert.equal(body.step_free, false); assert.equal(body.extra_transfer_time, false); assert.equal(routes.length, 0);
});
test('ambiguous location errors expose selectable places', async () => {
  const api = service(async () => response(422, { code: 'LOCATION_AMBIGUOUS', message: 'Choose your station', details: { origin: [{ id: '1000248', name: 'Victoria Underground Station' }], destination: [] } }));
  await assert.rejects(api.planJourneyOptions(input), error => error.name === 'JourneyPlanningError' && error.choices.origin[0].id === '1000248');
});
test('upstream failures never silently return mock routes', async () => {
  const api = service(async () => response(503, { message: 'TfL request limit reached' }));
  await assert.rejects(api.planJourneyOptions(input), /TfL request limit reached/);
  const offline = service(async () => { throw new Error('offline'); });
  await assert.rejects(offline.planJourneyOptions(input), /Unable to reach the journey API/);
});
test('unsupported modes and unresolved current location fail before making a request', async () => {
  let called = false; const api = service(async () => { called = true; });
  await assert.rejects(api.planJourneyOptions({ ...input, mode: 'flight' }), /another provider/);
  await assert.rejects(api.planJourneyOptions({ ...input, origin: 'Current location' }), /Device location/);
  assert.equal(called, false);
});
test('demo results require an explicit demo provider setting', async () => {
  const api = service(async () => { throw new Error('should not call API'); }, { EXPO_PUBLIC_JOURNEY_PROVIDER: 'demo' });
  const routes = await api.planJourneyOptions(input); assert.equal(routes[0].source, 'demo');
});
test('unknown fares are not invented and malformed provider responses are rejected', async () => {
  const api = service(async () => response(200, { source: 'tfl', fetched_at: 'now', journeys: [{ ...route, fare_pence: null }] }));
  assert.equal((await api.planJourneyOptions(input))[0].price, 'Fare unavailable');
  const bad = service(async () => response(200, {})); await assert.rejects(bad.planJourneyOptions(input), /unexpected data/);
});
