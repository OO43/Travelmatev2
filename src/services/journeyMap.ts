import type { Journey, MapCoordinate } from '@/models/journey';
import { isWalkingLeg, legServiceLabel } from '@/services/journeyDisplay';

export function validCoordinate(value: unknown): value is MapCoordinate {
  if (!value || typeof value !== 'object') return false;
  const coordinate = value as MapCoordinate;
  return Number.isFinite(coordinate.latitude) && Number.isFinite(coordinate.longitude)
    && Math.abs(coordinate.latitude) <= 90 && Math.abs(coordinate.longitude) <= 180;
}
export function journeyMapData(journey: Journey) {
  const legs = (journey.legs ?? []).map((leg, index) => {
    const raw = leg.path;
    const path = Array.isArray(raw) && raw.length >= 2 && raw.length <= 10000 && raw.every(validCoordinate) ? raw : [];
    const departure = validCoordinate(leg.departure_coordinate) ? leg.departure_coordinate : path[0];
    const arrival = validCoordinate(leg.arrival_coordinate) ? leg.arrival_coordinate : path[path.length - 1];
    return { index, label: legServiceLabel(leg), walking: isWalkingLeg(leg), path, departure, arrival, leg };
  });
  const markers: { id: string; label: string; coordinate: MapCoordinate; kind: 'origin' | 'destination' | 'stop' }[] = [];
  if (legs[0]?.departure) markers.push({ id: 'origin', label: `Start: ${journey.origin}`, coordinate: legs[0].departure, kind: 'origin' });
  for (const item of legs.filter(item => !item.walking)) {
    if (item.departure) markers.push({ id: `board-${item.index}`, label: `Board ${item.label}: ${item.leg.origin}`, coordinate: item.departure, kind: 'stop' });
    if (item.arrival) markers.push({ id: `alight-${item.index}`, label: `Alight ${item.label}: ${item.leg.destination}`, coordinate: item.arrival, kind: 'stop' });
  }
  const last = legs[legs.length - 1];
  if (last?.arrival) markers.push({ id: 'destination', label: `Destination: ${journey.destination}`, coordinate: last.arrival, kind: 'destination' });
  const points = [...legs.flatMap(item => item.path), ...markers.map(marker => marker.coordinate)];
  return { legs, markers, points, missingPaths: legs.filter(item => !item.path.length).length };
}
export function regionForPoints(points: MapCoordinate[]) {
  const valid = points.filter(validCoordinate);
  if (!valid.length) return null;
  const bounds = valid.reduce((b, p) => ({ minLat: Math.min(b.minLat, p.latitude), maxLat: Math.max(b.maxLat, p.latitude),
    minLng: Math.min(b.minLng, p.longitude), maxLng: Math.max(b.maxLng, p.longitude) }),
  { minLat: Infinity, maxLat: -Infinity, minLng: Infinity, maxLng: -Infinity });
  const { minLat, maxLat, minLng, maxLng } = bounds;
  return { latitude: (minLat + maxLat) / 2, longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(0.006, (maxLat - minLat) * 1.5), longitudeDelta: Math.max(0.006, (maxLng - minLng) * 1.5) };
}
