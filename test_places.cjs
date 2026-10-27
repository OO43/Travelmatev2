/* global require, process, AbortController, setTimeout, clearTimeout */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync('src/services/placeService.ts', 'utf8');
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
function service(fetch) {
  const context = { exports: {}, setTimeout, clearTimeout, AbortController, fetch,
    process: { env: { EXPO_PUBLIC_API_URL: 'http://localhost:8000' } } };
  vm.runInNewContext(output, context); return context.exports;
}
const response = (status, body) => ({ ok: status === 200, status, json: async () => body });
const prediction = { place_id: 'test', label: 'Victoria Station, London', primary_text: 'Victoria Station', secondary_text: 'London' };
const place = { place_id: 'test', latitude: 51.5, longitude: -0.1, attributions: [] };

test('autocomplete calls FastAPI without an API key or passenger data', async () => {
  let sent;
  const api = service(async (url, options) => { sent = { url, ...options }; return response(200, { suggestions: [prediction] }); });
  const items = await api.autocompletePlaces('Victoria', 'a-session-token-123');
  assert.equal(items[0].place_id, 'test');
  assert.equal(sent.url, 'http://localhost:8000/api/v1/places/autocomplete');
  assert.deepEqual(JSON.parse(sent.body), { input: 'Victoria', session_token: 'a-session-token-123' });
});
test('details reuses token and resolves coordinates for TfL', async () => {
  let sent;
  const api = service(async (_, options) => { sent = JSON.parse(options.body); return response(200, place); });
  const resolved = await api.resolvePlace('test', 'same-session-token');
  assert.equal(sent.session_token, 'same-session-token');
  const input = api.placeToJourneyLocation(resolved, ' Victoria ');
  assert.equal(input.id, '51.5,-0.1'); assert.equal(input.name, 'Victoria');
  assert.equal(input.name.includes('Station, London'), false);
});
test('tokens are distinct and suitable for request validation', () => {
  const api = service(); const tokens = new Set(Array.from({ length: 100 }, () => api.createPlaceSessionToken()));
  assert.equal(tokens.size, 100); for (const token of tokens) assert.match(token, /^[a-f0-9-]{36}$/);
});
test('configuration and quota errors remain actionable', async () => {
  const api = service(async () => response(503, { message: 'Check Google billing settings.' }));
  await assert.rejects(api.autocompletePlaces('Victoria', 'token'), /Check Google billing/);
});
test('malformed predictions and invalid coordinates are rejected', async () => {
  const api = service(async () => response(200, { suggestions: [{ place_id: 'test' }] }));
  await assert.rejects(api.autocompletePlaces('Vic', 'token'), /unexpected data/);
  for (const payload of [{ ...place, latitude: 91 }, { ...place, place_id: 'wrong' }, { ...place, attributions: null }]) {
    const bad = service(async () => response(200, payload));
    await assert.rejects(bad.resolvePlace('test', 'token'), /no usable coordinates/);
  }
});
test('caller cancellation reaches the network request', async () => {
  const aborter = new AbortController(); let requestSignal;
  const api = service(async (_, options) => {
    requestSignal = options.signal;
    return new Promise((resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('cancelled'))));
  });
  const pending = api.autocompletePlaces('Victoria', 'token', aborter.signal);
  aborter.abort(); await assert.rejects(pending, /cancelled/); assert.equal(requestSignal.aborted, true);
});
