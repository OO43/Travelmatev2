import { useTravelmateStore } from '@/state/TravelmateStore';
export function useJourneysViewModel() {
  const { journeys, savedPlaces, latestTicket, archiveJourney, addPlace, removePlace } = useTravelmateStore();
  return { upcoming: journeys.filter(item => !item.archived), history: journeys.filter(item => item.archived),
    savedPlaces, latestTicket, archiveJourney, addPlace, removePlace };
}

