import { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { PrimaryButton, ScreenContainer } from '@/components/ui';
import { JourneyRouteCard } from '@/components/JourneyRouteCard';
import { JourneyMap } from '@/components/JourneyMap';
import { SelectField } from '@/components/SelectField';
import { PlaceAutocompleteField } from '@/components/PlaceAutocompleteField';
import type { ResolvedPlace } from '@/services/placeService';
import { COLORS } from '@/theme';
import type { Journey, LocationOption, TransportMode } from '@/models/journey';
import type { LocationChoices } from '@/services/journeyService';
import type { TicketIntelligenceResult } from '@/models/ticket';

function dateChoices(start: string) {
  const date = new Date(start + 'T12:00:00');
  return Array.from({ length: 90 }, (_, index) => {
    const day = new Date(date); day.setDate(day.getDate() + index);
    const value = day.getFullYear() + '-' + String(day.getMonth() + 1).padStart(2, '0') + '-' + String(day.getDate()).padStart(2, '0');
    return { value, label: String(day.getDate()).padStart(2, '0') + '/' + String(day.getMonth() + 1).padStart(2, '0') + '/' + day.getFullYear() };
  });
}
const timeChoices = Array.from({ length: 96 }, (_, index) => {
  const value = String(Math.floor(index / 4)).padStart(2, '0') + ':' + String((index % 4) * 15).padStart(2, '0');
  return { value, label: value };
});

export function JourneyPlannerView({ mode, origin, destination, departureDate, departureTime, useAccessibilityPreferences,
  isPlanning, isConfirming, error, result, routes, ticket, onOriginChange, onDestinationChange,
  onDateChange, onTimeChange, onPreferencesChange, onSelectRoute, onModeChange, onFind, onContinue, onBack,
  locationChoices, chooseLocation, choosePlace,
  isLocating, locationMessage, canOpenLocationSettings, locateOrigin, stopLocating, openLocationSettings }: {
  mode: TransportMode; origin: string; destination: string; departureDate: string; departureTime: string;
  useAccessibilityPreferences: boolean; isPlanning: boolean; isConfirming: boolean; error: string;
  result: Journey | null; routes: Journey[]; ticket: TicketIntelligenceResult | null;
  onOriginChange: (value: string) => void; onDestinationChange: (value: string) => void;
  onDateChange: (value: string) => void; onTimeChange: (value: string) => void; onPreferencesChange: (value: boolean) => void;
  onSelectRoute: (journey: Journey) => void; onFind: () => void; onContinue: () => void; onBack: () => void;
  onModeChange: (mode: TransportMode) => void;
  locationChoices: LocationChoices;
  chooseLocation: (field: 'origin' | 'destination', option: LocationOption) => void;
  choosePlace: (field: 'origin' | 'destination', place: ResolvedPlace, userQuery: string, displayLabel: string) => void;
  isLocating: boolean; locationMessage: string; canOpenLocationSettings: boolean;
  locateOrigin: () => Promise<void>; stopLocating: () => void; openLocationSettings: () => Promise<void>;
}) {
  const [dates] = useState(() => dateChoices(departureDate));
  return <ScreenContainer backgroundColor={COLORS.cream}>
    <View style={styles.headingRow}>
      <View style={styles.flex}><Text style={styles.kicker}>NEW JOURNEY</Text>
        <Text accessibilityRole="header" style={styles.heading}>Where are you going?</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Close journey planner" onPress={onBack} style={styles.close}>
        <Ionicons name="close" size={25} color="#173653" />
      </Pressable>
    </View>
    {ticket ? <Text style={styles.note}>Pre-filled from your ticket. Review before confirming.</Text> : null}
    <SelectField label="Transport" value={mode} disabled={isConfirming} bottomSheet
      options={[{ label: 'Bus', value: 'bus' }, { label: 'Train', value: 'train' }, { label: 'Flight', value: 'flight' }]}
      onChange={value => onModeChange(value as TransportMode)} />
    <Text style={styles.note}>{process.env.EXPO_PUBLIC_JOURNEY_PROVIDER === 'demo'
      ? 'Demo planner: sample routes for testing.'
      : 'London routes powered by TfL. Enter a station, bus stop or postcode. Times are London local time.'}</Text>
    <View style={styles.locations}>
      <PlaceAutocompleteField label="From" value={origin} onChange={onOriginChange} disabled={isConfirming}
        onSelect={(place, query, name) => choosePlace('origin', place, query, name)} />
      <View style={styles.deviceLocation}>
        <PrimaryButton label={isLocating ? 'Finding your location…' : 'Use current location'} icon="locate"
          style={styles.currentLocationButton} textStyle={styles.currentLocationButtonText} foregroundColor={COLORS.forest}
          loading={isLocating} disabled={isConfirming || isPlanning} onPress={() => { void locateOrigin(); }} />
        {isLocating ? <Pressable accessibilityRole="button" onPress={stopLocating} style={styles.locationAction}>
          <Text style={styles.locationActionText}>Stop locating — enter a starting point manually</Text>
        </Pressable> : null}
        {locationMessage ? <Text accessibilityLiveRegion="polite" style={styles.locationNote}>{locationMessage}</Text> : null}
        {canOpenLocationSettings ? <Pressable accessibilityRole="button" onPress={() => { void openLocationSettings(); }} style={styles.locationAction}>
          <Text style={styles.locationActionText}>Open location settings</Text>
        </Pressable> : null}
      </View>
      <PlaceAutocompleteField label="To" value={destination} onChange={onDestinationChange} disabled={isConfirming}
        onSelect={(place, query, name) => choosePlace('destination', place, query, name)} />
    </View>
    {(['origin', 'destination'] as const).map(field => locationChoices[field].length ? <View key={field} style={styles.locations}>
      <Text style={styles.fieldLabel}>Choose your {field === 'origin' ? 'starting point' : 'destination'}</Text>
      {locationChoices[field].map(option => <Pressable key={option.id} accessibilityRole="button" disabled={isConfirming}
        onPress={() => chooseLocation(field, option)} style={styles.inputRow}>
        <Text style={styles.routeText}>{option.name}</Text>
      </Pressable>)}
    </View> : null)}
    <SelectField label="Date" icon="calendar-outline" value={departureDate} options={dates} onChange={onDateChange} disabled={isConfirming} />
    <SelectField label="Leave at" icon="time-outline" value={departureTime} options={timeChoices} onChange={onTimeChange} disabled={isConfirming} />
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: useAccessibilityPreferences, disabled: isConfirming }}
      disabled={isConfirming} onPress={() => onPreferencesChange(!useAccessibilityPreferences)} style={styles.preferences}>
      <Ionicons name={useAccessibilityPreferences ? 'checkbox' : 'square-outline'} size={25} color="#144F85" />
      <View style={styles.flex}><Text style={styles.preferenceTitle}>Use my accessibility preferences</Text>
        <Text style={styles.preferenceBody}>Use your saved step-free and walking pace preferences. Assistance is not booked by a route search.</Text></View>
    </Pressable>
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    <PrimaryButton label={routes.length ? 'Refresh routes' : 'Find routes'} icon="search" loading={isPlanning}
      disabled={isConfirming || isLocating} onPress={onFind} />
    {routes.length ? <>
      <Text style={styles.kicker}>{routes.length} ROUTES FOUND</Text>
      <View style={styles.resultsHeading}><Text style={styles.resultHeading}>{routes[0]?.source === 'tfl' ? 'TfL route options' : 'Recommended for you'}</Text><Text style={styles.note}>{routes[0]?.source === 'tfl' ? 'Transport for London' : 'Preview results'}</Text></View>
      <Text style={styles.note}>{routes[0]?.source === 'tfl' ? 'TfL journey data. Fares, where supplied, are estimates. Confirm accessibility with the operator; assistance and automatic tracking are not connected.' : 'Sample routes, times and fares for testing.'}</Text>
      {routes.map(route => <JourneyRouteCard key={route.id} journey={route}
        selected={result?.id === route.id} disabled={isConfirming} searchDate={departureDate}
        onSelect={() => onSelectRoute(route)} />)}
      {result ? <JourneyMap key={result.id} journey={result} /> : null}
      <PrimaryButton label={result ? 'Confirm journey' : 'Select a route above'} loading={isConfirming} disabled={!result} onPress={onContinue} />
    </> : null}
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  deviceLocation: { backgroundColor: COLORS.forest, padding: 0, borderRadius: 14, gap: 8 },
  currentLocationButton: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.forest, borderRadius: 12, },
  currentLocationButtonText: { fontSize: 15, fontWeight: '900', flexShrink: 1, textAlign: 'center' },
  locationAction: { minHeight: 44, justifyContent: 'center', paddingVertical: 8,},
  locationActionText: { color: COLORS.forest, fontSize: 14, fontWeight: '700', lineHeight: 21 },
  flex: { flex: 1 }, headingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, },
  kicker: { color: '#657C79', fontSize: 12, fontWeight: '800', letterSpacing: 1.6 },
  heading: { color: '#16314B', fontSize: 30, lineHeight: 37, fontWeight: '900', marginTop: 12 },
  close: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.cream, alignItems: 'center', justifyContent: 'center' },
  locations: { backgroundColor: COLORS.forest, borderRadius: 23, padding: 16, gap: 8 },
  fieldLabel: { color: '#fefeff', fontWeight: '800', fontSize: 14, marginBottom: 7 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 55, borderWidth: 1,
    borderColor: '#D5E3F0', backgroundColor: COLORS.white, borderRadius: 14, paddingHorizontal: 14 },
  focused: { borderColor: '#2485CE', borderWidth: 2 },
  input: { flex: 1, color: '#173653', fontSize: 16, fontWeight: '700', paddingVertical: 14, minWidth: 0 },
  preferences: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: '#D5E3F0', borderRadius: 17, padding: 17 },
  preferenceTitle: { color: '#173653', fontSize: 17, fontWeight: '800', lineHeight: 24 },
  preferenceBody: { color: '#536B83', fontSize: 15, lineHeight: 23, marginTop: 4 },
  error: { color: COLORS.error, fontSize: 14, fontWeight: '700' }, note: { color: '#536B83', fontSize: 13, lineHeight: 18, backgroundColor: 'transparent', paddingLeft:1},
  resultsHeading: { gap: 8 }, resultHeading: { color: '#16314B', fontSize: 23, fontWeight: '800' },
  routeText: { color: '#536B83', fontSize: 14, lineHeight: 20, marginTop: 4 },
  locationNote: { color: '#fefeff', fontSize: 12, lineHeight: 20, marginTop: 4, paddingLeft: 12,},
});
