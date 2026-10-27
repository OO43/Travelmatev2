/* global require, AbortController, setTimeout, clearTimeout, setInterval, clearInterval */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function compiled(path) { return ts.transpileModule(fs.readFileSync(path, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText; }
const serviceCode = compiled('src/services/liveUpdatesService.ts');
function service(fetch) {
  const context = { exports: {}, fetch, setTimeout, clearTimeout, AbortController,
    process: { env: { EXPO_PUBLIC_API_URL: 'http://localhost:8000' } },
    require: () => ({ isWalkingLeg: leg => leg.mode === 'walking' }) };
  vm.runInNewContext(serviceCode, context); return context.exports;
}
const snapshot = () => ({ source: 'tfl', received_at: new Date().toISOString(),
  legs: [{ leg_index: 1, line_id: 'jubilee', stop_id: '940GZZLUWSM', state: 'ok', fetched_at: new Date().toISOString(), message: null,
    predictions: [{ id: 'p1', destination: 'Stratford', platform: 'Eastbound', expected_arrival: new Date(Date.now() + 180000).toISOString(), generated_at: new Date().toISOString(), is_stale: false }] }],
  lines: [{ line_id: 'jubilee', name: 'Jubilee', state: 'ok', fetched_at: new Date().toISOString(), message: null, statuses: [{ description: 'Good Service', reason: null }] }] });
const journey = { id: 'tfl-one', source: 'tfl', status: 'planned', legs: [{ mode: 'walking' }, { mode: 'tube', line_id: 'jubilee', departure_stop_id: '940GZZLUWSM' }] };

test('only transport line and boarding-stop identifiers are sent to FastAPI', async () => {
  let sent;
  const api = service(async (url, options) => { sent = { url, body: JSON.parse(options.body) }; return { ok: true, json: async () => snapshot() }; });
  const request = api.liveRequestForJourney(journey); await api.getLiveUpdates(request);
  assert.equal(sent.url, 'http://localhost:8000/api/v1/journeys/live-updates');
  assert.deepEqual(sent.body, { legs: [{ leg_index: 1, line_id: 'jubilee', stop_id: '940GZZLUWSM' }] });
  assert.equal(api.liveRequestForJourney({ ...journey, source: 'demo' }), null);
  assert.equal(api.liveRequestForJourney({ ...journey, status: 'completed' }), null);
});
test('partial failures preserve last good sections without replacing their freshness timestamps', () => {
  const api = service(); const old = snapshot(), next = snapshot();
  next.legs[0] = { ...next.legs[0], state: 'unavailable', fetched_at: null, predictions: [], message: 'Offline' };
  next.lines[0] = { ...next.lines[0], state: 'unavailable', fetched_at: null, statuses: [], message: 'Offline' };
  const merged = api.mergeLiveUpdates(old, next);
  assert.equal(merged.legs[0].predictions[0].id, 'p1'); assert.equal(merged.legs[0].state, 'unavailable');
  assert.equal(merged.legs[0].fetched_at, old.legs[0].fetched_at); assert.equal(merged.lines[0].statuses[0].description, 'Good Service');
  assert.equal(api.isOutdated(merged.lines[0].fetched_at, Date.now(), true), true);
});
test('fresh empty predictions replace old rows, and another route never inherits them', () => {
  const api = service(); const old = snapshot(), next = snapshot(); next.legs[0].predictions = [];
  assert.equal(api.mergeLiveUpdates(old, next).legs[0].predictions.length, 0);
  next.legs[0] = { ...next.legs[0], stop_id: 'another-stop', state: 'unavailable', fetched_at: null };
  assert.equal(api.mergeLiveUpdates(old, next).legs[0].predictions.length, 0);
});
test('stale, future, missing and failed fetches are not presented as fresh', () => {
  const api = service(), now = Date.now();
  assert.equal(api.isOutdated(new Date(now - 121000).toISOString(), now), true);
  assert.equal(api.isOutdated(new Date(now + 60000).toISOString(), now), true);
  assert.equal(api.isOutdated(null, now), true);
  assert.equal(api.isOutdated(new Date(now).toISOString(), now, true), true);
  assert.equal(api.isOutdated(new Date(now).toISOString(), now), false);
  assert.equal(api.londonUpdateTime('2026-07-01T12:00:00Z'), '13:00');
  const row = snapshot().legs[0].predictions[0];
  assert.equal(api.predictionIsOutdated({ ...row, generated_at: new Date(now - 121000).toISOString() }, now), true);
  assert.equal(api.predictionIsOutdated({ ...row, valid_until: new Date(now - 1000).toISOString() }, now), true);
});
test('malformed predictions and API errors are rejected', async () => {
  const data = snapshot(); data.legs[0].predictions[0].expected_arrival = 'bad';
  await assert.rejects(service(async () => ({ ok: true, json: async () => data })).getLiveUpdates({ legs: [] }), /not usable/);
  await assert.rejects(service(async () => ({ ok: false, status: 503, json: async () => ({ message: 'TfL unavailable' }) })).getLiveUpdates({ legs: [] }), /TfL unavailable/);
});

// Lifecycle harness: exercises focus, backgrounding and late responses without a device.
function harness(fetcher) {
  const cells = []; let cursor = 0, cleanup, focusCallback, appListener;
  const intervals = [], startup = [], runner = { value: null };
  const native = { AppState: { currentState: 'active', addEventListener: (_, callback) => { appListener = callback; return { remove() { appListener = null; } }; } } };
  const react = {
    useState(initial) { const i = cursor++; if (!(i in cells)) cells[i] = typeof initial === 'function' ? initial() : initial;
      return [cells[i], value => { cells[i] = typeof value === 'function' ? value(cells[i]) : value; }]; },
    useRef(initial) { const i = cursor++; if (!(i in cells)) cells[i] = { current: initial }; return cells[i]; },
    useCallback(callback) { return callback; },
  };
  const api = service();
  const modules = { react, 'react-native': native,
    'expo-router': { useFocusEffect: callback => { focusCallback = callback; } },
    '@/services/liveUpdatesService': { ...api, getLiveUpdates: fetcher } };
  const context = { exports: {}, require: name => modules[name], AbortController, Error,
    setTimeout: fn => { startup.push(fn); return fn; }, clearTimeout: () => {},
    setInterval: (fn, ms) => { const item = { fn, ms, cleared: false }; intervals.push(item); return item; }, clearInterval: item => { item.cleared = true; } };
  vm.runInNewContext(compiled('src/viewModels/useJourneyLiveUpdates.ts'), context);
  return { render() { cursor = 0; return context.exports.useJourneyLiveUpdates(journey); },
    focus() { cleanup = focusCallback(); startup.splice(0).forEach(fn => fn()); }, blur() { cleanup?.(); },
    state(value) { native.AppState.currentState = value; appListener?.(value); },
    poll() { intervals.filter(item => item.ms === 60000 && !item.cleared).forEach(item => item.fn()); },
    intervals, runner };
}
const flush = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); };
test('polling runs only while focused and active; manual requests cannot overlap', async () => {
  let calls = 0, complete;
  const app = harness(() => { calls++; return new Promise(resolve => { complete = resolve; }); });
  app.render(); app.focus(); app.render().refresh(); app.poll(); assert.equal(calls, 1);
  complete(snapshot()); await flush(); app.state('background'); app.poll(); assert.equal(calls, 1);
  app.state('active'); assert.equal(calls, 2); complete(snapshot()); await flush();
  app.blur(); app.poll(); app.render().refresh(); assert.equal(calls, 2);
  assert.ok(app.intervals.every(item => item.cleared));
});
test('failed refresh keeps previous predictions and exposes the failure', async () => {
  let calls = 0;
  const app = harness(async () => { if (++calls > 1) throw new Error('Offline'); return snapshot(); });
  app.render(); app.focus(); await flush(); app.render().refresh(); await flush();
  const state = app.render(); assert.equal(state.error, 'Offline'); assert.equal(state.data.legs[0].predictions[0].id, 'p1');
});
test('a blurred screen discards a late response', async () => {
  let complete;
  const app = harness(() => new Promise(resolve => { complete = resolve; }));
  app.render(); app.focus(); app.blur(); complete(snapshot()); await flush();
  assert.equal(app.render().data, null);
});
