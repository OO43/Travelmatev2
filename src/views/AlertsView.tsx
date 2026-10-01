import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader, Card, PrimaryButton, ScreenContainer } from '@/components/ui';
import type { Journey } from '@/models/journey';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/theme';

export function AlertsView({ currentJourney, vibrationGuidance, stopAnnouncements, onOpenJourney, onEditPreferences }: {
  currentJourney: Journey | null;
  vibrationGuidance: boolean;
  stopAnnouncements: boolean;
  onOpenJourney: () => void;
  onEditPreferences: () => void;
}) {
  return (
    <ScreenContainer header={<AppHeader title="Alerts" subtitle="Journey updates and reminders" />}>
      {currentJourney ? (
        <Card style={styles.liveCard}>
          <View style={styles.row}><View style={styles.liveDot} /><Text style={styles.liveLabel}>LIVE JOURNEY</Text></View>
          <Text style={styles.liveTitle}>{currentJourney.origin} → {currentJourney.destination}</Text>
          <Text style={styles.liveBody}>Status: {currentJourney.status.replace('_', ' ')}. TravelMate will alert you when your journey changes.</Text>
          <PrimaryButton label="View live journey" icon="navigate" onPress={onOpenJourney} variant="coral" />
        </Card>
      ) : (
        <Card style={styles.empty}><Ionicons name="notifications-outline" size={34} color={COLORS.forest} /><Text style={styles.emptyTitle}>No live alerts</Text><Text style={styles.body}>Journey alerts will appear here after you start travelling.</Text></Card>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alert preferences</Text>
        <Card style={styles.list}>
          <AlertRow icon="phone-portrait" label="Vibration guidance" enabled={vibrationGuidance} />
          <AlertRow icon="megaphone" label="Stop announcements" enabled={stopAnnouncements} />
          <AlertRow icon="warning" label="Delay and diversion updates" enabled />
        </Card>
      </View>
      <PrimaryButton label="Edit alert preferences" icon="options" onPress={onEditPreferences} variant="secondary" />
    </ScreenContainer>
  );
}

function AlertRow({ icon, label, enabled }: { icon: 'phone-portrait' | 'megaphone' | 'warning'; label: string; enabled: boolean }) {
  return <View style={styles.alertRow}><View style={styles.alertIcon}><Ionicons name={icon} size={19} color={COLORS.forest} /></View><Text style={styles.alertText}>{label}</Text><Text style={[styles.state, !enabled && styles.stateOff]}>{enabled ? 'ON' : 'OFF'}</Text></View>;
}

const styles = StyleSheet.create({
  liveCard: { backgroundColor: COLORS.forestDeep, borderColor: COLORS.forestDeep, gap: SPACING.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.coral },
  liveLabel: { color: '#9DD4C7', ...TYPOGRAPHY.eyebrow },
  liveTitle: { color: COLORS.white, ...TYPOGRAPHY.cardTitle },
  liveBody: { color: '#C9DDD8', ...TYPOGRAPHY.bodySmall },
  empty: { alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.lg },
  emptyTitle: { color: COLORS.ink, ...TYPOGRAPHY.cardTitle },
  body: { color: COLORS.inkSoft, ...TYPOGRAPHY.body, textAlign: 'center' },
  section: { gap: SPACING.md },
  sectionTitle: { color: COLORS.ink, ...TYPOGRAPHY.sectionTitle },
  list: { gap: 14 },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  alertIcon: { width: 38, height: 38, borderRadius: RADIUS.sm, backgroundColor: COLORS.forestSoft, alignItems: 'center', justifyContent: 'center' },
  alertText: { flex: 1, color: COLORS.ink, ...TYPOGRAPHY.body, fontWeight: '700' },
  state: { color: COLORS.success, ...TYPOGRAPHY.eyebrow },
  stateOff: { color: COLORS.inkSoft },
});
