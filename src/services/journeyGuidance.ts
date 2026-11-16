import type { Journey } from '@/models/journey';
import { legServiceLabel } from '@/services/journeyDisplay';

export type JourneyReminder = {
  id: string;
  title: string;
  detail: string;
  opensAt: number;
  scheduledAt: number;
};

const minute = 60_000;
const transportModes = new Set([
  'bus', 'public-bus', 'train', 'rail', 'national-rail', 'tube', 'dlr',
  'overground', 'elizabeth-line', 'tram', 'metro', 'light-rail', 'coach', 'ferry', 'boat',
]);

function absoluteTime(value: string) {
  return /(?:Z|[+-]\d{2}:\d{2})$/i.test(value) ? Date.parse(value) : NaN;
}

export function buildJourneyReminders(journey: Journey): JourneyReminder[] {
  if (journey.source !== 'tfl' && journey.source !== 'transportapi') return [];
  if (journey.status === 'completed' || journey.status === 'arrived') return [];

  const rides = (journey.legs ?? []).flatMap((leg, index) =>
    transportModes.has(leg.mode.toLowerCase()) ? [{ leg, index }] : []);
  const reminders: JourneyReminder[] = [];
  for (let position = 0; position < rides.length; position++) {
    const { leg, index } = rides[position];
    const departure = absoluteTime(leg.departure_at);
    const arrival = absoluteTime(leg.arrival_at);
    if (!Number.isFinite(departure) || !Number.isFinite(arrival) || arrival <= departure) continue;
    const service = legServiceLabel(leg);
    const previousArrival = position > 0 ? absoluteTime(rides[position - 1].leg.arrival_at) : -Infinity;
    const opensAt = Math.max(departure - (position === 0 ? 5 : 3) * minute,
      Number.isFinite(previousArrival) ? previousArrival : -Infinity);
    if (opensAt < departure) {
      reminders.push({
        id: index + ':boarding',
        title: position === 0 ? 'Get ready to board' : 'Get ready to transfer',
        detail: service + ' is scheduled to leave from ' + leg.origin + '.',
        opensAt, scheduledAt: departure,
      });
    }
    reminders.push({
      id: index + ':alighting',
      title: 'Prepare to get off',
      detail: 'Your planned stop is ' + leg.destination + '. Check the onboard display or announcements.',
      opensAt: Math.max(departure, arrival - 2 * minute), scheduledAt: arrival,
    });
  }
  return reminders.sort((a, b) => a.scheduledAt - b.scheduledAt);
}

export function pendingJourneyReminders(reminders: JourneyReminder[], now: number) {
  return reminders.filter(reminder => now < reminder.scheduledAt);
}

export function readyJourneyReminders(reminders: JourneyReminder[], now: number, delivered: ReadonlySet<string>) {
  return pendingJourneyReminders(reminders, now).filter(reminder =>
    now >= reminder.opensAt && !delivered.has(reminder.id));
}
