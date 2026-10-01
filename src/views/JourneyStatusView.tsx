import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { COLORS, RADIUS, SPACING } from '@/theme';
import type { Journey } from '@/models/journey';

export function JourneyStatusView({ journey, onBack, onFeedback, onPlanAnother }: { journey: Journey | null; onBack: () => void; onFeedback: () => void; onPlanAnother: () => void }) {
  if (!journey) {
    return <ScreenContainer header={<AppHeader title="Journey status" onBack={onBack} />}><Card><Text style={styles.emptyTitle}>No active journey</Text><Text style={styles.emptyBody}>Plan a bus, train or flight journey to see live status and accessibility guidance.</Text></Card><PrimaryButton label="Plan a journey" onPress={onPlanAnother} /></ScreenContainer>;
  }

  const icon = journey.mode === 'flight' ? 'airplane' : journey.mode === 'train' ? 'train' : 'bus';
  return (
    <ScreenContainer header={<AppHeader title="Journey status" subtitle="Live assistance and updates" onBack={onBack} />}>
      <Card style={styles.hero}>
        <View style={styles.heroTop}><View style={styles.icon}><Ionicons name={icon} size={27} color={COLORS.white} /></View><View style={styles.flex}><Text style={styles.provider}>{journey.provider}</Text><Text style={styles.service}>{journey.serviceNumber}</Text></View><Text style={styles.status}>{journey.status.replace('_', ' ').toUpperCase()}</Text></View>
        <Text style={styles.route}>{journey.origin} → {journey.destination}</Text>
        <View style={styles.times}><Text style={styles.time}>{journey.departureTime}</Text><View style={styles.timeLine} /><Text style={styles.time}>{journey.arrivalTime}</Text></View>
        <Text style={styles.meta}>{journey.durationMinutes} minutes{journey.platform ? ` · Platform ${journey.platform}` : ''}{journey.gate ? ` · Gate ${journey.gate}` : ''}</Text>
      </Card>

      <View style={styles.guidance}><Ionicons name="sparkles" size={21} color={COLORS.lilac} /><View style={styles.flex}><Text style={styles.guidanceTitle}>Personalised guidance</Text><Text style={styles.guidanceBody}>Your accessibility preferences are active. TravelMate will provide vibration and boarding reminders.</Text></View></View>

      <View style={styles.section}><Text style={styles.eyebrow}>JOURNEY TIMELINE</Text>{journey.timeline.map((item, index) => <View key={item.id} style={styles.timelineRow}><View style={styles.timelineMarker}><View style={[styles.dot, item.completed && styles.dotDone, item.current && styles.dotCurrent]}>{item.completed ? <Ionicons name="checkmark" size={12} color={COLORS.white} /> : null}</View>{index < journey.timeline.length - 1 ? <View style={styles.verticalLine} /> : null}</View><View style={styles.timelineCopy}><View style={styles.rowBetween}><Text style={[styles.timelineTitle, item.current && styles.currentTitle]}>{item.title}</Text>{item.time ? <Text style={styles.timelineTime}>{item.time}</Text> : null}</View><Text style={styles.timelineDetail}>{item.detail}</Text></View></View>)}</View>
      <PrimaryButton label="Give journey feedback" icon="chatbubble-ellipses" variant="secondary" onPress={onFeedback} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, hero: { backgroundColor: COLORS.forestDeep, borderColor: COLORS.forestDeep, gap: SPACING.md }, heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12 }, icon: { width: 50, height: 50, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' }, provider: { color: '#A8D8CD', fontSize: 11, fontWeight: '800' }, service: { color: COLORS.white, fontSize: 20, fontWeight: '900' }, status: { color: '#FFD09F', fontSize: 9, fontWeight: '900', letterSpacing: 1 }, route: { color: COLORS.white, fontSize: 19, lineHeight: 26, fontWeight: '900' }, times: { flexDirection: 'row', alignItems: 'center', gap: 10 }, time: { color: COLORS.white, fontSize: 21, fontWeight: '900' }, timeLine: { flex: 1, height: 1, backgroundColor: '#5D8078' }, meta: { color: '#C9DDD8', fontSize: 12 },
  guidance: { flexDirection: 'row', gap: 12, padding: SPACING.md, backgroundColor: COLORS.lilacSoft, borderRadius: RADIUS.md }, guidanceTitle: { color: COLORS.lilac, fontWeight: '900', fontSize: 13 }, guidanceBody: { color: COLORS.inkSoft, fontSize: 12, lineHeight: 18, marginTop: 3 }, section: { gap: 0 }, eyebrow: { color: COLORS.forest, fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginBottom: SPACING.md }, timelineRow: { flexDirection: 'row', minHeight: 80 }, timelineMarker: { width: 32, alignItems: 'center' }, dot: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 2, borderColor: COLORS.line, alignItems: 'center', justifyContent: 'center' }, dotDone: { backgroundColor: COLORS.success, borderColor: COLORS.success }, dotCurrent: { borderColor: COLORS.coral, borderWidth: 5 }, verticalLine: { flex: 1, width: 2, backgroundColor: COLORS.line }, timelineCopy: { flex: 1, paddingBottom: SPACING.lg }, rowBetween: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }, timelineTitle: { color: COLORS.ink, fontWeight: '800', fontSize: 14 }, currentTitle: { color: COLORS.coral }, timelineTime: { color: COLORS.inkSoft, fontSize: 11 }, timelineDetail: { color: COLORS.inkSoft, fontSize: 12, lineHeight: 17, marginTop: 4 }, emptyTitle: { color: COLORS.ink, fontWeight: '900', fontSize: 18 }, emptyBody: { color: COLORS.inkSoft, marginTop: 8, lineHeight: 20 },
});
