import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { AppHeader, Card, PrimaryButton, ScreenContainer, TextField } from '@/components/ui';
import type { SavedJourney, SavedPlace } from '@/models/iteration';
import type { TicketIntelligenceResult } from '@/models/ticket';
import { COLORS } from '@/theme';
export function JourneysView({ upcoming, history, savedPlaces, latestTicket, archiveJourney, addPlace, removePlace,
  onOpenJourney, onPlanJourney, onScanTicket }: {
  upcoming: SavedJourney[]; history: SavedJourney[]; savedPlaces: SavedPlace[]; latestTicket: TicketIntelligenceResult | null;
  archiveJourney: (id: string) => void; addPlace: (label: string, location: string) => void;
  removePlace: (id: string) => void; onOpenJourney: (item: SavedJourney) => void;
  onPlanJourney: (destination?: string) => void; onScanTicket: () => void;
}) {
  const [label, setLabel] = useState(''); const [location, setLocation] = useState('');
  const [adding, setAdding] = useState(false);
  return <ScreenContainer header={<AppHeader title="Journeys" subtitle="Plan, save and revisit your travel" />}>
    <PrimaryButton label="Plan a journey" icon="add" onPress={() => onPlanJourney()} />
    <Text style={styles.title}>Upcoming journeys</Text>
    {upcoming.length ? upcoming.map(item => <Card key={item.journey.id}>
      <Text style={styles.route}>{item.journey.origin} → {item.journey.destination}</Text>
      <Text style={styles.body}>{item.journey.provider} {item.journey.serviceNumber} · {item.journey.departureTime}</Text>
      <Text style={styles.body}>{item.sessionId ? 'Backend session linked' : 'Local journey plan · not confirmed'}</Text>
      <View style={styles.gap}><PrimaryButton label="Open journey status" onPress={() => onOpenJourney(item)} /></View>
      <View style={styles.gap}><PrimaryButton label="Move to local history" variant="secondary" onPress={() => archiveJourney(item.journey.id)} /></View>
    </Card>) : <Card><Text style={styles.body}>No upcoming journeys. Plan your first trip above.</Text></Card>}
    <Text style={styles.title}>Saved places</Text>
    {savedPlaces.map(place => <Card key={place.id}><Text style={styles.route}>{place.label}</Text><Text style={styles.body}>{place.location}</Text>
      <View style={styles.gap}><PrimaryButton label="Plan a journey here" onPress={() => onPlanJourney(place.location)} /></View>
      <View style={styles.gap}><PrimaryButton label="Remove saved place" variant="secondary" onPress={() => removePlace(place.id)} /></View>
    </Card>)}
    {!savedPlaces.length ? <Text style={styles.body}>Save home, work or another destination for quick planning.</Text> : null}
    <PrimaryButton label={adding ? 'Cancel adding place' : 'Add saved place'} variant="secondary" onPress={() => setAdding(!adding)} />
    {adding ? <Card><TextField label="Place name" value={label} onChangeText={setLabel} placeholder="Work" />
      <View style={styles.gap}><TextField label="Location" value={location} onChangeText={setLocation} placeholder="Station or address" /></View>
      <View style={styles.gap}><PrimaryButton label="Save place" disabled={!label.trim() || !location.trim()} onPress={() => {
        addPlace(label, location); setLabel(''); setLocation(''); setAdding(false);
      }} /></View></Card> : null}
    <Text style={styles.title}>Recent journeys / history</Text>
    <Text style={styles.body}>Local history records archived plans. It does not mark the backend session completed.</Text>
    {history.length ? history.map(item => <Card key={item.journey.id}><Text style={styles.route}>{item.journey.origin} → {item.journey.destination}</Text>
      <Text style={styles.body}>{item.journey.provider} {item.journey.serviceNumber}</Text>
      <View style={styles.gap}><PrimaryButton label="Plan this route again" variant="secondary" onPress={() => onPlanJourney(item.journey.destination)} /></View>
    </Card>) : <Card><Text style={styles.body}>No recent journeys yet.</Text></Card>}
    <Text style={styles.title}>Ticket intelligence</Text><Text style={styles.body}>{latestTicket ? 'Your latest ticket is ready.' : 'Scan a ticket to pre-fill your journey.'}</Text>
    <PrimaryButton label="Scan ticket" icon="scan" variant="secondary" onPress={onScanTicket} />
  </ScreenContainer>;
}
const styles = StyleSheet.create({ title: { fontSize: 22, fontWeight: '800', color: COLORS.ink },
  route: { fontSize: 18, lineHeight: 26, fontWeight: '800', color: COLORS.ink },
  body: { fontSize: 14, lineHeight: 22, color: COLORS.inkSoft, marginTop: 6 }, gap: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: 'transparent' } });
