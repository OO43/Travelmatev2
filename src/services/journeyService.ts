import type { Journey, JourneyLeg, JourneyPlannerInput, LocationOption } from '@/models/journey';
import { planJourneyOptions as planDemoOptions } from '@/services/demoJourneyService';

export type LocationChoices = { origin: LocationOption[]; destination: LocationOption[] };
export class JourneyPlanningError extends Error {
  constructor(message: string, readonly choices?: LocationChoices) { super(message); this.name = 'JourneyPlanningError'; }
}
type TflRoute = {
  id: string; source: 'tfl'; mode: 'bus' | 'train'; provider: string; service_number: string;
  origin: string; destination: string; departure_at: string; arrival_at: string;
  duration_minutes: number; changes: number; fare_pence: number | null;
  accessibility_features: string[]; warnings: string[]; legs: JourneyLeg[];
};
type TflResponse = { source: 'tfl'; fetched_at: string; journeys: TflRoute[] };

function providerLocationName(location: string, name?: string) {
  // Coordinate searches must let TfL resolve its own names. Google search text
  // may be only "Vic" or "Wool" and must not become the saved endpoint label.
  const coordinate = /^\s*[+-]?\d+(?:\.\d+)?\s*,\s*[+-]?\d+(?:\.\d+)?\s*$/.test(location);
  return coordinate ? undefined : name;
}

export function mapTflJourney(route: TflRoute, fetchedAt: string, input: JourneyPlannerInput): Journey {
  // The API returns Europe/London timestamps. Preserve London date/time even when the phone uses a different timezone.
  return {
    id: route.id, source: 'tfl', fetchedAt, mode: route.mode, provider: route.provider,
    serviceNumber: route.service_number, origin: route.origin, destination: route.destination,
    departureDate: route.departure_at.slice(0, 10), arrivalDate: route.arrival_at.slice(0, 10),
    departureTime: route.departure_at.slice(11, 16), arrivalTime: route.arrival_at.slice(11, 16),
    durationMinutes: route.duration_minutes, status: 'planned', changes: route.changes,
    price: route.fare_pence === null ? 'Fare unavailable' : '£' + (route.fare_pence / 100).toFixed(2),
    useAccessibilityPreferences: input.useAccessibilityPreferences ?? true,
    ticketReference: input.ticketReference, accessibilityFeatures: route.accessibility_features,
    warnings: route.warnings, legs: route.legs,
    timeline: [...route.legs.map((leg, index) => ({
      id: `${route.id}-leg-${index}`, title: leg.instruction || `${leg.origin} → ${leg.destination}`,
      detail: `${leg.origin} → ${leg.destination} · ${leg.duration_minutes} min`,
      time: leg.departure_at.slice(11, 16), completed: false,
    })), { id: `${route.id}-arrival`, title: `Arrive at ${route.destination}`,
      detail: 'TfL planned arrival. Automatic tracking and stop reminders are not connected.',
      time: route.arrival_at.slice(11, 16), completed: false }],
  };
}

function isResponse(value: unknown): value is TflResponse {
  if (!value || typeof value !== 'object') return false;
  const response = value as Partial<TflResponse>;
  return response.source === 'tfl' && typeof response.fetched_at === 'string' && Array.isArray(response.journeys)
    && response.journeys.every(route => route && route.source === 'tfl' && typeof route.id === 'string'
      && typeof route.departure_at === 'string' && typeof route.arrival_at === 'string'
      && Array.isArray(route.legs) && Array.isArray(route.accessibility_features) && Array.isArray(route.warnings));
}
function locationChoices(value: unknown): LocationChoices | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const choices = value as Record<string, unknown>;
  const list = (items: unknown): LocationOption[] => Array.isArray(items)
    ? items.filter((item): item is LocationOption => item && typeof item.id === 'string' && typeof item.name === 'string') : [];
  return { origin: list(choices.origin), destination: list(choices.destination) };
}

export async function planJourneyOptions(input: JourneyPlannerInput): Promise<Journey[]> {
  if (process.env.EXPO_PUBLIC_JOURNEY_PROVIDER === 'demo') return planDemoOptions(input);
  if (input.mode !== 'bus' && input.mode !== 'train') throw new JourneyPlanningError('TfL planning supports London bus and rail journeys. Flights and car hire need another provider.');
  if (['current location', 'my location'].includes(input.origin.trim().toLowerCase())) throw new JourneyPlanningError('Enter a London station, stop or postcode in From. Device location is not connected yet.');
  const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  if (!baseUrl) throw new JourneyPlanningError('Set EXPO_PUBLIC_API_URL in the app .env to your FastAPI address.');
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(`${baseUrl}/api/v1/journeys/plan`, {
      method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, signal: controller.signal,
      body: JSON.stringify({ origin: input.origin, destination: input.destination,
        origin_name: providerLocationName(input.origin, input.originName),
        destination_name: providerLocationName(input.destination, input.destinationName), mode: input.mode,
        departure_date: input.departureDate, departure_time: input.departureTime,
        step_free: Boolean(input.useAccessibilityPreferences && input.stepFree),
        extra_transfer_time: Boolean(input.useAccessibilityPreferences && input.extraTransferTime) }),
    });
    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const error = body && typeof body === 'object' ? body as Record<string, unknown> : {};
      throw new JourneyPlanningError(typeof error.message === 'string' ? error.message : `Journey search failed (${response.status}). Check your locations and try again.`,
        error.code === 'LOCATION_AMBIGUOUS' ? locationChoices(error.details) : undefined);
    }
    if (!isResponse(body)) throw new JourneyPlanningError('The journey API returned unexpected data. Check the backend version.');
    return body.journeys.map(route => mapTflJourney(route, body.fetched_at, input));
  } catch (error) {
    if (error instanceof JourneyPlanningError) throw error;
    throw new JourneyPlanningError(controller.signal.aborted ? 'The journey search timed out. Please try again.' : 'Unable to reach the journey API. Check FastAPI, your Wi-Fi and EXPO_PUBLIC_API_URL.');
  } finally { clearTimeout(timeout); }
}

export async function planJourney(input: JourneyPlannerInput): Promise<Journey> {
  const options = await planJourneyOptions(input);
  if (!options.length) throw new JourneyPlanningError('No routes found. Try a different time or location.');
  return options[0];
}
