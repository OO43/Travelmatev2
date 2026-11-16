/* global require, process, AbortController, setTimeout, clearTimeout */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(path, fetch, environment = {}) {
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const context = { exports: {}, fetch, setTimeout, clearTimeout, AbortController,
    process: { env: { EXPO_PUBLIC_API_URL: 'http://localhost:8000', EXPO_PUBLIC_JOURNEY_PROVIDER: 'transportapi', ...environment } },
    require: () => ({ planJourneyOptions: async () => { throw new Error('No demo fallback'); }, isWalkingLeg: leg => ['walking', 'wait'].includes(leg.mode) }) };
  vm.runInNewContext(code, context); return context.exports;
}
const input = { mode: 'bus', origin: '52.631,-1.125', destination: '52.625,-1.133', originName: 'Lei', destinationName: 'Royal' };
const route = { id: 'transportapi-one', source: 'transportapi', mode: 'bus', provider: 'TransportAPI', service_number: '24',
  origin: 'Leicester Station', destination: 'Royal Infirmary', departure_at: '2026-10-27T23:55:00+00:00', arrival_at: '2026-10-28T00:15:00+00:00',
  duration_minutes: 20, changes: 0, fare_pence: null, accessibility_features: [], warnings: ['Access not verified'],
  legs: [{ mode: 'bus', line_id: '24', line_name: '24', departure_stop_id: '2600TESTA', arrival_stop_id: '2600TESTB',
    origin: 'Leicester Station', destination: 'Royal Infirmary', departure_at: '2026-10-27T23:55:00+00:00', arrival_at: '2026-10-28T00:15:00+00:00',
    duration_minutes: 20, instruction: 'Take 24', path: [{ latitude: 52.631, longitude: -1.125 }], stop_ids: [], disruptions: [] }] };
const response = (source = 'transportapi') => ({ ok: true, json: async () => ({ source, fetched_at: '2026-10-27T23:50:00Z', journeys: [{ ...route, source }] }) });

test('provider selection reaches FastAPI without credentials or truncated coordinate labels', async () => {
  let sent;
  const api = load('src/services/journeyService.ts', async (_, options) => { sent = JSON.parse(options.body); return response(); });
  const result = (await api.planJourneyOptions(input))[0];
  assert.equal(sent.provider, 'transportapi'); assert.equal(sent.origin, input.origin);
  assert.equal(sent.origin_name, undefined); assert.equal(sent.destination_name, undefined);
  assert.equal(sent.app_key, undefined); assert.equal(sent.app_id, undefined);
  assert.equal(result.origin, 'Leicester Station'); assert.equal(result.source, 'transportapi');
  assert.equal(result.price, 'Fare unavailable'); assert.equal(result.arrivalDate, '2026-10-28');
  assert.equal(result.legs[0].path[0].latitude, 52.631);
  assert.match(result.timeline.at(-1).detail, /TransportAPI/);
});
test('TfL remains selectable and a mismatched provider never silently replaces it', async () => {
  let sent;
  const api = load('src/services/journeyService.ts', async (_, options) => { sent = JSON.parse(options.body); return response('tfl'); }, { EXPO_PUBLIC_JOURNEY_PROVIDER: 'tfl' });
  assert.equal((await api.planJourneyOptions(input))[0].source, 'tfl');
  assert.equal(sent.provider, undefined);
  const wrong = load('src/services/journeyService.ts', async () => response('tfl'));
  await assert.rejects(wrong.planJourneyOptions(input), /different provider/);
});
test('TransportAPI API failures stay actionable rather than falling back to demo', async () => {
  const api = load('src/services/journeyService.ts', async () => ({ ok: false, status: 502, json: async () => ({ message: 'Check engine access' }) }));
  await assert.rejects(api.planJourneyOptions(input), /Check engine access/);
});
test('live requests follow saved journey source even after planner switches to TfL', () => {
  const api = load('src/services/liveUpdatesService.ts', undefined, { EXPO_PUBLIC_JOURNEY_PROVIDER: 'tfl' });
  const request = api.liveRequestForJourney({ ...route, status: 'planned' });
  assert.equal(request.provider, 'transportapi');
  assert.equal(request.legs[0].service_name, '24'); assert.equal(request.legs[0].mode, 'bus');
  assert.equal(request.legs[0].stop_id, '2600TESTA');
  assert.equal(api.liveRequestForJourney({ ...route, status: 'completed' }), null);
});
test('TransportAPI autocomplete requests GB search without London bias', async () => {
  let sent;
  const api = load('src/services/placeService.ts', async (_, options) => { sent = JSON.parse(options.body); return { ok: true, json: async () => ({ suggestions: [] }) }; });
  await api.autocompletePlaces('Leicester', 'valid-session-token');
  assert.equal(sent.london_bias, false);
});
