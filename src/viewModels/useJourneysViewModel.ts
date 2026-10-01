import { useTravelmateStore } from '@/state/TravelmateStore';

export function useJourneysViewModel() {
  const { currentJourney, latestTicket } = useTravelmateStore();
  return { currentJourney, latestTicket };
}

