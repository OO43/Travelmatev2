import type { TransportMode } from '@/models/journey';
import type { TicketIntelligenceResult } from '@/models/ticket';

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

function inferMode(value: string): TransportMode {
  const normalised = value.toLowerCase();
  if (normalised.includes('flight') || normalised.includes('air') || normalised.includes('ba')) return 'flight';
  if (normalised.includes('train') || normalised.includes('rail') || normalised.includes('avanti')) return 'train';
  return 'bus';
}

function defaultsFor(mode: TransportMode) {
  if (mode === 'flight') return { origin: 'Glasgow Airport', destination: 'London Heathrow', provider: 'British Airways', serviceNumber: 'BA1475' };
  if (mode === 'train') return { origin: 'Glasgow Central', destination: 'Manchester Piccadilly', provider: 'Avanti West Coast', serviceNumber: '1A42' };
  return { origin: 'Leicester Station', destination: 'Leicester Royal Infirmary', provider: 'First Bus', serviceNumber: '24' };
}

export async function analyseBarcode(
  data: string,
  barcodeType: string,
): Promise<TicketIntelligenceResult> {
  await wait(350);
  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(data) as Record<string, unknown>;
  } catch {
    // Real transport barcodes often contain compact or provider-specific data.
  }

  const mode = (payload.mode as TransportMode | undefined) ?? inferMode(data);
  const defaults = defaultsFor(mode);

  return {
    ticketId: String(payload.ticketId ?? `TKT-${Date.now()}`),
    source: 'barcode',
    mode,
    provider: String(payload.provider ?? defaults.provider),
    serviceNumber: String(payload.serviceNumber ?? defaults.serviceNumber),
    passengerName: payload.passengerName ? String(payload.passengerName) : undefined,
    seat: payload.seat ? String(payload.seat) : undefined,
    gate: payload.gate ? String(payload.gate) : undefined,
    confidence: Object.keys(payload).length ? 0.98 : 0.76,
    plannerInput: {
      mode,
      origin: String(payload.origin ?? defaults.origin),
      destination: String(payload.destination ?? defaults.destination),
      ticketReference: String(payload.ticketReference ?? `${barcodeType.toUpperCase()}-${data.slice(0, 12)}`),
    },
    rawValue: data,
    needsReview: !Object.keys(payload).length,
  };
}

export async function analyseTicketImage(imageUri: string): Promise<TicketIntelligenceResult> {
  const endpoint = process.env.EXPO_PUBLIC_TICKET_INTELLIGENCE_API_URL;

  if (endpoint) {
    const body = new FormData();
    body.append('ticket', { uri: imageUri, name: 'ticket.jpg', type: 'image/jpeg' } as unknown as Blob);
    const response = await fetch(`${endpoint}/v1/tickets/analyse`, { method: 'POST', body });
    if (!response.ok) throw new Error('Ticket intelligence service could not analyse this document.');
    return response.json() as Promise<TicketIntelligenceResult>;
  }

  await wait(1200);
  return {
    ticketId: `OCR-${Date.now()}`,
    source: 'ocr',
    mode: 'bus',
    provider: 'First Bus',
    serviceNumber: '24',
    passengerName: 'Demo passenger',
    confidence: 0.88,
    plannerInput: {
      mode: 'bus',
      origin: 'Leicester Station',
      destination: 'Leicester Royal Infirmary',
      ticketReference: 'OCR-DEMO-24',
    },
    needsReview: true,
  };
}
