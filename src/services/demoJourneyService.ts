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

export async function planJourneyOptions(input: JourneyPlannerInput): Promise<Journey[]> {
  const base = await planJourney(input);
  const [hour, minute] = (input.departureTime ?? '09:40').split(':').map(Number);
  const start = hour * 60 + minute;
  const dateFor = (minutes: number) => {
    if (!input.departureDate) return undefined;
    const date = new Date(input.departureDate + 'T12:00:00');
    date.setDate(date.getDate() + Math.floor(minutes / 1440));
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  };
  const time = (minutes: number) => {
    const value = ((minutes % 1440) + 1440) % 1440;
    return String(Math.floor(value / 60)).padStart(2, '0') + ':' + String(value % 60).padStart(2, '0');
  };
  const directDuration = input.mode === 'bus' ? 18 : base.durationMinutes;
  const alternativeService = { bus: '48', train: '1A48', flight: 'BA1481', car: 'TM-208' }[input.mode];
  return [0, 1].map(index => {
    const durationMinutes = directDuration + (index ? 12 + (input.useAccessibilityPreferences && input.extraTransferTime ? 8 : 0) : 0);
    const departure = start + (index ? 15 : 5);
    const accessibilityFeatures = input.useAccessibilityPreferences
      ? ['Step-free', input.mode === 'bus' ? 'Low-floor bus' : 'Accessible boarding', 'Assistance available']
      : ['Route preview'];
    return {
      ...base, source: 'demo', id: base.id + '-' + index, departureDate: dateFor(departure), arrivalDate: dateFor(departure + durationMinutes),
      departureTime: time(departure), arrivalTime: time(departure + durationMinutes),
      durationMinutes, status: 'planned', serviceNumber: index ? alternativeService : base.serviceNumber,
      price: input.mode === 'bus' ? (index ? '£2.50' : '£2.00') : input.mode === 'train' ? '£16.50' : input.mode === 'flight' ? '£95.00' : '£20.00',
      changes: index && input.mode !== 'car' ? 1 : 0, recommended: index === 0,
      useAccessibilityPreferences: input.useAccessibilityPreferences ?? true, accessibilityFeatures,
      timeline: [
        { id: 'ready', title: 'Journey planned', detail: 'Review this route preview before confirming.', time: time(start), completed: true },
        { id: 'boarding', title: 'Boarding', detail: 'Use the selected boarding point.', time: time(departure), completed: false },
        { id: 'travel', title: 'Travel', detail: 'Live tracking is not connected in this preview.', completed: false },
        { id: 'arrival', title: 'Arrive at ' + input.destination, detail: 'Planned arrival time.', time: time(departure + durationMinutes), completed: false },
      ],
    };
  });
}
