import type { Journey, JourneyLeg } from '@/models/journey';

export function isWalkingLeg(leg: JourneyLeg) { return ['walking', 'walk', 'interchange'].includes(leg.mode.toLowerCase()); }
export function legModeLabel(leg: JourneyLeg): string {
  const labels: Record<string, string> = { bus: 'Bus', 'public-bus': 'Bus', tube: 'Tube', dlr: 'DLR', overground: 'Overground', 'elizabeth-line': 'Elizabeth line', train: 'Train', 'national-rail': 'Train', tram: 'Tram', walking: 'Walk', walk: 'Walk', interchange: 'Transfer' };
  return labels[leg.mode] ?? leg.mode.replace(/-/g, ' ');
}
export function legServiceLabel(leg: JourneyLeg): string {
  const mode = legModeLabel(leg);
  return isWalkingLeg(leg) || !leg.line_name || leg.line_name.toLowerCase() === mode.toLowerCase() ? mode : `${mode} ${leg.line_name}`;
}
export function journeySummary(journey: Journey) {
  const legs = journey.legs ?? [];
  const walkingMinutes = legs.filter(isWalkingLeg).reduce((sum, leg) => sum + Math.max(0, leg.duration_minutes), 0);
  const transit = legs.filter(leg => !isWalkingLeg(leg));
  const changes = legs.length ? Math.max(0, transit.length - 1) : journey.changes ?? 0;
  return { walkingMinutes, changes, changesLabel: changes ? `${changes} ${changes === 1 ? 'change' : 'changes'}` : 'No vehicle changes' };
}
export function transferMinutes(previous: JourneyLeg, next: JourneyLeg): number {
  const gap = (Date.parse(next.departure_at) - Date.parse(previous.arrival_at)) / 60000;
  return Number.isFinite(gap) && gap >= 1 ? Math.floor(gap) : 0;
}
export function legTimeRange(leg: JourneyLeg): string {
  const from = leg.departure_at.slice(11, 16); const to = leg.arrival_at.slice(11, 16);
  const dateChanged = leg.departure_at.slice(0, 10) !== leg.arrival_at.slice(0, 10);
  return `${from}–${to}${dateChanged ? ` (${leg.arrival_at.slice(0, 10)})` : ''}`;
}
export function snapshotLabel(value?: string): string {
  if (!value || !Number.isFinite(Date.parse(value))) return 'TfL journey snapshot';
  return 'TfL data fetched ' + new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) + ' · London time';
}
export function journeyWarnings(journey: Journey): string[] {
  return [...new Set([...(journey.warnings ?? []), ...(journey.legs ?? []).flatMap(leg => leg.disruptions ?? [])].filter(Boolean))];
}
