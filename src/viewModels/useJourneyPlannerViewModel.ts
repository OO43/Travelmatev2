import { useRef, useState } from 'react';
import type { Journey, LocationOption, TransportMode } from '@/models/journey';
import { JourneyPlanningError, planJourneyOptions } from '@/services/journeyService';
import type { LocationChoices } from '@/services/journeyService';
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
  const [locationChoices, setLocationChoices] = useState<LocationChoices>({ origin: [], destination: [] });
  const selectedOrigin = useRef<LocationOption | null>(null);
  const selectedDestination = useRef<LocationOption | null>(null);
  const requestVersion = useRef(0);
  const confirming = useRef(false);
  const planning = useRef(false);

  function invalidate() { requestVersion.current += 1; setRoutes([]); setResult(null); setError(''); setLocationChoices({ origin: [], destination: [] }); }
  function setMode(value: TransportMode) {
    if (confirming.current || value === mode) return;
    setModeValue(value);
    invalidate();
  }
  function setOrigin(value: string) { selectedOrigin.current = null; setOriginValue(value); invalidate(); }
  function setDestination(value: string) { selectedDestination.current = null; setDestinationValue(value); invalidate(); }
  function chooseLocation(field: 'origin' | 'destination', option: LocationOption) {
    requestVersion.current += 1; setRoutes([]); setResult(null); setError('');
    if (field === 'origin') { selectedOrigin.current = option; setOriginValue(option.name); }
    else { selectedDestination.current = option; setDestinationValue(option.name); }
    setLocationChoices(current => ({ ...current, [field]: [] }));
  }
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
        mode, origin: selectedOrigin.current?.id ?? origin.trim(), destination: selectedDestination.current?.id ?? destination.trim(), departureDate, departureTime,
        originName: selectedOrigin.current?.name, destinationName: selectedDestination.current?.name,
        useAccessibilityPreferences, extraTransferTime: Boolean(profile.assistancePreferences.extraTransferTime),
        stepFree: Boolean(profile.assistancePreferences.stepFreeRoutes || profile.accessibilityNeeds.wheelchairUser),
        ticketReference: ticketMatches ? latestTicket.plannerInput.ticketReference : undefined,
      });
      if (requestVersion.current === version) {
        setRoutes(options); setLocationChoices({ origin: [], destination: [] });
        if (!options.length) setError('No routes found. Try another London location, time or date.');
      }
      return options;
    } catch (error) {
      if (requestVersion.current === version) {
        setError(error instanceof Error ? error.message : 'We could not plan this journey. Please try again.');
        if (error instanceof JourneyPlanningError && error.choices) setLocationChoices(error.choices);
      }
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
        // A TfL line is not a vehicle. Keep planning sessions separate until a real vehicle is assigned.
        vehicle_id: result.source === 'tfl'
          ? `planned-${result.id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
          : result.mode + '-' + result.serviceNumber.toLowerCase(),
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
    isPlanning, isConfirming, error, result, routes, locationChoices, chooseLocation,
    ticket: ticketMatches ? latestTicket : null,
    setMode, setOrigin, setDestination, setDepartureDate, setDepartureTime, setUseAccessibilityPreferences,
    selectJourney, confirmJourney, findJourney };
}
