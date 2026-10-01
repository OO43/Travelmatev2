import type { JourneyPlannerInput, TransportMode } from './journey';

export type TicketScanSource = 'barcode' | 'ocr';

export type TicketIntelligenceResult = {
  ticketId: string;
  source: TicketScanSource;
  mode: TransportMode;
  provider?: string;
  serviceNumber?: string;
  passengerName?: string;
  seat?: string;
  gate?: string;
  confidence: number;
  plannerInput: JourneyPlannerInput;
  rawValue?: string;
  needsReview: boolean;
};
