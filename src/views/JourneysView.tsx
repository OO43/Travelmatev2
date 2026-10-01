import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader, Card, PrimaryButton, ScreenContainer } from '@/components/ui';
import type { Journey } from '@/models/journey';
import type { TicketIntelligenceResult } from '@/models/ticket';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/theme';

export function JourneysView({ currentJourney, latestTicket, onPlanJourney, onOpenJourney, onScanTicket }: {
  currentJourney: Journey | null;
  latestTicket: TicketIntelligenceResult | null;
  onPlanJourney: () => void;
  onOpenJourney: () => void;
  onScanTicket: () => void;
}) {
  return (
    <ScreenContainer header={<AppHeader title="Journeys" subtitle="Plan and follow your accessible travel" />}>
      {currentJourney ? (
        <Card style={styles.activeCard}>
          <View style={styles.row}>
            <View style={styles.icon}><Ionicons name={currentJourney.mode === 'flight' ? 'airplane' : currentJourney.mode === 'train' ? 'train' : 'bus'} size={24} color={COLORS.white} /></View>
            <View style={styles.flex}>
              <Text style={styles.eyebrow}>ACTIVE JOURNEY</Text>
              <Text style={styles.title}>{currentJourney.origin} → {currentJourney.destination}</Text>
              <Text style={styles.meta}>{currentJourney.provider} {currentJourney.serviceNumber} · {currentJourney.departureTime}</Text>
            </View>
          </View>
          <PrimaryButton label="Open journey status" icon="navigate" onPress={onOpenJourney} variant="coral" />
        </Card>
      ) : (
        <Card style={styles.emptyCard}>
          <Ionicons name="map-outline" size={36} color={COLORS.forest} />
          <Text style={styles.emptyTitle}>No active journey</Text>
          <Text style={styles.body}>Plan a bus, train or flight journey and it will appear here.</Text>
          <PrimaryButton label="Plan a journey" icon="add" onPress={onPlanJourney} />
        </Card>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ticket intelligence</Text>
        <Card>
          <Text style={styles.body}>{latestTicket ? `Your latest ${latestTicket.mode} ticket is ready to use.` : 'Scan a barcode, QR code or printed ticket to pre-fill a journey.'}</Text>
          <View style={styles.buttonGap}><PrimaryButton label="Scan a ticket" icon="scan" onPress={onScanTicket} variant="secondary" /></View>
        </Card>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  activeCard: { backgroundColor: COLORS.forestDeep, borderColor: COLORS.forestDeep, gap: SPACING.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 50, height: 50, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.14)' },
  eyebrow: { color: '#9DD4C7', ...TYPOGRAPHY.eyebrow },
  title: { color: COLORS.white, ...TYPOGRAPHY.cardTitle, marginTop: 3 },
  meta: { color: '#C9DDD8', ...TYPOGRAPHY.caption, marginTop: 4 },
  emptyCard: { alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.lg },
  emptyTitle: { color: COLORS.ink, ...TYPOGRAPHY.cardTitle },
  body: { color: COLORS.inkSoft, ...TYPOGRAPHY.body, textAlign: 'center' },
  section: { gap: SPACING.md },
  sectionTitle: { color: COLORS.ink, ...TYPOGRAPHY.sectionTitle },
  buttonGap: { marginTop: SPACING.md },
});

