/* global require */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function read(path, modules = {}) {
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const context = { exports: {}, require: name => modules[name] }; vm.runInNewContext(code, context); return context.exports;
}
const display = read('src/services/journeyDisplay.ts');
const { journeyMapData, regionForPoints } = read('src/services/journeyMap.ts', { '@/services/journeyDisplay': display });
const point = (latitude, longitude) => ({ latitude, longitude });
const a = point(51.496, -0.14), b = point(51.5, -0.13), c = point(51.501, -0.125);
const route = { origin: 'Victoria', destination: 'Westminster', legs: [
  { mode: 'walking', origin: 'Victoria', destination: 'Boarding stop', path: [a, b] },
  { mode: 'bus', line_name: '11', origin: 'Boarding stop', destination: 'Parliament Square', path: [b, c] },
] };
test('walking and transport paths remain separate and markers use supplied coordinates', () => {
  const map = journeyMapData(route);
  assert.equal(map.legs[0].walking, true); assert.equal(map.legs[1].walking, false);
  assert.equal(map.markers.find(marker => marker.id === 'board-1').coordinate, b);
  assert.equal(map.markers.at(-1).kind, 'destination'); assert.equal(map.missingPaths, 0);
});
test('missing or corrupted paths never become invented straight lines', () => {
  const map = journeyMapData({ ...route, legs: [{ ...route.legs[0], path: [a, { latitude: 999, longitude: 0 }, b], departure_coordinate: a, arrival_coordinate: b }] });
  assert.equal(map.legs[0].path.length, 0); assert.equal(map.missingPaths, 1); assert.equal(map.markers.length, 2);
});
test('old saved journeys have a safe no-map state', () => {
  const map = journeyMapData({ origin: 'A', destination: 'B', timeline: [] });
  assert.equal(map.points.length, 0); assert.equal(regionForPoints(map.points), null);
});
test('bounds cover the route and single-point extents remain usable', () => {
  const region = regionForPoints([a, b, c]);
  assert.ok(region.latitudeDelta >= c.latitude - a.latitude);
  assert.ok(region.longitudeDelta >= c.longitude - a.longitude);
  assert.ok(regionForPoints([a]).latitudeDelta > 0);
});
