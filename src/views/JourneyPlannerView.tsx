import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextField } from '@/components/TextField';
import { COLORS, RADIUS, SPACING } from '@/theme';
import { TRANSPORT_LABELS, type Journey, type TransportMode } from '@/models/journey';
import type { TicketIntelligenceResult } from '@/models/ticket';

export function JourneyPlannerView({ mode, origin, destination, isPlanning, error, result, ticket, onOriginChange, onDestinationChange, onFind, onContinue, onBack }: {
  mode: TransportMode; origin: string; destination: string; isPlanning: boolean; error: string; result: Journey | null; ticket: TicketIntelligenceResult | null;
  onOriginChange: (value: string) => void; onDestinationChange: (value: string) => void; onFind: () => void; onContinue: () => void; onBack: () => void;
}) {
  const icon = mode === 'flight' ? 'airplane' : mode === 'train' ? 'train' : 'bus';
  return (
    <ScreenContainer header={<AppHeader title={`${TRANSPORT_LABELS[mode]} journey`} subtitle="Accessible planning and live support" onBack={onBack} />}>
      <Card style={styles.modeCard}><View style={styles.modeIcon}><Ionicons name={icon} size={29} color={COLORS.forest} /></View><View style={styles.flex}><Text style={styles.modeTitle}>{TRANSPORT_LABELS[mode]} planner</Text><Text style={styles.modeBody}>Journey planning and status use one shared TravelMate flow.</Text></View></Card>
      {ticket ? <View style={styles.ticket}><Ionicons name="ticket" size={19} color={COLORS.forest} /><Text style={styles.ticketText}>Pre-filled from {ticket.source === 'barcode' ? 'barcode' : 'document scan'} · Review before continuing</Text></View> : null}
      <View style={styles.form}>
        <TextField label="From" value={origin} onChangeText={onOriginChange} placeholder="Starting point" />
        <View style={styles.connector}><View style={styles.dot} /><View style={styles.line} /><View style={[styles.dot, styles.endDot]} /></View>
        <TextField label="To" value={destination} onChangeText={onDestinationChange} placeholder="Destination" />
      </View>
      <Card style={styles.support}><Ionicons name="accessibility" size={22} color={COLORS.forest} /><View style={styles.flex}><Text style={styles.supportTitle}>Accessibility preferences applied</Text><Text style={styles.supportBody}>Step-free routes · Haptic reminders · Extra boarding time</Text></View></Card>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <PrimaryButton label={result ? 'Refresh journey' : `Find ${TRANSPORT_LABELS[mode].toLowerCase()} journey`} icon="search" loading={isPlanning} onPress={onFind} />
      {result ? (
        <Card style={styles.result}>
          <View style={styles.resultTop}><Text style={styles.best}>BEST ACCESSIBLE MATCH</Text><Text style={styles.provider}>{result.provider}</Text></View>
          <Text style={styles.times}>{result.departureTime} → {result.arrivalTime}</Text>
          <Text style={styles.route}>{result.origin} → {result.destination}</Text>
          <View style={styles.tags}>{result.accessibilityFeatures.map((feature) => <Text key={feature} style={styles.tag}>{feature}</Text>)}</View>
          <Pressable accessibilityRole="button" onPress={onContinue} style={styles.continue}><Text style={styles.continueText}>Open journey status</Text><Ionicons name="arrow-forward" size={18} color={COLORS.white} /></Pressable>
        </Card>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, modeCard: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: COLORS.forestSoft, borderColor: '#BCE2D5' },
  modeIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' }, modeTitle: { color: COLORS.ink, fontWeight: '900', fontSize: 18 }, modeBody: { color: COLORS.inkSoft, fontSize: 12, lineHeight: 17, marginTop: 3 },
  ticket: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 12, borderRadius: RADIUS.sm, backgroundColor: COLORS.amberSoft }, ticketText: { flex: 1, color: COLORS.amber, fontSize: 12, fontWeight: '700' },
  form: { gap: SPACING.sm, position: 'relative' }, connector: { position: 'absolute', left: 17, top: 76, alignItems: 'center' }, dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.forest }, endDot: { backgroundColor: COLORS.coral }, line: { width: 1, height: 31, backgroundColor: COLORS.line },
  support: { flexDirection: 'row', gap: 12, alignItems: 'center' }, supportTitle: { color: COLORS.ink, fontWeight: '800', fontSize: 13 }, supportBody: { color: COLORS.inkSoft, fontSize: 11, lineHeight: 16, marginTop: 3 }, error: { color: COLORS.error, fontWeight: '700', fontSize: 13 },
  result: { gap: 12, borderColor: COLORS.forest }, resultTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }, best: { color: COLORS.forest, fontSize: 9, fontWeight: '900', letterSpacing: 1 }, provider: { color: COLORS.inkSoft, fontSize: 11, fontWeight: '700' }, times: { color: COLORS.ink, fontWeight: '900', fontSize: 24 }, route: { color: COLORS.inkSoft, fontSize: 13 }, tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, tag: { backgroundColor: COLORS.forestSoft, color: COLORS.forest, fontSize: 10, fontWeight: '700', paddingHorizontal: 9, paddingVertical: 6, borderRadius: RADIUS.pill }, continue: { minHeight: 48, backgroundColor: COLORS.forest, borderRadius: RADIUS.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, continueText: { color: COLORS.white, fontWeight: '800' },
});
