import { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Card, PrimaryButton, ScreenContainer } from '@/components/ui';
import { SelectField } from '@/components/SelectField';
import { COLORS, RADIUS } from '@/theme';
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
  locationChoices, chooseLocation }: {
  mode: TransportMode; origin: string; destination: string; departureDate: string; departureTime: string;
  useAccessibilityPreferences: boolean; isPlanning: boolean; isConfirming: boolean; error: string;
  result: Journey | null; routes: Journey[]; ticket: TicketIntelligenceResult | null;
  onOriginChange: (value: string) => void; onDestinationChange: (value: string) => void;
  onDateChange: (value: string) => void; onTimeChange: (value: string) => void; onPreferencesChange: (value: boolean) => void;
  onSelectRoute: (journey: Journey) => void; onFind: () => void; onContinue: () => void; onBack: () => void;
  onModeChange: (mode: TransportMode) => void;
  locationChoices: LocationChoices;
  chooseLocation: (field: 'origin' | 'destination', option: LocationOption) => void;
}) {
  const [dates] = useState(() => dateChoices(departureDate));
  const icon = mode === 'flight' ? 'airplane-outline' : mode === 'train' ? 'train-outline' : mode === 'car' ? 'car-outline' : 'bus-outline';
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
      <LocationField label="From" value={origin} onChange={onOriginChange} disabled={isConfirming} />
      <LocationField label="To" value={destination} onChange={onDestinationChange} disabled={isConfirming} />
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
      disabled={isConfirming} onPress={onFind} />
    {routes.length ? <>
      <Text style={styles.kicker}>{routes.length} ROUTES FOUND</Text>
      <View style={styles.resultsHeading}><Text style={styles.resultHeading}>{routes[0]?.source === 'tfl' ? 'TfL route options' : 'Recommended for you'}</Text><Text style={styles.note}>{routes[0]?.source === 'tfl' ? 'Transport for London' : 'Preview results'}</Text></View>
      <Text style={styles.note}>{routes[0]?.source === 'tfl' ? 'TfL journey data. Fares, where supplied, are estimates. Confirm accessibility with the operator; assistance and automatic tracking are not connected.' : 'Sample routes, times and fares for testing.'}</Text>
      {routes.map(route => <Pressable key={route.id} accessibilityRole="radio"
        accessibilityLabel={route.serviceNumber + ', ' + route.departureTime + ' to ' + route.arrivalTime + ', ' + route.price}
        accessibilityState={{ selected: result?.id === route.id, disabled: isConfirming }} disabled={isConfirming}
        onPress={() => onSelectRoute(route)} style={styles.routeWrap}>
        <Card style={[styles.routeCard, route.recommended ? styles.recommended : {}, result?.id === route.id ? styles.selected : {}]}>
          {route.recommended ? <View style={styles.best}><Ionicons name="sparkles-outline" size={16} color="#144F85" /><Text style={styles.bestText}>Best match</Text></View> : null}
          <View style={styles.times}><Text style={styles.time}>{route.departureTime}</Text><View style={styles.timeLine} /><Text style={styles.time}>{route.arrivalTime}</Text></View>
          {route.departureDate !== departureDate ? <Text style={styles.note}>Departs {route.departureDate?.split('-').reverse().join('/')}</Text> : null}
          {route.arrivalDate !== route.departureDate ? <Text style={styles.note}>Arrives the following day</Text> : null}
          <View style={styles.routeMain}>
            <View style={styles.mode}><Ionicons name={icon} size={20} color="#144F85" /><Text style={styles.service}>{route.serviceNumber}</Text></View>
            <View style={styles.routeCopy}><Text style={styles.duration}>{route.durationMinutes} min · {route.changes ? route.changes + ' change' : 'Direct'}</Text>
              <Text style={styles.routeText}>{route.origin} → {route.destination}</Text></View>
            <Text style={styles.price}>{route.price}</Text>
          </View>
          <View style={styles.tags}>{route.accessibilityFeatures.map(feature => <Text key={feature} style={styles.tag}>{feature}</Text>)}</View>
          {route.warnings?.map((warning, index) => <Text key={index} style={styles.note}>{warning}</Text>)}
          {result?.id === route.id ? <Text style={styles.selectedLabel}>Selected route</Text> : null}
        </Card>
      </Pressable>)}
      <PrimaryButton label={result ? 'Confirm journey' : 'Select a route above'} loading={isConfirming} disabled={!result} onPress={onContinue} />
    </> : null}
  </ScreenContainer>;
}

function LocationField({ label, value, onChange, disabled }: { label: string; value: string; onChange: (value: string) => void; disabled: boolean }) {
  const [focused, setFocused] = useState(false);
  return <View><Text style={styles.fieldLabel}>{label}</Text>
    <View style={[styles.inputRow, focused && styles.focused]}>
      <Ionicons name="location-outline" size={23} color="#536B83" />
      <TextInput accessibilityLabel={label} value={value} onChangeText={onChange} editable={!disabled}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder={label === 'From' ? 'Starting point' : 'Destination'}
        placeholderTextColor="#687E92" style={styles.input} />
    </View>
  </View>;
}
const styles = StyleSheet.create({
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
  error: { color: COLORS.error, fontSize: 14, fontWeight: '700' }, note: { color: '#536B83', fontSize: 13, lineHeight: 20 },
  resultsHeading: { gap: 8 }, resultHeading: { color: '#16314B', fontSize: 23, fontWeight: '800' },
  routeWrap: { marginTop: 12 }, routeCard: { borderColor: '#D5E3F0', borderRadius: 21, gap: 12, paddingTop: 26 },
  recommended: { borderColor: '#144F85', borderWidth: 2 }, selected: { borderColor: '#144F85', borderWidth: 3, backgroundColor: '#F8FCFF' },
  best: { position: 'absolute', top: -15, left: 18, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', gap: 5,
    alignItems: 'center', borderRadius: 20, backgroundColor: '#B7EFDC' },
  bestText: { color: '#144F85', fontSize: 12, fontWeight: '800' },
  times: { flexDirection: 'row', alignItems: 'center', gap: 10 }, time: { color: '#16314B', fontSize: 21, fontWeight: '800' },
  timeLine: { flex: 1, height: 1, backgroundColor: '#D5E3F0' },
  routeMain: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  mode: { backgroundColor: '#EBF5FF', borderRadius: 11, padding: 9, flexDirection: 'row', gap: 5, alignItems: 'center' },
  service: { color: '#144F85', fontSize: 15, fontWeight: '800' }, routeCopy: { flex: 1, minWidth: 120 },
  duration: { color: '#173653', fontSize: 16, fontWeight: '800' }, routeText: { color: '#536B83', fontSize: 14, lineHeight: 20, marginTop: 4 },
  price: { color: '#173653', fontSize: 19, fontWeight: '800' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, tag: { backgroundColor: '#E9F3FF', color: '#144F85', fontSize: 12,
    borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 6 },
  selectedLabel: { color: '#144F85', fontWeight: '800', fontSize: 13 },
});
