import type { Journey, JourneyPlannerInput, TransportMode } from '@/models/journey';

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const modeDetails: Record<TransportMode, {
  provider: string;
  serviceNumber: string;
  durationMinutes: number;
  platform?: string;
  gate?: string;
  stops?: number;
}> = {
  bus: { provider: 'First Bus', serviceNumber: '24', durationMinutes: 28, stops: 8 },
  train: { provider: 'Avanti West Coast', serviceNumber: '1A42', durationMinutes: 72, platform: '4' },
  flight: { provider: 'British Airways', serviceNumber: 'BA1475', durationMinutes: 85, gate: 'B14' },
  car: { provider: 'TravelMate Cars', serviceNumber: 'TM-204', durationMinutes: 24 },
};

function timelineFor(mode: TransportMode, origin: string, destination: string) {
  const middle = mode === 'flight'
    ? 'Security and gate guidance'
    : mode === 'train'
      ? 'Platform and boarding guidance'
      : 'Accessible boarding point';

  return [
    { id: 'ready', title: 'Journey ready', detail: `Start from ${origin}`, time: '09:20', completed: true },
    { id: 'boarding', title: middle, detail: 'Assistance preferences have been applied', time: '09:35', completed: false, current: true },
    { id: 'travel', title: 'Travel in progress', detail: 'Live updates and reminders appear here', completed: false },
    { id: 'arrival', title: `Arrive at ${destination}`, detail: 'TravelMate will alert you before arrival', completed: false },
  ];
}

export async function planJourney(input: JourneyPlannerInput): Promise<Journey> {
  await wait(650);
  const details = modeDetails[input.mode];

  return {
    id: `JRN-${Date.now()}`,
    mode: input.mode,
    provider: details.provider,
    serviceNumber: details.serviceNumber,
    origin: input.origin,
    destination: input.destination,
    departureTime: '09:40',
    arrivalTime: input.mode === 'flight' ? '11:05' : input.mode === 'train' ? '10:52' : '10:08',
    durationMinutes: details.durationMinutes,
    status: 'boarding',
    platform: details.platform,
    gate: details.gate,
    stops: details.stops,
    ticketReference: input.ticketReference,
    accessibilityFeatures: ['Step-free route', 'Haptic reminders', 'Extra boarding time'],
    timeline: timelineFor(input.mode, input.origin, input.destination),
  };
}
