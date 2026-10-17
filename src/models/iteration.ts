import type { Journey } from './journey';

export type SavedJourney = { journey: Journey; sessionId?: string; archived: boolean };
export type SavedPlace = { id: string; label: string; location: string };
export type PassengerAlert = {
  id: string;
  category: 'journey' | 'general';
  type: string;
  title: string;
  message: string;
  createdAt: string;
  unread: boolean;
  tone: 'amber' | 'blue' | 'mint' | 'lilac';
  action?: 'feedback';
  sample?: boolean;
};
export type AssistanceRequest = {
  id: string;
  kind: 'boarding' | 'wheelchair' | 'urgent';
  journeyId: string;
  createdAt: string;
  status: 'saved_locally';
};
