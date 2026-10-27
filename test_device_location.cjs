/* global require, AbortController, setTimeout, clearTimeout */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function compile(path) {
  return ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
}
const serviceSource = compile('src/services/deviceLocationService.ts');
const hookSource = compile('src/viewModels/useJourneyPlannerViewModel.ts');
const position = () => ({ timestamp: Date.now(), coords: { latitude: 51.4965, longitude: -0.1447, accuracy: 25 } });
const granted = { granted: true, canAskAgain: true };
function locationService(overrides = {}, timers = {}) {
  const native = { Accuracy: { High: 4 }, getForegroundPermissionsAsync: async () => granted,
    requestForegroundPermissionsAsync: async () => granted, hasServicesEnabledAsync: async () => true,
    getCurrentPositionAsync: async () => position(), ...overrides };
  const context = { exports: {}, require: () => native, setTimeout, clearTimeout, ...timers };
  vm.runInNewContext(serviceSource, context); return context.exports;
}

test('foreground permission is requested on explicit use and coordinates become TfL input', async () => {
  let requested = 0, options;
  const api = locationService({ getForegroundPermissionsAsync: async () => ({ granted: false, canAskAgain: true }),
    requestForegroundPermissionsAsync: async () => { requested++; return granted; },
    getCurrentPositionAsync: async value => { options = value; return position(); } });
  assert.equal(requested, 0);
  const result = await api.getDeviceOrigin();
  assert.equal(requested, 1); assert.equal(options.accuracy, 4);
  assert.equal(result.location.id, '51.4965,-0.1447'); assert.equal(result.location.name, 'Your current location');
  assert.match(result.message, /25 m/);
});
test('permanent denial offers settings without another prompt or GPS call', async () => {
  let called = false;
  const api = locationService({ getForegroundPermissionsAsync: async () => ({ granted: false, canAskAgain: false }),
    requestForegroundPermissionsAsync: async () => { called = true; }, getCurrentPositionAsync: async () => { called = true; } });
  await assert.rejects(api.getDeviceOrigin(), error => error.canOpenSettings === true && /permission is off/.test(error.message));
  assert.equal(called, false);
});
test('a denied first prompt preserves manual entry', async () => {
  const api = locationService({ getForegroundPermissionsAsync: async () => ({ granted: false, canAskAgain: true }),
    requestForegroundPermissionsAsync: async () => ({ granted: false, canAskAgain: true }) });
  await assert.rejects(api.getDeviceOrigin(), /enter your starting point manually/);
});
test('disabled services fail before GPS is requested', async () => {
  const api = locationService({ hasServicesEnabledAsync: async () => false,
    getCurrentPositionAsync: async () => { throw new Error('should not call'); } });
  await assert.rejects(api.getDeviceOrigin(), error => /services are switched off/.test(error.message) && error.canOpenSettings);
});
test('old, invalid and excessively approximate positions are rejected', () => {
  const api = locationService();
  for (const value of [{ ...position(), timestamp: Date.now() - 61000 },
    { ...position(), coords: { latitude: 91, longitude: 0, accuracy: 20 } },
    { ...position(), coords: { latitude: 51, longitude: 0, accuracy: 2000 } }]) {
    assert.throws(() => api.deviceOriginFromPosition(value), /location/);
  }
  assert.match(api.deviceOriginFromPosition({ ...position(), coords: { latitude: 51, longitude: 0, accuracy: null } }).message, /Accuracy is unavailable/);
});
test('timed out native position cannot later become a successful result', async () => {
  let finish;
  const api = locationService({ getCurrentPositionAsync: () => new Promise(resolve => { finish = resolve; }) },
    { setTimeout: callback => setTimeout(callback, 0) });
  await assert.rejects(api.getDeviceOrigin(), /too long/);
  finish(position());
});
test('abort while permission prompt is open prevents the later GPS request', async () => {
  let permissionResolve, gpsCalled = false;
  const api = locationService({ getForegroundPermissionsAsync: () => new Promise(resolve => { permissionResolve = resolve; }),
    getCurrentPositionAsync: async () => { gpsCalled = true; return position(); } });
  const aborter = new AbortController(); const pending = api.getDeviceOrigin(aborter.signal);
  aborter.abort(); permissionResolve(granted);
  await assert.rejects(pending, /stopped/); assert.equal(gpsCalled, false);
});

function plannerHarness(getOrigin) {
  const cells = []; const cleanups = []; let cursor = 0;
  const react = {
    useState(initial) { const index = cursor++; if (!(index in cells)) cells[index] = typeof initial === 'function' ? initial() : initial;
      return [cells[index], value => { cells[index] = typeof value === 'function' ? value(cells[index]) : value; }]; },
    useRef(initial) { const index = cursor++; if (!(index in cells)) cells[index] = { current: initial }; return cells[index]; },
    useEffect(effect) { const index = cursor++; if (!(index in cells)) { cells[index] = true; cleanups.push(effect()); } },
  };
  let planInput;
  const modules = {
    react, 'react-native': { Linking: { openSettings: async () => {} }, Platform: { OS: 'ios' } },
    '@/services/journeyService': { JourneyPlanningError: class extends Error {}, planJourneyOptions: async input => { planInput = input; return []; } },
    '@/state/TravelmateStore': { useTravelmateStore: () => ({ latestTicket: null, profile: { assistancePreferences: {}, accessibilityNeeds: {} } }) },
    '@/services/journeySessionService': {}, '@/services/placeService': {},
    '@/services/deviceLocationService': { getDeviceOrigin: getOrigin, DeviceLocationError: class extends Error {} },
  };
  const context = { exports: {}, require: name => modules[name], AbortController };
  vm.runInNewContext(hookSource, context);
  return { render() { cursor = 0; return context.exports.useJourneyPlannerViewModel('bus', 'Westminster'); },
    unmount() { cleanups.forEach(cleanup => cleanup?.()); }, input: () => planInput };
}
test('manual origin selection wins over a late native response', async () => {
  let finish;
  const harness = plannerHarness(() => new Promise(resolve => { finish = resolve; }));
  let model = harness.render(); const pending = model.locateOrigin();
  model = harness.render(); assert.equal(model.isLocating, true);
  model.setOrigin('Victoria Station');
  finish({ location: { id: '51.5,-0.1', name: 'Your current location' }, message: 'Located' });
  await pending; model = harness.render(); assert.equal(model.origin, 'Victoria Station'); assert.equal(model.isLocating, false);
});
test('successful device origin is sent as coordinates and duplicate taps do not start extra requests', async () => {
  let finish, calls = 0;
  const harness = plannerHarness(() => { calls++; return new Promise(resolve => { finish = resolve; }); });
  let model = harness.render(); const pending = model.locateOrigin();
  await model.locateOrigin(); assert.equal(calls, 1);
  await model.findJourney(); assert.equal(harness.input(), undefined);
  finish({ location: { id: '51.5,-0.1', name: 'Your current location' }, message: 'Located' });
  await pending; model = harness.render(); await model.findJourney();
  assert.equal(harness.input().origin, '51.5,-0.1'); assert.equal(harness.input().originName, 'Your current location');
});
test('unmount discards a late location update', async () => {
  let finish;
  const harness = plannerHarness(() => new Promise(resolve => { finish = resolve; }));
  const model = harness.render(); const pending = model.locateOrigin(); harness.unmount();
  finish({ location: { id: '51.5,-0.1', name: 'Your current location' }, message: 'Located' });
  await pending; assert.equal(harness.render().origin, 'Current location');
});
