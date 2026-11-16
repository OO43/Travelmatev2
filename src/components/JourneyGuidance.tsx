import { StyleSheet, View } from 'react-native';

import { AppText as Text } from '@/components/AppText';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import type { Journey } from '@/models/journey';
import { useTravelmateStore } from '@/state/TravelmateStore';
import { COLORS } from '@/theme';
import { useJourneyGuidance } from '@/viewModels/useJourneyGuidance';

const ukTime = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London', weekday: 'short', day: 'numeric', month: 'short',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

export function JourneyGuidance({ journey, confirmed }: { journey: Journey; confirmed: boolean }) {
  const { profile } = useTravelmateStore();
  const guidance = useJourneyGuidance(journey, confirmed, profile.assistancePreferences.vibrationGuidance);
  const visible = guidance.pending.filter(item => guidance.now >= item.opensAt
    || item.id === guidance.pending[0]?.id);

  return <Card>
    <Text accessibilityRole="header" style={styles.title}>Journey guidance</Text>
    <Text style={styles.body}>Reminders use the planned timetable. Keep this screen open. Check live updates and onboard announcements for changes.</Text>
    {!confirmed ? <Text style={styles.body}>An active, confirmed journey is needed to start reminders.</Text>
      : !guidance.pending.length ? <Text style={styles.body}>No upcoming timetable reminders for this journey.</Text>
      : <>
        <PrimaryButton label={guidance.enabled ? 'Stop reminders' : 'Start reminders'}
          icon={guidance.enabled ? 'notifications-off-outline' : 'notifications-outline'}
          variant={guidance.enabled ? 'secondary' : 'primary'} onPress={guidance.toggle} />
        <View accessibilityLiveRegion={guidance.enabled ? 'polite' : 'none'} style={styles.list}>
          {visible.map(item => <View key={item.id} style={styles.reminder}>
            <Text style={styles.heading}>{guidance.enabled && guidance.now >= item.opensAt ? 'Reminder · ' : 'Upcoming · '}{item.title}</Text>
            <Text style={styles.body}>{item.detail}</Text>
            <Text style={styles.body}>{ukTime.format(item.scheduledAt)} · UK time</Text>
          </View>)}
        </View>
      </>}
  </Card>;
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '800', color: COLORS.ink },
  heading: { fontSize: 16, fontWeight: '700', color: COLORS.ink },
  body: { fontSize: 14, lineHeight: 21, color: COLORS.inkSoft },
  list: { gap: 10 },
  reminder: { gap: 4, paddingTop: 10, borderTopWidth: 1, borderColor: COLORS.line },
});
