import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import type { Journey } from '@/models/journey';
import { isOutdated, londonUpdateTime, predictionIsOutdated } from '@/services/liveUpdatesService';
import { useJourneyLiveUpdates } from '@/viewModels/useJourneyLiveUpdates';
import { COLORS } from '@/theme';

export function JourneyLiveUpdates({ journey }: { journey: Journey }) {
  const live = useJourneyLiveUpdates(journey);
  if (journey.source !== 'tfl') return null;
  if (!live.enabled) return <Card><Text style={styles.title}>Live updates</Text><Text style={styles.body}>No active transport legs with line identifiers are available. Plan a new journey to check current departures.</Text></Card>;
  return <Card>
    <Text accessibilityRole="header" style={styles.title}>Live departures and service updates</Text>
    <Text style={styles.caption}>Predictions are for now at each boarding stop, across all supplied destinations and platforms. Check the direction before boarding. They do not change your planned itinerary.</Text>
    {live.error ? <Text accessibilityLiveRegion="polite" style={styles.warning}>{live.error}{live.data ? ' Previous data is marked outdated.' : ''}</Text> : null}
    {!live.data && live.isRefreshing ? <Text accessibilityLiveRegion="polite" style={styles.body}>Loading TfL updates…</Text> : null}
    {live.data?.legs.map(board => {
      const leg = journey.legs?.[board.leg_index];
      const stale = isOutdated(board.fetched_at, live.now, Boolean(live.error) || board.state !== 'ok');
      const rows = board.predictions
        .filter(row => predictionIsOutdated(row, live.now, stale) || Date.parse(row.expected_arrival) >= live.now - 5000)
        .sort((a, b) => Date.parse(a.expected_arrival) - Date.parse(b.expected_arrival))
        .slice(0, 4);
      return <View key={`${board.leg_index}-${board.line_id}`} style={styles.section}>
        <Text style={styles.heading}>{leg?.line_name ?? board.line_id} · {leg?.origin ?? 'Boarding stop'}</Text>
        <Text style={styles.caption}>{board.fetched_at ? `${stale ? 'Outdated · last received' : 'Received'} ${londonUpdateTime(board.fetched_at)} · London time` : 'No prediction snapshot received'}</Text>
        {board.message ? <Text style={styles.warning}>{board.message}</Text> : null}
        {rows.map((row, index) => {
          const old = predictionIsOutdated(row, live.now, stale);
          const minutes = Math.max(0, Math.ceil((Date.parse(row.expected_arrival) - live.now) / 60000));
          return <View key={`${row.id}-${index}`} style={styles.row}>
            <View style={styles.copy}><Text style={styles.body}>{row.destination}</Text>{row.platform ? <Text style={styles.caption}>{row.platform}</Text> : null}</View>
            <View style={styles.prediction}><Text style={styles.estimate}>{old ? 'Outdated' : minutes === 0 ? 'Due' : `${minutes} min`}</Text>
              <Text style={styles.caption}>{londonUpdateTime(row.expected_arrival)} {old ? 'last predicted' : 'expected'}</Text></View>
          </View>;
        })}
        {!rows.length ? <Text style={styles.body}>{board.state === 'ok' ? 'No upcoming predictions in this response. This does not confirm cancellation.' : 'Predictions unavailable for this boarding stop.'}</Text> : null}
      </View>;
    })}
    {live.data?.lines.map(line => {
      const stale = isOutdated(line.fetched_at, live.now, Boolean(live.error) || line.state !== 'ok');
      return <View key={line.line_id} style={styles.section}>
        <Text style={styles.heading}>{line.name} · Service status</Text>
        <Text style={styles.caption}>{line.fetched_at ? `${stale ? 'Outdated · last received' : 'Received'} ${londonUpdateTime(line.fetched_at)} · London time` : 'No service status received'}</Text>
        {line.message ? <Text style={styles.warning}>{line.message}</Text> : null}
        {line.statuses.map((status, index) => <View key={index}><Text style={styles.body}>{status.description}</Text>{status.reason ? <Text style={styles.caption}>{status.reason}</Text> : null}</View>)}
        {!line.statuses.length ? <Text style={styles.body}>No service-status details supplied.</Text> : null}
      </View>;
    })}
    <PrimaryButton label="Refresh live updates" icon="refresh" variant="secondary" loading={live.isRefreshing} onPress={live.refresh} />
    <Text style={styles.caption}>TfL · Refreshes every minute while this screen is active. No vehicle has been assigned by these predictions.</Text>
  </Card>;
}
const styles = StyleSheet.create({
  title: { color: COLORS.ink, fontSize: 20, fontWeight: '800' }, heading: { color: COLORS.forest, fontSize: 15, fontWeight: '800' },
  body: { color: COLORS.ink, fontSize: 14, lineHeight: 22 }, caption: { color: COLORS.inkSoft, fontSize: 12, lineHeight: 19 },
  section: { borderTopWidth: 1, borderColor: COLORS.line, paddingTop: 14, gap: 8 },
  warning: { color: COLORS.ink, backgroundColor: '#FFF4DB', padding: 10, borderRadius: 10, fontSize: 13, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8 }, copy: { flex: 1, minWidth: 0 },
  prediction: { maxWidth: '45%', flexShrink: 0, alignItems: 'flex-end' }, estimate: { color: COLORS.forest, fontSize: 20, fontWeight: '800', textAlign: 'right' },
});
