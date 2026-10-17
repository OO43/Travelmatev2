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

export const TRANSPORT_LABELS: Record<TransportMode, string> = {
  bus: 'Bus',
  train: 'Train',
  flight: 'Flight',
  car: 'Car hire',
};
