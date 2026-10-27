import { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Card } from '@/components/Card';
import { JourneyDisruptions, JourneyRouteDetails, JourneyRouteSummary } from '@/components/JourneyRouteDetails';
import type { Journey } from '@/models/journey';
import { journeySummary, journeyWarnings } from '@/services/journeyDisplay';
import { COLORS } from '@/theme';

export function JourneyRouteCard({ journey, selected, disabled, searchDate, onSelect }: {
  journey: Journey; selected: boolean; disabled: boolean; searchDate: string; onSelect: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const detailed = journey.source === 'tfl' && Boolean(journey.legs?.length);
  const icon = journey.mode === 'flight' ? 'airplane-outline' : journey.mode === 'train' ? 'train-outline' : journey.mode === 'car' ? 'car-outline' : 'bus-outline';
  const notices = journeyWarnings(journey);
  const summary = journeySummary(journey);
  return <Card style={[styles.card, selected ? styles.selected : {}]}>
    <Pressable accessibilityRole="radio" accessibilityLabel={`${journey.serviceNumber}, ${journey.departureTime} to ${journey.arrivalTime}, ${journey.durationMinutes} minutes total, ${summary.walkingMinutes} minutes walking, ${summary.changesLabel}, ${journey.price ?? 'Fare unavailable'}, ${notices.length} journey notices`}
      accessibilityState={{ checked: selected, selected, disabled }} disabled={disabled} onPress={onSelect} style={styles.selectArea}>
      {journey.recommended ? <Text style={styles.preference}>Recommended preview</Text> : null}
      <View style={styles.times}><Text style={styles.time}>{journey.departureTime}</Text><Text style={styles.to}>→</Text><Text style={styles.time}>{journey.arrivalTime}</Text></View>
      <Text style={styles.duration}>{journey.durationMinutes} min total · {detailed ? 'includes walking and connections' : `${journey.changes ?? 0} changes`}</Text>
      {journey.departureDate && journey.departureDate !== searchDate ? <Text style={styles.body}>Departs {journey.departureDate}</Text> : null}
      {journey.arrivalDate && journey.arrivalDate !== journey.departureDate ? <Text style={styles.body}>Arrives {journey.arrivalDate}</Text> : null}
      <View style={styles.serviceRow}><Ionicons name={icon} size={22} color={COLORS.forest} /><Text style={styles.service}>{journey.serviceNumber}</Text></View>
      <Text style={styles.body}>{journey.origin} → {journey.destination}</Text>
      <Text style={styles.price}>{journey.price ?? 'Fare unavailable'}{detailed && journey.price !== 'Fare unavailable' ? ' · TfL estimate' : ''}</Text>
      {detailed ? <JourneyRouteSummary journey={journey} /> : null}
      {journey.accessibilityFeatures.map((feature, index) => <Text key={index} style={styles.preference}>{feature}</Text>)}
      {notices.length ? <Text style={styles.notice}>{notices.length} journey {notices.length === 1 ? 'notice' : 'notices'} · open steps to review</Text> : null}
      <Text style={styles.selection}>{selected ? 'Selected route' : 'Tap to select this route'}</Text>
    </Pressable>
    {detailed ? <>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded, disabled }} disabled={disabled} onPress={() => setExpanded(value => !value)} style={styles.stepsButton}>
        <Text style={styles.stepsLabel}>{expanded ? 'Hide journey steps' : 'View journey steps'}</Text><Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.forest} />
      </Pressable>
      {expanded ? <View style={styles.steps}><JourneyDisruptions journey={journey} /><JourneyRouteDetails journey={journey} /></View> : null}
    </> : null}
  </Card>;
}
const styles = StyleSheet.create({
  card: { marginTop: 12, padding: 0, overflow: 'hidden', borderRadius: 21, borderColor: '#D5E3F0' },
  selected: { borderColor: COLORS.forest, borderWidth: 3, backgroundColor: '#F8FCFF' }, selectArea: { padding: 18, gap: 10 },
  times: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 }, time: { color: COLORS.ink, fontSize: 22, fontWeight: '800' }, to: { color: COLORS.inkSoft, fontSize: 18 },
  duration: { color: COLORS.ink, fontSize: 15, fontWeight: '800', lineHeight: 23 }, serviceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  service: { color: COLORS.forest, fontSize: 16, fontWeight: '800', flex: 1, minWidth: 0 }, body: { color: COLORS.inkSoft, fontSize: 14, lineHeight: 22 },
  price: { color: COLORS.ink, fontSize: 16, fontWeight: '800' }, preference: { color: COLORS.forest, fontSize: 12, lineHeight: 18 },
  notice: { color: COLORS.ink, backgroundColor: '#FFF4DB', padding: 10, borderRadius: 10, fontSize: 13, lineHeight: 20 }, selection: { color: COLORS.forest, fontSize: 13, fontWeight: '800' },
  stepsButton: { padding: 16, minHeight: 48, borderTopWidth: 1, borderColor: COLORS.line, flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepsLabel: { color: COLORS.forest, fontSize: 14, fontWeight: '800', flex: 1, minWidth: 0 }, steps: { padding: 16, gap: 16 },
});
