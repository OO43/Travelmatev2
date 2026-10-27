import { useEffect, useRef, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { autocompletePlaces, createPlaceSessionToken, resolvePlace } from '@/services/placeService';
import type { PlacePrediction, ResolvedPlace } from '@/services/placeService';
import { COLORS } from '@/theme';

export function PlaceAutocompleteField({ label, value, disabled, onChange, onSelect }: {
  label: string; value: string; disabled: boolean; onChange: (value: string) => void;
  onSelect: (place: ResolvedPlace, userQuery: string, displayLabel: string) => void;
}) {
  const [picker, setPicker] = useState<{ token: string; query: string } | null>(null);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [message, setMessage] = useState('');
  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const selectionLock = useRef(false);
  useEffect(() => () => { generation.current += 1; controller.current?.abort(); }, []);
  function stop() { generation.current += 1; controller.current?.abort(); }
  function close() { stop(); selectionLock.current = false; setPicker(null); setResolving(false); }
  function open() {
    stop(); setMessage(''); setPredictions([]); setIsLoading(false);
    setPicker({ token: createPlaceSessionToken(), query: ['Current location', 'Your current location'].includes(value) ? '' : value });
  }
  function edit(query: string) {
    stop(); setPredictions([]); setMessage(''); setIsLoading(query.trim().length >= 3);
    setPicker(current => current ? { ...current, query } : current);
  }
  useEffect(() => {
    if (!picker || picker.query.trim().length < 3) return;
    const version = generation.current;
    const aborter = new AbortController(); controller.current = aborter;
    const timer = setTimeout(() => {
      setIsLoading(true);
      void autocompletePlaces(picker.query.trim(), picker.token, aborter.signal).then(items => {
        if (version !== generation.current || aborter.signal.aborted) return;
        setPredictions(items); setMessage(items.length ? '' : 'No suggestions found. Try a more specific London location or use manual entry.');
      }).catch(error => {
        if (version === generation.current && !aborter.signal.aborted) setMessage(error instanceof Error ? error.message : 'Place search is unavailable.');
      }).finally(() => {
        if (version === generation.current && !aborter.signal.aborted) setIsLoading(false);
      });
    }, 350);
    return () => { clearTimeout(timer); aborter.abort(); };
  }, [picker]);

  async function select(prediction: PlacePrediction) {
    if (!picker || selectionLock.current) return;
    selectionLock.current = true; stop(); const version = generation.current;
    const aborter = new AbortController(); controller.current = aborter;
    setResolving(true); setIsLoading(false); setMessage('');
    try {
      const place = await resolvePlace(prediction.place_id, picker.token, aborter.signal);
      if (version !== generation.current || aborter.signal.aborted) return;
      onSelect(place, picker.query, prediction.label); close();
    } catch (error) {
      if (version === generation.current && !aborter.signal.aborted) {
        setMessage(error instanceof Error ? error.message : 'Unable to select this place.');
        // A details request ends its session, including when its response is lost.
        setPredictions([]); setPicker(current => current ? { ...current, token: createPlaceSessionToken() } : current);
      }
    } finally { if (version === generation.current) { selectionLock.current = false; setResolving(false); } }
  }
  return <View>
    <Text style={styles.label}>{label}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${value || 'Choose a location'}`}
      accessibilityState={{ disabled, expanded: Boolean(picker) }} disabled={disabled} onPress={open} style={styles.trigger}>
      <Ionicons name="location-outline" size={23} color={COLORS.inkSoft} />
      <Text style={styles.value}>{value || (label === 'From' ? 'Current location' : 'Destination')}</Text>
      <Ionicons name="search" size={20} color={COLORS.forest} />
    </Pressable>
    <Modal visible={Boolean(picker)} animationType="slide" transparent onRequestClose={close}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close place search" style={StyleSheet.absoluteFill} onPress={close} />
        <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.sheet} accessibilityViewIsModal>
          <View style={styles.handle} />
          <View style={styles.headingRow}><Text accessibilityRole="header" style={styles.heading}>{label === 'From' ? 'Where are you starting?' : 'Where are you going?'}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Close place search" onPress={close} style={styles.close}><Ionicons name="close" size={25} color={COLORS.ink} /></Pressable></View>
          <TextInput accessibilityLabel={`Search ${label.toLowerCase()}`} placeholder="Address, station or postcode" placeholderTextColor={COLORS.inkSoft}
            value={picker?.query ?? ''} onChangeText={edit} editable={!resolving} autoCorrect={false} autoFocus maxLength={255} style={styles.input} />
          <Text style={styles.hint}>London suggestions first. TfL journeys cover London.</Text>
          <View accessibilityLiveRegion="polite">{isLoading || resolving ? <View style={styles.loading}><ActivityIndicator color={COLORS.forest} /><Text style={styles.hint}>{resolving ? 'Selecting place…' : 'Searching places…'}</Text></View> : null}
            {message ? <Text style={styles.message}>{message}</Text> : null}
            {picker && picker.query.trim().length < 3 ? <Text style={styles.hint}>Type at least 3 characters to search.</Text> : null}</View>
          <ScrollView keyboardShouldPersistTaps="handled" style={styles.results}>
            {predictions.map(prediction => <Pressable key={prediction.place_id} accessibilityRole="button" disabled={resolving}
              accessibilityLabel={prediction.label} onPress={() => { void select(prediction); }} style={styles.result}>
              <Text style={styles.primary}>{prediction.primary_text}</Text><Text style={styles.secondary}>{prediction.secondary_text}</Text>
            </Pressable>)}
            {predictions.length ? <Text style={styles.attribution}>Google Maps</Text> : null}
          </ScrollView>
          <Pressable accessibilityRole="button" disabled={!picker?.query.trim() || resolving} style={styles.manual}
            onPress={() => { if (picker) { onChange(picker.query.trim()); close(); } }}>
            <Text style={styles.manualText}>Use typed location without suggestions</Text>
          </Pressable>
          <View style={styles.links}><Text style={styles.link} onPress={() => { void Linking.openURL('https://policies.google.com/privacy'); }}>Google privacy</Text>
            <Text style={styles.link} onPress={() => { void Linking.openURL('https://maps.google.com/help/terms_maps/'); }}>Google Maps terms</Text></View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  label: { color: COLORS.white, fontSize: 14, fontWeight: '800', marginBottom: 7 },
  trigger: { minHeight: 55, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, backgroundColor: COLORS.white },
  value: { flex: 1, minWidth: 0, color: COLORS.ink, fontSize: 16, fontWeight: '700' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { padding: 20, backgroundColor: COLORS.cream, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '90%' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.line, alignSelf: 'center' },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 12 },
  heading: { flex: 1, minWidth: 0, color: COLORS.ink, fontSize: 23, fontWeight: '800' },
  close: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  input: { backgroundColor: COLORS.white, color: COLORS.ink, fontSize: 16, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: COLORS.line },
  hint: { color: COLORS.inkSoft, fontSize: 13, lineHeight: 20, marginVertical: 8 }, loading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  message: { color: COLORS.ink, fontSize: 14, lineHeight: 22, marginVertical: 10 },
  results: { flexGrow: 0, flexShrink: 1 }, result: { borderBottomWidth: 1, borderColor: COLORS.line, paddingVertical: 14, minHeight: 55 },
  primary: { color: COLORS.ink, fontSize: 16, fontWeight: '700' }, secondary: { color: COLORS.inkSoft, fontSize: 13, lineHeight: 20, marginTop: 4 },
  attribution: { color: '#5E5E5E', backgroundColor: COLORS.white, fontSize: 12, fontWeight: '400', paddingVertical: 8 },
  manual: { paddingVertical: 14, minHeight: 48 }, manualText: { color: COLORS.forest, fontSize: 14, fontWeight: '700' },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 }, link: { color: COLORS.inkSoft, fontSize: 12, textDecorationLine: 'underline', paddingVertical: 8 },
});
