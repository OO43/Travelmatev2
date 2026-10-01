import { useTravelmateStore } from '@/state/TravelmateStore';

export function useAlertsViewModel() {
  const { currentJourney, profile } = useTravelmateStore();
  return {
    currentJourney,
    vibrationGuidance: profile.assistancePreferences.vibrationGuidance,
    stopAnnouncements: profile.assistancePreferences.stopAnnouncements,
  };
}

