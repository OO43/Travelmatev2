export type LiveUpdatesRequest = { legs: { leg_index: number; line_id: string; stop_id: string | null }[] };
export type ArrivalPrediction = {
  id: string; destination: string; platform: string | null;
  expected_arrival: string; generated_at: string | null; is_stale: boolean;
  valid_until?: string | null;
};
export type LiveLeg = {
  leg_index: number; line_id: string; stop_id: string | null;
  state: 'ok' | 'unavailable' | 'unsupported'; fetched_at: string | null;
  message: string | null; predictions: ArrivalPrediction[];
};
export type LiveLine = {
  line_id: string; name: string; state: 'ok' | 'unavailable'; fetched_at: string | null;
  message: string | null; statuses: { description: string; reason: string | null }[];
};
export type LiveUpdates = { source: 'tfl'; received_at: string; legs: LiveLeg[]; lines: LiveLine[] };
