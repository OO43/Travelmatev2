import type { Journey } from '@/models/journey';
import type { ArrivalPrediction, LiveUpdates, LiveUpdatesRequest } from '@/models/liveUpdates';
import { isWalkingLeg } from '@/services/journeyDisplay';

export function liveRequestForJourney(journey: Journey): LiveUpdatesRequest | null {
  if (journey.source !== 'tfl' || journey.status === 'completed' || journey.status === 'arrived') return null;
  const legs = (journey.legs ?? []).flatMap((leg, index) => !isWalkingLeg(leg) && leg.line_id
    ? [{ leg_index: index, line_id: leg.line_id, stop_id: leg.departure_stop_id ?? null }] : []).slice(0, 6);
  return legs.length ? { legs } : null;
}

export function isOutdated(fetchedAt: string | null, now: number, failed = false) {
  const time = fetchedAt ? Date.parse(fetchedAt) : NaN;
  return failed || !Number.isFinite(time) || now - time > 120000 || time > now + 30000;
}
export function londonUpdateTime(value: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return 'Not received';
  return new Date(value).toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' });
}

export function predictionIsOutdated(row: ArrivalPrediction, now: number, sectionStale = false) {
  return sectionStale || row.is_stale || isOutdated(row.generated_at, now)
    || Boolean(row.valid_until && Date.parse(row.valid_until) <= now);
}

export function mergeLiveUpdates(previous: LiveUpdates | null, next: LiveUpdates): LiveUpdates {
  return { ...next,
    legs: next.legs.map(leg => {
      const old = previous?.legs.find(item => item.leg_index === leg.leg_index && item.line_id === leg.line_id && item.stop_id === leg.stop_id);
      return leg.state !== 'ok' && old ? { ...leg, fetched_at: old.fetched_at, predictions: old.predictions } : leg;
    }),
    lines: next.lines.map(line => {
      const old = previous?.lines.find(item => item.line_id === line.line_id);
      return line.state !== 'ok' && old ? { ...line, name: old.name, fetched_at: old.fetched_at, statuses: old.statuses } : line;
    }),
  };
}

function validUpdates(value: unknown): value is LiveUpdates {
  if (!value || typeof value !== 'object') return false;
  const data = value as LiveUpdates;
  const date = (s: unknown) => typeof s === 'string' && Number.isFinite(Date.parse(s));
  const text = (s: unknown) => s === null || typeof s === 'string';
  return data.source === 'tfl' && date(data.received_at) && Array.isArray(data.legs) && Array.isArray(data.lines)
    && data.legs.every(leg => leg && Number.isInteger(leg.leg_index) && typeof leg.line_id === 'string'
      && text(leg.stop_id) && text(leg.message)
      && ['ok', 'unavailable', 'unsupported'].includes(leg.state) && (leg.fetched_at === null || date(leg.fetched_at))
      && Array.isArray(leg.predictions) && leg.predictions.every(row => row && typeof row.id === 'string'
        && typeof row.destination === 'string' && (row.platform === null || typeof row.platform === 'string')
        && date(row.expected_arrival) && (row.generated_at === null || date(row.generated_at))
        && (row.valid_until == null || date(row.valid_until)) && typeof row.is_stale === 'boolean'))
    && data.lines.every(line => line && typeof line.line_id === 'string' && typeof line.name === 'string'
      && text(line.message)
      && ['ok', 'unavailable'].includes(line.state) && (line.fetched_at === null || date(line.fetched_at))
      && Array.isArray(line.statuses) && line.statuses.every(status => status && typeof status.description === 'string'
        && (status.reason === null || typeof status.reason === 'string')));
}

export async function getLiveUpdates(input: LiveUpdatesRequest, signal?: AbortSignal): Promise<LiveUpdates> {
  const base = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  if (!base) throw new Error('The journey API address is not configured.');
  const aborter = new AbortController(); const abort = () => aborter.abort();
  signal?.addEventListener('abort', abort); if (signal?.aborted) abort();
  const timer = setTimeout(abort, 25000);
  try {
    const response = await fetch(`${base}/api/v1/journeys/live-updates`, { method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal: aborter.signal });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const error = data as { message?: unknown } | null;
      throw new Error(typeof error?.message === 'string' ? error.message : `Live updates unavailable (${response.status}).`);
    }
    if (!validUpdates(data)) throw new Error('The live update response was not usable. Try again.');
    return data;
  } catch (error) {
    if (signal?.aborted) throw error;
    if (aborter.signal.aborted) throw new Error('Live updates timed out. Please try again.');
    if (error instanceof TypeError) throw new Error('Unable to refresh updates. Check your connection.');
    throw error;
  } finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
}
