export type PlacePrediction = { place_id: string; label: string; primary_text: string; secondary_text: string };
export type ResolvedPlace = {
  place_id: string; latitude: number; longitude: number;
  attributions: { provider: string; uri?: string | null }[];
};

// Unique per picker opening; suggestions and the selected place share this token.
export function createPlaceSessionToken() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
    const value = Math.floor(Math.random() * 16);
    return (char === 'x' ? value : (value & 3) | 8).toString(16);
  });
}

async function request(path: string, body: object, signal?: AbortSignal): Promise<unknown> {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  if (!baseUrl) throw new Error('Set EXPO_PUBLIC_API_URL to your FastAPI address.');
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort);
  if (signal?.aborted) controller.abort();
  const timeout = setTimeout(abort, 12000);
  try {
    const response = await fetch(`${baseUrl}/api/v1/places/${path}`, {
      method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal: controller.signal,
    });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const error = data as { message?: unknown } | null;
      throw new Error(typeof error?.message === 'string' ? error.message : `Place search failed (${response.status}).`);
    }
    return data;
  } catch (error) {
    if (signal?.aborted) throw error;
    if (controller.signal.aborted) throw new Error('Place search timed out. Try again or use manual entry.');
    if (error instanceof TypeError) throw new Error('Unable to reach place search. Check your connection and FastAPI address.');
    throw error;
  } finally {
    clearTimeout(timeout); signal?.removeEventListener('abort', abort);
  }
}

export async function autocompletePlaces(input: string, sessionToken: string, signal?: AbortSignal): Promise<PlacePrediction[]> {
  const data = await request('autocomplete', { input, session_token: sessionToken }, signal) as { suggestions?: unknown } | null;
  if (!Array.isArray(data?.suggestions) || !data.suggestions.every(item => item
    && typeof item.place_id === 'string' && typeof item.label === 'string'
    && typeof item.primary_text === 'string' && typeof item.secondary_text === 'string')) {
    throw new Error('Place search returned unexpected data.');
  }
  return data.suggestions;
}

export async function resolvePlace(placeId: string, sessionToken: string, signal?: AbortSignal): Promise<ResolvedPlace> {
  const data = await request('resolve', { place_id: placeId, session_token: sessionToken }, signal) as ResolvedPlace | null;
  if (!data || data.place_id !== placeId || !Number.isFinite(data.latitude) || !Number.isFinite(data.longitude)
    || Math.abs(data.latitude) > 90 || Math.abs(data.longitude) > 180 || !Array.isArray(data.attributions)
    || !data.attributions.every(item => item && typeof item.provider === 'string'
      && (item.uri == null || typeof item.uri === 'string'))) throw new Error('That place has no usable coordinates. Search again.');
  return data;
}

export function placeToJourneyLocation(place: ResolvedPlace, userQuery: string) {
  // Only the user's typed text goes into saved journey labels, not Google prediction content.
  return { id: `${place.latitude},${place.longitude}`, name: userQuery.trim().slice(0, 255) };
}
