import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import type { Journey } from '@/models/journey';
import type { AuthSession } from '@/models/auth';
import type { PassengerProfile } from '@/models/passenger';
import type { TicketIntelligenceResult } from '@/models/ticket';

const STORAGE_KEY = 'travelmate.mvp.state.v1';

const defaultProfile: PassengerProfile = {
  passengerId: 'passenger-001',
  preferredName: 'Oore',
  preferredLanguage: 'English (UK)',
  homeLocation: 'Leicester',
  communicationMethod: 'combined',
  accessibilityNeeds: {
    visualImpairment: false,
    hearingImpairment: false,
    reducedMobility: true,
    wheelchairUser: false,
    cognitiveSupportRequired: false,
    assistanceAnimalSupport: false,
    temporaryAccessibilityNeed: false,
  },
  assistancePreferences: {
    audioGuidance: true,
    vibrationGuidance: true,
    boardingAssistance: true,
    alightingAssistance: false,
    extraBoardingTime: true,
    stopAnnouncements: true,
  },
};

type StoreValue = {
  hydrated: boolean;
  session: AuthSession | null;
  profile: PassengerProfile;
  currentJourney: Journey | null;
  latestTicket: TicketIntelligenceResult | null;
  setCurrentJourney: (journey: Journey | null) => void;
  setSession: (session: AuthSession | null) => void;
  setLatestTicket: (ticket: TicketIntelligenceResult | null) => void;
  setProfile: (profile: PassengerProfile) => void;
};

const TravelmateStore = createContext<StoreValue | null>(null);

export function TravelmateStoreProvider({ children }: PropsWithChildren) {
  const [hydrated, setHydrated] = useState(false);
  const [profile, setProfile] = useState(defaultProfile);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [currentJourney, setCurrentJourney] = useState<Journey | null>(null);
  const [latestTicket, setLatestTicket] = useState<TicketIntelligenceResult | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (!value) return;
        const saved = JSON.parse(value) as Partial<Pick<StoreValue, 'session' | 'profile' | 'currentJourney' | 'latestTicket'>>;
        if (saved.session) setSession(saved.session);
        if (saved.profile) setProfile(saved.profile);
        if (saved.currentJourney) setCurrentJourney(saved.currentJourney);
        if (saved.latestTicket) setLatestTicket(saved.latestTicket);
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ session, profile, currentJourney, latestTicket })).catch(() => undefined);
  }, [currentJourney, hydrated, latestTicket, profile, session]);

  const value = useMemo(() => ({
    hydrated,
    session,
    profile,
    currentJourney,
    latestTicket,
    setCurrentJourney,
    setSession,
    setLatestTicket,
    setProfile,
  }), [currentJourney, hydrated, latestTicket, profile, session]);

  if (!hydrated) return null;
  return <TravelmateStore.Provider value={value}>{children}</TravelmateStore.Provider>;
}

export function useTravelmateStore() {
  const value = useContext(TravelmateStore);
  if (!value) throw new Error('useTravelmateStore must be used inside TravelmateStoreProvider.');
  return value;
}
