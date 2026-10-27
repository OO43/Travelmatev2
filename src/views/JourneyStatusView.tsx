import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { AppHeader } from '@/components/AppHeader';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { JourneyDisruptions, JourneyRouteDetails, JourneyRouteSummary } from '@/components/JourneyRouteDetails';
import { JourneyMap } from '@/components/JourneyMap';
import { JourneyLiveUpdates } from '@/components/JourneyLiveUpdates';
import type { Journey } from '@/models/journey';
import type { JourneySession } from '@/models/journeySession';
import { COLORS, RADIUS, SPACING } from '@/theme';

type JourneyStatusViewProps = {
  journey: Journey | null;
  journeySession: JourneySession | null;
  isLoading: boolean;
  errorMessage: string | null;
  hasSessionId: boolean;
  onRetry: () => void;
  onBack: () => void;
  onFeedback: () => void;
  onPlanAnother: () => void;
};

function formatSupportCategory(category: string) {
  return category.replace(/_/g, ' ');
}

export function JourneyStatusView({
  journey,
  journeySession,
  isLoading,
  errorMessage,
  hasSessionId,
  onRetry,
  onBack,
  onFeedback,
  onPlanAnother,
}: JourneyStatusViewProps) {
  if (isLoading) {
    return (
      <ScreenContainer
        header={<AppHeader title="Journey status" onBack={onBack} />}
      >
        <Card>
          <ActivityIndicator size="large" color={COLORS.forest} />
          <Text style={styles.emptyBody}>Loading your journey session…</Text>
        </Card>
      </ScreenContainer>
    );
  }

  if (errorMessage) {
    return (
      <ScreenContainer
        header={<AppHeader title="Journey status" onBack={onBack} />}
      >
        <Card>
          <Text style={styles.emptyTitle}>Unable to load journey</Text>
          <Text style={styles.emptyBody}>{errorMessage}</Text>
        </Card>
        <PrimaryButton label="Try again" onPress={onRetry} />
      </ScreenContainer>
    );
  }

  if (!journey && !journeySession) {
    return (
      <ScreenContainer
        header={<AppHeader title="Journey status" onBack={onBack} />}
      >
        <Card>
          <Text style={styles.emptyTitle}>No active journey</Text>
          <Text style={styles.emptyBody}>
            Plan a journey to see its details and support settings.
          </Text>
        </Card>
        <PrimaryButton label="Plan a journey" onPress={onPlanAnother} />
      </ScreenContainer>
    );
  }

  const icon =
    journey?.mode === 'flight'
      ? 'airplane'
      : journey?.mode === 'train'
        ? 'train'
        : 'bus';

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Journey status"
          subtitle="Journey details and support"
          onBack={onBack}
        />
      }
    >
      {journey ? (
        <Card style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.icon}>
              <Ionicons name={icon} size={28} color={COLORS.white} />
            </View>

            <View style={styles.flex}>
              <Text style={styles.provider}>{journey.provider}</Text>
              <Text style={styles.service}>{journey.serviceNumber}</Text>
            </View>

            <Text style={styles.status}>
              {journey.status.replace(/_/g, ' ').toUpperCase()}
            </Text>
          </View>

          <Text style={styles.route}>
            {journey.origin} → {journey.destination}
          </Text>

          <View style={styles.times}>
            <Text style={styles.time}>{journey.departureTime}</Text>
            <View style={styles.timeLine} />
            <Text style={styles.time}>{journey.arrivalTime}</Text>
          </View>

          <Text style={styles.meta}>
            {journey.durationMinutes} minutes
            {journey.platform ? ` · Platform ${journey.platform}` : ''}
            {journey.gate ? ` · Gate ${journey.gate}` : ''}
          </Text>
        </Card>
      ) : null}

      {journey ? <JourneyLiveUpdates key={`live-${journey.id}`} journey={journey} /> : null}
      {journey ? <JourneyMap key={journey.id} journey={journey} /> : null}
      {journey?.source === 'tfl' ? <Card>
        <Text style={styles.emptyTitle}>Transport for London route</Text>
        <Text style={styles.emptyBody}>Times are London local time. This is a planned route, not live vehicle tracking. Saving a session does not book staff assistance or activate stop reminders.</Text>
        <JourneyRouteSummary journey={journey} />
        <JourneyDisruptions journey={journey} />
      </Card> : null}

      {journeySession ? (
        <>
          <Card>
            <Text style={styles.emptyTitle}>Journey session</Text>
            <Text style={styles.emptyBody}>
              Status: {journeySession.status.toUpperCase()}
            </Text>
            <Text style={styles.emptyBody}>
              {journeySession.vehicle_id.startsWith('planned-tfl-') ? 'Vehicle: not assigned' : 'Vehicle: ' + journeySession.vehicle_id}
            </Text>
            <Text style={styles.emptyBody}>
              Support sharing:{' '}
              {journeySession.consent_to_support_sharing
                ? 'Enabled'
                : 'Disabled'}
            </Text>
            <Text style={styles.emptyBody}>
              Enhanced supervision:{' '}
              {journeySession.consent_enhanced_supervision
                ? 'Enabled'
                : 'Disabled'}
            </Text>
            <Text style={styles.emptyBody}>
              Stop request:{' '}
              {journeySession.stop_request ? 'Requested' : 'Not requested'}
            </Text>
          </Card>

          <View style={styles.guidance}>
            <Ionicons name="sparkles" size={21} color={COLORS.lilac} />
            <View style={styles.flex}>
              <Text style={styles.guidanceTitle}>
                Recorded support preferences
              </Text>
              <Text style={styles.guidanceBody}>
                {journeySession.support_categories.length > 0
                  ? journeySession.support_categories
                      .map(formatSupportCategory)
                      .join(', ')
                  : 'No support categories recorded for this session.'}
              </Text>
            </View>
          </View>

          <PrimaryButton
            label="Refresh session"
            variant="secondary"
            onPress={onRetry}
          />
        </>
      ) : !hasSessionId ? (
        <Card>
          <Text style={styles.emptyTitle}>Journey preview</Text>
          <Text style={styles.emptyBody}>
            Confirm your journey in the planner to load its support session.
          </Text>
        </Card>
      ) : null}

      {journey ? (
        <View style={styles.section}>
          <Text style={styles.eyebrow}>JOURNEY TIMELINE</Text>

          {journey.source === 'tfl' && journey.legs?.length ? <JourneyRouteDetails journey={journey} /> : journey.timeline.map((item, index) => (
            <View key={item.id} style={styles.timelineRow}>
              <View style={styles.timelineMarker}>
                <View
                  style={[
                    styles.dot,
                    item.completed && styles.dotDone,
                    item.current && styles.dotCurrent,
                  ]}
                >
                  {item.completed ? (
                    <Ionicons
                      name="checkmark"
                      size={12}
                      color={COLORS.white}
                    />
                  ) : null}
                </View>

                {index < journey.timeline.length - 1 ? (
                  <View style={styles.verticalLine} />
                ) : null}
              </View>

              <View style={styles.timelineCopy}>
                <View style={styles.rowBetween}>
                  <Text
                    style={[
                      styles.timelineTitle,
                      item.current && styles.currentTitle,
                    ]}
                  >
                    {item.title}
                  </Text>
                  {item.time ? (
                    <Text style={styles.timelineTime}>{item.time}</Text>
                  ) : null}
                </View>
                <Text style={styles.timelineDetail}>{item.detail}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      <PrimaryButton
        label="Give journey feedback"
        icon="chatbubble-ellipses"
        variant="secondary"
        onPress={onFeedback}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  hero: {
    backgroundColor: COLORS.forestDeep,
    borderColor: COLORS.forestDeep,
    gap: SPACING.md,
  },
  heroTop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    flexShrink: 0,
    width: 50,
    height: 50,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  provider: {
    color: '#A8D8CD',
    fontSize: 12,
    fontWeight: '800',
  },
  service: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '900',
  },
  status: {
    flexShrink: 0,
    color: '#FFD09F',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  route: {
    color: COLORS.white,
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '800',
  },
  times: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  time: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: '800',
  },
  timeLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#5D8078',
  },
  meta: { color: '#C9DDD8', fontSize: 13 },
  guidance: {
    flexDirection: 'row',
    gap: 12,
    padding: SPACING.md,
    backgroundColor: COLORS.lilacSoft,
    borderRadius: RADIUS.md,
  },
  guidanceTitle: {
    color: COLORS.lilac,
    fontWeight: '900',
    fontSize: 13,
  },
  guidanceBody: {
    color: COLORS.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
  section: { gap: 0 },
  eyebrow: {
    color: COLORS.forest,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: SPACING.md,
  },
  timelineRow: { flexDirection: 'row', minHeight: 80 },
  timelineMarker: { width: 32, flexShrink: 0, alignItems: 'center' },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  dotCurrent: { borderColor: COLORS.coral, borderWidth: 5 },
  verticalLine: {
    flex: 1,
    width: 2,
    backgroundColor: COLORS.line,
  },
  timelineCopy: { flex: 1, minWidth: 0, paddingBottom: SPACING.lg },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  timelineTitle: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    color: COLORS.ink,
    fontWeight: '800',
    fontSize: 14,
  },
  currentTitle: { color: COLORS.coral },
  timelineTime: { color: COLORS.inkSoft, fontSize: 13, flexShrink: 0, textAlign: 'right' },
  timelineDetail: {
    color: COLORS.inkSoft,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  emptyTitle: {
    color: COLORS.ink,
    fontWeight: '900',
    fontSize: 18,
  },
  emptyBody: {
    color: COLORS.inkSoft,
    marginTop: 8,
    lineHeight: 20,
  },
});
