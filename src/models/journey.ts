export type TransportMode = 'bus' | 'train' | 'flight' | 'car';

export type JourneyStatus =
  | 'planned'
  | 'boarding'
  | 'in_transit'
  | 'delayed'
  | 'arrived'
  | 'completed';

export type JourneyPlannerInput = {
  mode: TransportMode;
  origin: string;
  destination: string;
  departureDate?: string;
  departureTime?: string;
  useAccessibilityPreferences?: boolean;
  extraTransferTime?: boolean;
  stepFree?: boolean;
  originName?: string;
  destinationName?: string;
  ticketReference?: string;
};

export type JourneyTimelineItem = {
  id: string;
  title: string;
  detail: string;
  time?: string;
  completed: boolean;
  current?: boolean;
};

export type Journey = {
  id: string;
  source?: 'tfl' | 'demo';
  fetchedAt?: string;
  warnings?: string[];
  legs?: JourneyLeg[];
  mode: TransportMode;
  departureDate?: string;
  price?: string;
  arrivalDate?: string;
  changes?: number;
  recommended?: boolean;
  useAccessibilityPreferences?: boolean;
  provider: string;
  serviceNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  status: JourneyStatus;
  platform?: string;
  seat?: string;
  gate?: string;
  stops?: number;
  ticketReference?: string;
  accessibilityFeatures: string[];
  timeline: JourneyTimelineItem[];
};

export type LocationOption = { id: string; name: string };
export type JourneyLeg = {
  mode: string;
  origin: string;
  destination: string;
  departure_at: string;
  arrival_at: string;
  duration_minutes: number;
  instruction: string;
  line_id: string | null;
  line_name: string | null;
  departure_stop_id: string | null;
  arrival_stop_id: string | null;
  stop_ids: string[];
  disruptions: string[];
};

export const TRANSPORT_LABELS: Record<TransportMode, string> = {
  bus: 'Bus',
  train: 'Train',
  flight: 'Flight',
  car: 'Car hire',
};
