import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';
import type { Journey } from '@/models/journey';
import type { AuthSession } from '@/models/auth';
import type { PassengerProfile } from '@/models/passenger';
import type { TicketIntelligenceResult } from '@/models/ticket';
import type { AssistanceRequest, PassengerAlert, SavedJourney, SavedPlace } from '@/models/iteration';

const STORAGE_KEY = 'travelmate.mvp.state.v1';
const id = () => Date.now() + '-' + Math.random().toString(36).slice(2);
const defaultProfile: PassengerProfile = {
  passengerId: 'passenger-001', firstName: '', lastName: '', preferredName: 'Oore',
  phoneNumber: '+44 1234 567890', emailAddress: 'oore@example.com', emergencyContact: '',
  preferredLanguage: 'English (UK)', homeLocation: 'Leicester', communicationMethod: 'combined',
  sharingPreference: 'needed', personalisedSuggestions: true, enhancedSupervision: false,
  accessibilityNeeds: { visualImpairment: false, hearingImpairment: false, reducedMobility: true,
    wheelchairUser: false, cognitiveSupportRequired: false, assistanceAnimalSupport: false, temporaryAccessibilityNeed: false },
  assistancePreferences: { audioGuidance: true, vibrationGuidance: true, boardingAssistance: true,
    alightingAssistance: false, extraBoardingTime: true, stopAnnouncements: true,
    largeText: false, highContrast: false, stepFreeRoutes: true, extraTransferTime: false, prioritySeating: false },
};
type StoredState = {
  session: AuthSession | null; profile: PassengerProfile; currentJourney: Journey | null;
  latestTicket: TicketIntelligenceResult | null; journeys: SavedJourney[]; savedPlaces: SavedPlace[];
  alerts: PassengerAlert[]; assistanceRequests: AssistanceRequest[];
  dismissedTicketBannerId: string | null;
};
type NewAlert = Omit<PassengerAlert, 'id' | 'createdAt' | 'unread'>;
type StoreValue = StoredState & {
  hydrated: boolean;
  setCurrentJourney: (journey: Journey | null) => void;
  setSession: (session: AuthSession | null) => void;
  setLatestTicket: (ticket: TicketIntelligenceResult | null) => void;
  dismissTicketBanner: (ticketId: string) => void;
  setProfile: (profile: PassengerProfile) => void;
  rememberSession: (journeyId: string, sessionId: string) => void;
  archiveJourney: (journeyId: string) => void;
  addPlace: (label: string, location: string) => void;
  removePlace: (placeId: string) => void;
  markAllRead: () => void;
  markRead: (alertId: string) => void;
  dismissAlert: (alertId: string) => void;
  addAlert: (alert: NewAlert) => void;
  loadSampleAlerts: () => void;
  requestAssistance: (kind: AssistanceRequest['kind']) => boolean;
};
const initial: StoredState = { session: null, profile: defaultProfile, currentJourney: null,
  latestTicket: null, dismissedTicketBannerId: null, journeys: [], savedPlaces: [], alerts: [], assistanceRequests: [] };
const TravelmateStore = createContext<StoreValue | null>(null);
const notification = (alert: NewAlert): PassengerAlert => ({
  ...alert, id: id(), createdAt: new Date().toISOString(), unread: true,
});

export function TravelmateStoreProvider({ children }: PropsWithChildren) {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<StoredState>(initial);
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY).then(value => {
      if (!value || cancelled) return;
      const saved = JSON.parse(value) as Partial<StoredState>;
      const profile = { ...defaultProfile, ...saved.profile,
        accessibilityNeeds: { ...defaultProfile.accessibilityNeeds, ...saved.profile?.accessibilityNeeds },
        assistancePreferences: { ...defaultProfile.assistancePreferences, ...saved.profile?.assistancePreferences } };
      setState({ ...initial, ...saved, profile,
        journeys: saved.journeys ?? (saved.currentJourney ? [{ journey: saved.currentJourney, archived: false }] : []) });
    }).catch(() => { /* Unavailable or corrupt cache falls back to defaults. */ })
      .finally(() => { if (!cancelled) setHydrated(true); });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (hydrated) void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [hydrated, state]);

  const value: StoreValue = {
    ...state, hydrated,
    setSession: session => setState(current => ({ ...current, session })),
    setLatestTicket: latestTicket => setState(current => ({ ...current, latestTicket, dismissedTicketBannerId: null })),
    dismissTicketBanner: ticketId => setState(current => current.latestTicket?.ticketId === ticketId
      ? { ...current, dismissedTicketBannerId: ticketId } : current),
    setProfile: profile => setState(current => ({ ...current, profile,
      alerts: [notification({ category: 'general', type: 'Preferences', title: 'Your profile and support preferences were updated',
        message: 'Changes saved on this device. Backend profile sync is not connected yet.', tone: 'mint' }), ...current.alerts].slice(0, 100) })),
    setCurrentJourney: journey => setState(current => ({ ...current, currentJourney: journey,
      journeys: journey ? [{ journey, archived: false,
        sessionId: current.journeys.find(item => item.journey.id === journey.id)?.sessionId },
        ...current.journeys.filter(item => item.journey.id !== journey.id)] : current.journeys })),
    rememberSession: (journeyId, sessionId) => setState(current => ({ ...current,
      journeys: current.journeys.map(item => item.journey.id === journeyId ? { ...item, sessionId } : item) })),
    archiveJourney: journeyId => setState(current => ({ ...current,
      currentJourney: current.currentJourney?.id === journeyId ? null : current.currentJourney,
      journeys: current.journeys.map(item => item.journey.id === journeyId ? { ...item, archived: true } : item),
      alerts: [notification({ category: 'journey', type: 'Journey feedback', title: 'How was your journey?',
        message: 'Your plan was moved to local history. Share feedback about your experience.', tone: 'lilac',
        action: 'feedback' }), ...current.alerts],
    })),
    addPlace: (label, location) => setState(current => ({ ...current,
      savedPlaces: [...current.savedPlaces, { id: id(), label: label.trim(), location: location.trim() }] })),
    removePlace: placeId => setState(current => ({ ...current, savedPlaces: current.savedPlaces.filter(place => place.id !== placeId) })),
    addAlert: alert => setState(current => ({ ...current, alerts: [notification(alert), ...current.alerts] })),
    markAllRead: () => setState(current => ({ ...current, alerts: current.alerts.map(alert => ({ ...alert, unread: false })) })),
    markRead: alertId => setState(current => ({ ...current, alerts: current.alerts.map(alert => alert.id === alertId ? { ...alert, unread: false } : alert) })),
    dismissAlert: alertId => setState(current => ({ ...current, alerts: current.alerts.filter(alert => alert.id !== alertId) })),
    loadSampleAlerts: () => setState(current => ({ ...current, alerts: [...sampleAlerts(), ...current.alerts.filter(alert => !alert.sample)] })),
    requestAssistance: kind => {
      if (!state.currentJourney || state.profile.sharingPreference === 'never') return false;
      const request: AssistanceRequest = { id: id(), kind, journeyId: state.currentJourney.id,
        status: 'saved_locally', createdAt: new Date().toISOString() };
      setState(current => ({ ...current, assistanceRequests: [request, ...current.assistanceRequests],
        alerts: [notification({ category: 'journey', type: 'Assistance draft', title: 'Assistance request saved locally',
          message: kind + ' selected. This test request has not been sent to staff.', tone: 'blue' }), ...current.alerts] }));
      return true;
    },
  };
  if (!hydrated) return null;
  return <TravelmateStore.Provider value={value}>{children}</TravelmateStore.Provider>;
}

function sampleAlerts(): PassengerAlert[] {
  const now = Date.now();
  const samples: NewAlert[] = [
    { category: 'journey', type: 'Service update', title: 'Bus 24 is running 4 minutes late', message: 'Sample only: no live delay feed is connected.', tone: 'amber' },
    { category: 'journey', type: 'Assistance confirmed', title: 'Boarding support is ready', message: 'Sample only: this does not confirm a real staff acknowledgement.', tone: 'blue' },
    { category: 'general', type: 'Preferences', title: 'Your accessibility preferences were updated', message: 'Sample preference update for testing the layout.', tone: 'mint' },
    { category: 'general', type: 'TravelMate', title: 'How was your journey?', message: 'Your feedback helps improve future assistance.', tone: 'lilac', action: 'feedback' },
  ];
  return samples.map((alert, index) => ({ ...alert, id: 'sample-' + index, sample: true,
    createdAt: new Date(now - (index + 1) * 720000).toISOString(), unread: index < 2 }));
}
export function useTravelmateStore() {
  const value = useContext(TravelmateStore);
  if (!value) throw new Error('useTravelmateStore must be used inside TravelmateStoreProvider.');
  return value;
}
