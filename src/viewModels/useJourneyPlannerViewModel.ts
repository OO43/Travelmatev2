import { useState } from 'react';

import type { Journey, TransportMode } from '@/models/journey';
import { planJourney } from '@/services/journeyService';
import { useTravelmateStore } from '@/state/TravelmateStore';
import { createJourneySession, supportOptionsFromProfile, } from '@/services/journeySessionService';

export function useJourneyPlannerViewModel(mode: TransportMode) {
  const { latestTicket, setCurrentJourney, profile } = useTravelmateStore();
  const ticketMatches = latestTicket?.mode === mode;
  const [origin, setOrigin] = useState(ticketMatches ? latestTicket.plannerInput.origin : 'Current location');
  const [destination, setDestination] = useState(ticketMatches ? latestTicket.plannerInput.destination : '');
  const [isPlanning, setIsPlanning] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
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

  async function confirmJourney() {
  if (!result) {
    setError('Select a journey before continuing.');
    return null;
  }

  try {
    setError('');
    setIsConfirming(true);

    const journeySession = await createJourneySession({
      passenger_id: profile.passengerId,
      journey_id: result.id,

      // For the demo bus journey this produces "bus-24".
      vehicle_id: `${result.mode}-${result.serviceNumber.toLowerCase()}`,

      declared_ui_options: supportOptionsFromProfile(profile),

      // This must eventually come from an explicit passenger consent control.
      consent_to_support_sharing: true,

      consent_enhanced_supervision: false,
      stop_request: false,
    });

    return journeySession;
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : 'TravelMate could not start this journey.',
    );

    return null;
  } finally {
    setIsConfirming(false);
  }
}

  return {
    mode,
    origin,
    destination,
    isPlanning,
    isConfirming,
    error,
    result,
    ticket: ticketMatches ? latestTicket : null,
    setOrigin,
    setDestination,
    confirmJourney,
    findJourney,
  };
}
