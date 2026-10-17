import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { AppHeader, Card, PrimaryButton, ScreenContainer } from '@/components/ui';
import type { PassengerAlert } from '@/models/iteration';
import { COLORS, RADIUS } from '@/theme';
const tones = {
  amber: { icon: 'warning-outline', background: COLORS.amberSoft, color: COLORS.amber },
  blue: { icon: 'accessibility', background: COLORS.blueSoft, color: COLORS.blue },
  mint: { icon: 'checkmark', background: COLORS.forestSoft, color: COLORS.success },
  lilac: { icon: 'sparkles', background: COLORS.lilacSoft, color: COLORS.lilac },
} as const;
export function AlertsView({ alerts, totalCount, unreadCount, filter, setFilter, markRead, markAllRead,
  dismissAlert, loadSampleAlerts, onFeedback }: {
  alerts: PassengerAlert[]; totalCount: number; unreadCount: number; filter: 'all' | 'unread' | 'journey';
  setFilter: (filter: 'all' | 'unread' | 'journey') => void; markRead: (id: string) => void;
  markAllRead: () => void; dismissAlert: (id: string) => void; loadSampleAlerts: () => void; onFeedback: () => void;
}) {
  return <ScreenContainer header={<AppHeader title="Journey alerts" subtitle="Updates that may affect your travel" />}>
    <PrimaryButton label="Mark all as read" variant="secondary" disabled={!unreadCount} onPress={markAllRead} />
    <View style={styles.filters}>
      {([{ key: 'all', label: 'All', count: totalCount }, { key: 'unread', label: 'Unread', count: unreadCount },
        { key: 'journey', label: 'My journeys' }] as const).map(item =>
        <Pressable key={item.key} accessibilityRole="button" accessibilityState={{ selected: filter === item.key }}
          onPress={() => setFilter(item.key)} style={[styles.tab, filter === item.key && styles.selected]}>
          <Text style={[styles.tabText, filter === item.key && styles.white]}>{item.label}{'count' in item ? ' (' + item.count + ')' : ''}</Text>
        </Pressable>)}
    </View>
    {alerts.length ? alerts.map(alert => {
      const tone = tones[alert.tone];
      return <Card key={alert.id} style={alert.unread ? styles.unread : {}}>
        <View style={styles.top}>
          <View style={[styles.icon, { backgroundColor: tone.background }]}><Ionicons name={tone.icon} size={23} color={tone.color} /></View>
          <View style={styles.copy}><Text style={styles.meta}>{alert.type}{alert.sample ? ' · SAMPLE' : ''}</Text>
            <Text style={styles.meta}>{new Date(alert.createdAt).toLocaleString()}</Text></View>
          {alert.unread ? <View accessible accessibilityLabel="Unread" style={styles.dot} /> : null}
        </View>
        <Text style={styles.title}>{alert.title}</Text><Text style={styles.body}>{alert.message}</Text>
        <View style={styles.actions}>
          {alert.action === 'feedback' ? <Pressable accessibilityRole="button" onPress={() => { markRead(alert.id); onFeedback(); }} style={styles.action}><Text style={styles.link}>Share feedback</Text></Pressable> : null}
          {alert.unread ? <Pressable accessibilityRole="button" onPress={() => markRead(alert.id)} style={styles.action}><Text style={styles.link}>Mark as read</Text></Pressable> : null}
          <Pressable accessibilityRole="button" accessibilityLabel={'Dismiss ' + alert.title} onPress={() => dismissAlert(alert.id)} style={styles.action}><Text style={styles.link}>Dismiss</Text></Pressable>
        </View>
      </Card>;
    }) : <Card><Text style={styles.title}>You’re all caught up</Text><Text style={styles.body}>There are no alerts in this view.</Text></Card>}
    <Text style={styles.meta}>Local inbox for this iteration. Live service updates and staff acknowledgements are not connected.</Text>
    <PrimaryButton label="Load sample alerts for testing" variant="secondary" onPress={loadSampleAlerts} />
  </ScreenContainer>;
}
const styles = StyleSheet.create({
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, tab: { padding: 12, borderRadius: RADIUS.pill,
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line }, selected: { backgroundColor: '#144F85' },
  tabText: { color: COLORS.ink, fontSize: 14, fontWeight: '800' }, white: { color: COLORS.white },
  unread: { borderColor: COLORS.blue, borderWidth: 2 }, top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 4 }, meta: { color: COLORS.inkSoft, fontSize: 12, lineHeight: 18 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.coral },
  title: { fontSize: 18, lineHeight: 25, fontWeight: '800', color: COLORS.ink, marginTop: 12 },
  body: { color: COLORS.inkSoft, fontSize: 16, lineHeight: 24, marginTop: 8 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  action: { paddingVertical: 12, paddingHorizontal: 8 }, link: { color: '#144F85', fontWeight: '800', fontSize: 14 },
});
