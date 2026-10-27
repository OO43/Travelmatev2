import { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import type { Journey } from '@/models/journey';
import { journeyMapData, regionForPoints } from '@/services/journeyMap';
import { COLORS } from '@/theme';

export function JourneyMap({ journey }: { journey: Journey }) {
  const [open, setOpen] = useState(false);
  const map = useRef<MapView | null>(null);
  const data = journeyMapData(journey);
  const region = regionForPoints(data.points);
  function fit() {
    if (data.points.length) map.current?.fitToCoordinates(data.points, { edgePadding: { top: 60, left: 55, right: 55, bottom: 60 }, animated: false });
  }
  if (journey.source !== 'tfl') return null;
  return <Card>
    <Text accessibilityRole="header" style={styles.heading}>Route map</Text>
    <Text style={styles.body}>{region ? 'See walking sections, boarding stops and your destination.' : 'This saved journey has no map coordinates. Run a new search to load its map.'}</Text>
    {region ? <PrimaryButton label="View route on map" icon="map-outline" onPress={() => setOpen(true)} /> : null}
    <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
      <SafeAreaProvider>
      <SafeAreaView style={styles.screen} edges={['top', 'right', 'bottom', 'left']}>
        <View style={styles.top}><Text accessibilityRole="header" style={styles.heading}>Your route</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Close route map" onPress={() => setOpen(false)} style={styles.action}><Text style={styles.actionText}>Close</Text></Pressable></View>
        {open && region ? <MapView ref={map} style={styles.map} initialRegion={region} onMapReady={fit}
          showsUserLocation={false} showsMyLocationButton={false} toolbarEnabled={false} rotateEnabled={false}
          accessibilityLabel="Planned TfL route map. The stop list below provides a text alternative.">
          {data.legs.filter(item => item.path.length).map(item => <Polyline key={item.index} coordinates={item.path}
            strokeColor={item.walking ? '#f0f3f9' : '#f50505'} strokeWidth={item.walking ? 4 : 6}
            lineDashPattern={item.walking ? [8, 6] : undefined} />)}
          {data.markers.map(marker => <Marker key={marker.id} coordinate={marker.coordinate} title={marker.label}
            pinColor={marker.kind === 'destination' ? '#B84B32' : marker.kind === 'origin' ? '#17634F' : '#144F85'} />)}
        </MapView> : null}
        <ScrollView style={styles.details} contentContainerStyle={styles.detailContent}>
          <View style={styles.legend}><Text style={styles.body}>━━ Transport</Text><Text style={styles.body}>┄┄ Walking</Text>
            <Pressable accessibilityRole="button" onPress={fit} style={styles.action}><Text style={styles.actionText}>Fit route</Text></Pressable></View>
          <Text style={styles.body}>{journey.origin} → {journey.destination}</Text>
          <Text style={styles.caption}>Planned TfL route · {journey.departureTime}–{journey.arrivalTime} · {journey.durationMinutes} min</Text>
          {data.missingPaths ? <Text style={styles.caption}>{data.missingPaths} route section(s) have no supplied path. Gaps are left undrawn.</Text> : null}
          <Text style={styles.caption}>Map shows the planned route. Your moving position and live vehicles are not shown.</Text>
          {data.markers.map(marker => <Text key={marker.id} style={styles.body}>{marker.label}</Text>)}
        </ScrollView>
      </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  </Card>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream }, top: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  heading: { color: COLORS.ink, fontSize: 22, fontWeight: '800', flexShrink: 1 }, body: { color: COLORS.ink, fontSize: 14, lineHeight: 22 },
  map: { flex: 1, minHeight: 180 }, action: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
  actionText: { color: COLORS.forest, fontSize: 14, fontWeight: '800' }, legend: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16 },
  details: { maxHeight: '38%', flexGrow: 0 }, detailContent: { padding: 18, gap: 12 }, caption: { color: COLORS.inkSoft, fontSize: 13, lineHeight: 20 },
});
