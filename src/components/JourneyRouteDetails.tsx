import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import type { Journey, JourneyLeg } from '@/models/journey';
import { isWalkingLeg, journeySummary, journeyWarnings, legServiceLabel, legTimeRange, snapshotLabel, transferMinutes } from '@/services/journeyDisplay';
import { COLORS } from '@/theme';

function legIcon(leg: JourneyLeg): 'walk-outline' | 'bus-outline' | 'train-outline' {
  return isWalkingLeg(leg) ? 'walk-outline' : leg.mode.includes('bus') ? 'bus-outline' : 'train-outline';
}
export function JourneyRouteSummary({ journey }: { journey: Journey }) {
  const summary = journeySummary(journey);
  return <View style={styles.summary}>
    <Text style={styles.meta}>{summary.walkingMinutes} min walking · {summary.changesLabel}</Text>
    <View style={styles.chips}>{journey.legs?.map((leg, index) => <View key={index} style={styles.chip}>
      <Ionicons name={legIcon(leg)} size={17} color={COLORS.forest} />
      <Text style={styles.chipText}>{isWalkingLeg(leg) ? `${legServiceLabel(leg)} ${leg.duration_minutes} min` : legServiceLabel(leg)}</Text>
    </View>)}</View>
  </View>;
}
export function JourneyDisruptions({ journey }: { journey: Journey }) {
  const warnings = journeyWarnings(journey);
  if (!warnings.length) return <Text style={styles.meta}>No disruption notices were included in this journey response.</Text>;
  return <View style={styles.warnings}>
    <Text accessibilityRole="header" style={styles.warningTitle}>Journey notices · {warnings.length}</Text>
    {warnings.map((warning, index) => <Text key={index} style={styles.warningText}>• {warning}</Text>)}
  </View>;
}
export function JourneyRouteDetails({ journey }: { journey: Journey }) {
  const legs = journey.legs ?? [];
  return <View style={styles.details}>
    <Text style={styles.meta}>{snapshotLabel(journey.fetchedAt)}</Text>
    <Text style={styles.meta}>Planned journey steps. Times below are London local time.</Text>
    {legs.map((leg, index) => {
      const waiting = index ? transferMinutes(legs[index - 1], leg) : 0;
      const walking = isWalkingLeg(leg);
      const boardLabel = legs.slice(0, index).some(previous => !isWalkingLeg(previous)) ? 'Change / board at' : 'Board at';
      return <View key={`${journey.id}-${index}`}>
        {waiting > 0 ? <Text style={styles.waiting}>Scheduled wait / connection · {waiting} min</Text> : null}
        <View style={styles.leg}>
          <View style={styles.marker}><Ionicons name={legIcon(leg)} size={22} color={COLORS.forest} /></View>
          <View style={styles.copy}>
            <Text style={styles.step}>STEP {index + 1}</Text>
            <Text accessibilityRole="header" style={styles.title}>{legServiceLabel(leg)} · {leg.duration_minutes} min</Text>
            <Text style={styles.time}>{legTimeRange(leg)}</Text>
            <Text style={styles.body}>{walking ? 'From' : boardLabel}: {leg.origin}</Text>
            <Text style={styles.body}>{walking ? 'Walk to' : 'Alight at'}: {leg.destination}</Text>
            {leg.instruction ? <Text style={styles.instruction}>{leg.instruction}</Text> : null}
            {leg.disruptions?.map((notice, noticeIndex) => <Text key={noticeIndex} style={styles.warningText}>Notice: {notice}</Text>)}
          </View>
        </View>
      </View>;
    })}
    <View style={styles.arrival}><Text style={styles.title}>Arrive at {journey.destination}</Text><Text style={styles.time}>{journey.arrivalTime}{journey.arrivalDate && journey.arrivalDate !== journey.departureDate ? ` · ${journey.arrivalDate}` : ''}</Text></View>
  </View>;
}
const styles = StyleSheet.create({
  summary: { gap: 10 }, details: { gap: 14 }, meta: { color: COLORS.inkSoft, fontSize: 13, lineHeight: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, chip: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, maxWidth: '100%', gap: 6, padding: 8, backgroundColor: '#EBF4FF', borderRadius: 12 },
  chipText: { color: COLORS.forest, fontSize: 13, flexShrink: 1, minWidth: 0 },
  leg: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 }, marker: { flexShrink: 0, padding: 8, borderRadius: 20, backgroundColor: '#EBF4FF' },
  copy: { flex: 1, minWidth: 0, gap: 6 }, step: { color: COLORS.inkSoft, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: { color: COLORS.ink, fontSize: 15, fontWeight: '800', lineHeight: 22 }, time: { color: COLORS.forest, fontSize: 14, fontWeight: '800', lineHeight: 22 },
  body: { color: COLORS.ink, fontSize: 14, lineHeight: 21 }, instruction: { color: COLORS.inkSoft, fontSize: 13, lineHeight: 20 },
  waiting: { marginBottom: 12, color: COLORS.inkSoft, fontSize: 13, lineHeight: 20 },
  arrival: { paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.line, gap: 6 },
  warnings: { padding: 12, gap: 8, borderRadius: 12, backgroundColor: '#FFF4DB' }, warningTitle: { color: COLORS.ink, fontSize: 14, fontWeight: '800' }, warningText: { color: COLORS.ink, fontSize: 13, lineHeight: 21 },
});
