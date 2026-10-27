import * as Location from 'expo-location';
import type { LocationOption } from '@/models/journey';

export class DeviceLocationError extends Error {
  constructor(message: string, readonly canOpenSettings = false) { super(message); this.name = 'DeviceLocationError'; }
}
export type DeviceOrigin = { location: LocationOption; message: string };

function cancelled() { return new DeviceLocationError('Location request stopped.'); }

function waitFor<T>(operation: Promise<T>, signal?: AbortSignal, timeoutMs?: number): Promise<T> {
  return new Promise((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const cleanup = () => { if (timer) clearTimeout(timer); signal?.removeEventListener('abort', abort); };
    const abort = () => { cleanup(); reject(cancelled()); };
    operation.then(value => { cleanup(); resolve(value); }, error => { cleanup(); reject(error); });
    if (signal?.aborted) { reject(cancelled()); return; }
    signal?.addEventListener('abort', abort, { once: true });
    if (timeoutMs) timer = setTimeout(() => { cleanup(); reject(new DeviceLocationError('Finding your location took too long. Try again outdoors or enter your starting point manually.')); }, timeoutMs);
  });
}

export function deviceOriginFromPosition(position: Location.LocationObject, now = Date.now()): DeviceOrigin {
  const { latitude, longitude, accuracy } = position.coords;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180
    || !Number.isFinite(position.timestamp) || now - position.timestamp > 60000 || position.timestamp > now + 10000) {
    throw new DeviceLocationError('Your location could not be confirmed. Try again or enter your starting point manually.');
  }
  if (accuracy !== null && (!Number.isFinite(accuracy) || accuracy < 0 || accuracy > 1000)) {
    throw new DeviceLocationError('Your location is too approximate to choose a starting point. Enable precise location or enter a nearby station manually.', true);
  }
  return {
    location: { id: `${latitude},${longitude}`, name: 'Your current location' },
    message: accuracy === null ? 'Starting point set from your device. Accuracy is unavailable; check the route before travelling.'
      : `Starting point set from your device · accuracy about ${Math.max(1, Math.round(accuracy))} m. Check the route before travelling.`,
  };
}

export async function getDeviceOrigin(signal?: AbortSignal): Promise<DeviceOrigin> {
  if (signal?.aborted) throw cancelled();
  try {
    let permission = await waitFor(Location.getForegroundPermissionsAsync(), signal);
    if (!permission.granted && permission.canAskAgain) {
      permission = await waitFor(Location.requestForegroundPermissionsAsync(), signal);
    }
    if (!permission.granted) {
      throw new DeviceLocationError('Location permission is off. Allow location access in Settings or enter your starting point manually.', !permission.canAskAgain);
    }
    if (!await waitFor(Location.hasServicesEnabledAsync(), signal)) {
      throw new DeviceLocationError('Location services are switched off. Turn them on in device Settings or enter your starting point manually.', true);
    }
    const position = await waitFor(Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }), signal, 20000);
    if (signal?.aborted) throw cancelled();
    return deviceOriginFromPosition(position);
  } catch (error) {
    if (signal?.aborted) throw cancelled();
    if (error instanceof DeviceLocationError) throw error;
    throw new DeviceLocationError('Unable to get your location. Check location permission and services, then retry or enter your starting point manually.');
  }
}
