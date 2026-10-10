import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenContainer } from '@/components/ScreenContainer';
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
              <Ionicons name={icon} size={27} color={COLORS.white} />
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

      {journeySession ? (
        <>
          <Card>
            <Text style={styles.emptyTitle}>Journey session</Text>
            <Text style={styles.emptyBody}>
              Status: {journeySession.status.toUpperCase()}
            </Text>
            <Text style={styles.emptyBody}>
              Vehicle: {journeySession.vehicle_id}
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

          {journey.timeline.map((item, index) => (
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