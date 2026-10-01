import { useState } from 'react';

import type { Journey, TransportMode } from '@/models/journey';
import { planJourney } from '@/services/journeyService';
import { useTravelmateStore } from '@/state/TravelmateStore';

export function useJourneyPlannerViewModel(mode: TransportMode) {
  const { latestTicket, setCurrentJourney } = useTravelmateStore();
  const ticketMatches = latestTicket?.mode === mode;
  const [origin, setOrigin] = useState(ticketMatches ? latestTicket.plannerInput.origin : 'Current location');
  const [destination, setDestination] = useState(ticketMatches ? latestTicket.plannerInput.destination : '');
  const [isPlanning, setIsPlanning] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Journey | null>(null);

  async function findJourney() {
    if (!origin.trim() || !destination.trim()) {
      setError('Enter both your starting point and destination.');
      return null;
    }

    try {
      setError('');
      setIsPlanning(true);
      const journey = await planJourney({
        mode,
        origin: origin.trim(),
        destination: destination.trim(),
        ticketReference: ticketMatches ? latestTicket.plannerInput.ticketReference : undefined,
      });
      setResult(journey);
      setCurrentJourney(journey);
      return journey;
    } catch {
      setError('We could not plan this journey. Please try again.');
      return null;
    } finally {
      setIsPlanning(false);
    }
  }

  return {
    mode,
    origin,
    destination,
    isPlanning,
    error,
    result,
    ticket: ticketMatches ? latestTicket : null,
    setOrigin,
    setDestination,
    findJourney,
  };
}
