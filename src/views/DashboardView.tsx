import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';

import { AppHeader } from '@/components/AppHeader';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/theme';
import { TRANSPORT_LABELS, type Journey, type TransportMode } from '@/models/journey';
import type { TicketIntelligenceResult } from '@/models/ticket';
import type { QuickAction } from '@/viewModels/useDashboardViewModel';

// EDIT THIS FILE for dashboard layout, labels rendered directly in the view,
// cards, icons and local styles. See DEVELOPER_GUIDE.md for the full edit map.

const tones = {
  mint: { background: COLORS.forestSoft, foreground: COLORS.forest },
  blue: { background: COLORS.blueSoft, foreground: COLORS.blue },
  lilac: { background: COLORS.lilacSoft, foreground: COLORS.lilac },
  coral: { background: COLORS.coralSoft, foreground: COLORS.coral },
};

export function DashboardView({
  passengerName,
  quickActions,
  currentJourney,
  latestTicket,
  showTicketBanner,
  onDismissTicketBanner,
  onSelectMode,
  onScanTicket,
  onOpenJourney,
  onOpenProfile,
  onAssistance,
  onAlerts,
  unreadCount,
}: {
  passengerName: string;
  quickActions: QuickAction[];
  currentJourney: Journey | null;
  latestTicket: TicketIntelligenceResult | null;
  showTicketBanner: boolean;
  onDismissTicketBanner: () => void;
  onSelectMode: (mode: TransportMode) => void;
  onScanTicket: () => void;
  onOpenJourney: () => void;
  onOpenProfile: () => void;
  onAssistance: () => void;
  onAlerts: () => void;
  unreadCount: number;
}) {
  return (
    <ScreenContainer header={<AppHeader title={`Hello, ${passengerName}`} subtitle="Where are you travelling today?" onProfile={onOpenProfile} onAlerts={onAlerts} unreadCount={unreadCount} />}>
      <PrimaryButton style={styles.assistanceButton} label="Get help / request assistance" icon="hand-left" onPress={onAssistance} variant="secondary" />
      <Card style={styles.scannerCard}>
        <View style={styles.scannerIcon}><Ionicons name="scan" size={28} color={COLORS.white} /></View>
        <View style={styles.flex}>
          <Text style={styles.scannerKicker}>TICKET INTELLIGENCE</Text>
          <Text style={styles.scannerTitle}>Scan your travel ticket</Text>
          <Text style={styles.scannerBody}>Read a QR code, barcode or printed ticket and pre-fill your journey.</Text>
        </View>
        <PrimaryButton label="Scan ticket" icon="camera" onPress={onScanTicket} variant="coral" />
      </Card>

      {latestTicket && showTicketBanner ? (
        <View style={styles.ticketNotice}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
          <Text style={styles.ticketNoticeText}>{TRANSPORT_LABELS[latestTicket.mode]} ticket ready · {Math.round(latestTicket.confidence * 100)}% confidence</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Dismiss ticket ready message"
            onPress={onDismissTicketBanner} style={styles.dismissTicket}>
            <Ionicons name="close" size={20} color={COLORS.forest} />
          </Pressable>
        </View>
      ) : null}

      <View style={styles.section}>
        <View><Text style={styles.eyebrow}>QUICK ACTIONS</Text><Text style={styles.sectionTitle}>Plan by transport</Text></View>
        <View style={styles.grid}>
          {quickActions.map((action) => {
            const tone = tones[action.tone];
            return (
              <Pressable
                key={action.mode}
                accessibilityRole="button"
                accessibilityState={{ disabled: !action.enabled }}
                disabled={!action.enabled}
                onPress={() => onSelectMode(action.mode)}
                style={({ pressed }) => [styles.actionCard, !action.enabled && styles.disabled, pressed && styles.pressed]}
              >
                <View style={[styles.actionIcon, { backgroundColor: tone.background }]}><Ionicons name={action.icon} size={26} color={tone.foreground} /></View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDetail}>{action.detail}</Text>
                {!action.enabled ? <Text style={styles.soon}>COMING SOON</Text> : <Ionicons name="arrow-forward" size={18} color={COLORS.forest} />}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <View><Text style={styles.eyebrow}>YOUR JOURNEY</Text><Text style={styles.sectionTitle}>{currentJourney ? 'Continue travelling' : 'No active journey'}</Text></View>
        {currentJourney ? (
          <Card style={styles.journeyCard}>
            <View style={styles.rowBetween}>
              <View style={styles.modePill}><Ionicons name={currentJourney.mode === 'flight' ? 'airplane' : currentJourney.mode === 'train' ? 'train' : 'bus'} size={16} color={COLORS.white} /><Text style={styles.modeText}>{currentJourney.provider} {currentJourney.serviceNumber}</Text></View>
              <Text style={styles.status}>{currentJourney.status.replace('_', ' ').toUpperCase()}</Text>
            </View>
            <Text style={styles.route}>{currentJourney.origin}  →  {currentJourney.destination}</Text>
            <Text style={styles.routeMeta}>{currentJourney.departureTime} · {currentJourney.durationMinutes} minutes</Text>
            <PrimaryButton label="View journey status" icon="navigate" onPress={onOpenJourney} />
          </Card>
        ) : (
          <Card><Text style={styles.empty}>Choose Bus, Train or Flight above to create your first accessible journey.</Text></Card>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, section: { gap: SPACING.md, padding: 1},
  scannerCard: { backgroundColor: COLORS.forestDeep, borderColor: COLORS.forestDeep, gap: SPACING.md },
  scannerIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  scannerKicker: { color: '#9DD4C7', ...TYPOGRAPHY.eyebrow },
  scannerTitle: { color: COLORS.white, fontSize: 23, fontWeight: '900', marginTop: 4 },
  scannerBody: { color: '#C9DDD8', ...TYPOGRAPHY.bodySmall, marginTop: 6 },
  ticketNotice: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.forestSoft, padding: 12, borderRadius: RADIUS.sm },
  ticketNoticeText: { color: COLORS.forest, flex: 1, fontWeight: '700', fontSize: 12 },
  dismissTicket: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { color: COLORS.forest, ...TYPOGRAPHY.eyebrow, letterSpacing: 1.3, fontSize: 12 },
  sectionTitle: { color: COLORS.ink, ...TYPOGRAPHY.sectionTitle, marginTop: 3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: { width: '48%', minHeight: 172, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.surface, padding: 14, gap: 9 },
  actionIcon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { color: COLORS.ink, fontSize: 17, fontWeight: '900' },
  actionDetail: { color: COLORS.inkSoft, ...TYPOGRAPHY.caption, flex: 1 },
  disabled: { opacity: 0.58 }, pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  soon: { color: COLORS.coral, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  journeyCard: { gap: SPACING.md, paddingBottom: 15, paddingRight: 10 }, 
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 7 },
  modePill: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.forest, borderRadius: RADIUS.pill, paddingHorizontal: 6, paddingVertical: 7 },
  modeText: { flex: 1, minWidth: 0, flexShrink: 1, color: COLORS.white, fontWeight: '800', fontSize: 11 },
  status: { flexShrink: 0, paddingVertical: 7, color: COLORS.coral, fontSize: 11, fontWeight: '900', lineHeight: 12, },
  route: { color: COLORS.ink, fontSize: 18, lineHeight: 25, fontWeight: '900' }, routeMeta: { color: COLORS.inkSoft, fontSize: 15, fontWeight: 900 },
  empty: { color: COLORS.inkSoft, ...TYPOGRAPHY.body },
  assistanceButton: { marginBottom: SPACING.md, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.forestLight },
});
