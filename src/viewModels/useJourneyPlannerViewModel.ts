import { useRef, useState } from 'react';
import type { Journey, TransportMode } from '@/models/journey';
import { planJourneyOptions } from '@/services/journeyService';
import { useTravelmateStore } from '@/state/TravelmateStore';
import { createJourneySession, supportOptionsFromProfile } from '@/services/journeySessionService';

function localDate() {
  const now = new Date();
  return String(now.getFullYear()) + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
}
export function useJourneyPlannerViewModel(initialMode: TransportMode, initialDestination = '') {
  const [mode, setModeValue] = useState<TransportMode>(initialMode);
  const { latestTicket, setCurrentJourney, profile, rememberSession, dismissTicketBanner } = useTravelmateStore();
  const ticketMatches = latestTicket?.mode === mode;
  const [origin, setOriginValue] = useState(ticketMatches ? latestTicket.plannerInput.origin : 'Current location');
  const [destination, setDestinationValue] = useState(initialDestination || (ticketMatches ? latestTicket.plannerInput.destination : ''));
  const [departureDate, setDateValue] = useState(localDate);
  const [departureTime, setTimeValue] = useState('14:30');
  const [useAccessibilityPreferences, setPreferencesValue] = useState(true);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState('');
  const [routes, setRoutes] = useState<Journey[]>([]);
  const [result, setResult] = useState<Journey | null>(null);
  const requestVersion = useRef(0);
  const confirming = useRef(false);
  const planning = useRef(false);

  function invalidate() { requestVersion.current += 1; setRoutes([]); setResult(null); setError(''); }
  function setMode(value: TransportMode) {
    if (confirming.current || value === mode) return;
    setModeValue(value);
    invalidate();
  }
  function setOrigin(value: string) { setOriginValue(value); invalidate(); }
  function setDestination(value: string) { setDestinationValue(value); invalidate(); }
  function setDepartureDate(value: string) { setDateValue(value); invalidate(); }
  function setDepartureTime(value: string) { setTimeValue(value); invalidate(); }
  function setUseAccessibilityPreferences(value: boolean) { setPreferencesValue(value); invalidate(); }
  function selectJourney(journey: Journey) { setResult(journey); setError(''); }

  async function findJourney() {
    if (planning.current || confirming.current) return null;
    if (!origin.trim() || !destination.trim()) { setError('Enter both your starting point and destination.'); return null; }
    const version = ++requestVersion.current;
    planning.current = true;
    try {
      setError(''); setIsPlanning(true); setResult(null); setRoutes([]);
      const options = await planJourneyOptions({
        mode, origin: origin.trim(), destination: destination.trim(), departureDate, departureTime,
        useAccessibilityPreferences, extraTransferTime: Boolean(profile.assistancePreferences.extraTransferTime),
        ticketReference: ticketMatches ? latestTicket.plannerInput.ticketReference : undefined,
      });
      if (requestVersion.current === version) setRoutes(options);
      return options;
    } catch {
      if (requestVersion.current === version) setError('We could not plan this journey. Please try again.');
      return null;
    } finally { planning.current = false; setIsPlanning(false); }
  }

  async function confirmJourney() {
    if (confirming.current) return null;
    if (!result) { setError('Select a route before confirming.'); return null; }
    confirming.current = true;
    try {
      setError(''); setIsConfirming(true);
      const sharing = profile.sharingPreference !== 'never' && Boolean(result.useAccessibilityPreferences);
      const journeySession = await createJourneySession({
        passenger_id: profile.passengerId, journey_id: result.id,
        vehicle_id: result.mode + '-' + result.serviceNumber.toLowerCase(),
        declared_ui_options: sharing ? supportOptionsFromProfile(profile) : [],
        consent_to_support_sharing: sharing,
        consent_enhanced_supervision: sharing && Boolean(profile.enhancedSupervision), stop_request: false,
      });
      setCurrentJourney(result);
      rememberSession(result.id, journeySession.session_id);
      if (ticketMatches && result.ticketReference && result.ticketReference === latestTicket.plannerInput.ticketReference) {
        dismissTicketBanner(latestTicket.ticketId);
      }
      return journeySession;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'TravelMate could not start this journey.');
      return null;
    } finally { confirming.current = false; setIsConfirming(false); }
  }
  return { mode, origin, destination, departureDate, departureTime, useAccessibilityPreferences,
    isPlanning, isConfirming, error, result, routes, ticket: ticketMatches ? latestTicket : null,
    setMode, setOrigin, setDestination, setDepartureDate, setDepartureTime, setUseAccessibilityPreferences,
    selectJourney, confirmJourney, findJourney };
}
