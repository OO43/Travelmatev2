import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextField } from '@/components/TextField';
import { COLORS, RADIUS, SPACING } from '@/theme';
import type { PassengerProfile } from '@/models/passenger';

const needs: { key: keyof PassengerProfile['accessibilityNeeds']; label: string; icon: 'walk' | 'eye' | 'ear' | 'accessibility' }[] = [
  { key: 'reducedMobility', label: 'Reduced mobility', icon: 'walk' },
  { key: 'visualImpairment', label: 'Visual support', icon: 'eye' },
  { key: 'hearingImpairment', label: 'Hearing support', icon: 'ear' },
  { key: 'wheelchairUser', label: 'Wheelchair access', icon: 'accessibility' },
];

export function ProfileView({ draft, saved, onUpdate, onToggleAccessibility, onSave, onLogout }: {
  draft: PassengerProfile; saved: boolean; onUpdate: <K extends keyof PassengerProfile>(key: K, value: PassengerProfile[K]) => void; onToggleAccessibility: (key: keyof PassengerProfile['accessibilityNeeds']) => void; onSave: () => void; onLogout: () => void;
}) {
  return (
    <ScreenContainer header={<AppHeader title="Passenger profile" subtitle="Personalise every journey" />}>
      <Card style={styles.identity}><View style={styles.avatar}><Text style={styles.avatarText}>{draft.preferredName.slice(0, 1).toUpperCase()}</Text></View><View style={styles.flex}><Text style={styles.name}>{draft.preferredName}</Text><Text style={styles.meta}>Travelmate Passenger · {draft.homeLocation}</Text></View></Card>
      <View style={styles.section}><Text style={styles.sectionTitle}>Personal information</Text><TextField label="Preferred name" value={draft.preferredName} onChangeText={(value) => onUpdate('preferredName', value)} /><TextField label="Preferred language" value={draft.preferredLanguage} onChangeText={(value) => onUpdate('preferredLanguage', value)} /><TextField label="Home location" value={draft.homeLocation} onChangeText={(value) => onUpdate('homeLocation', value)} /></View>
      <View style={styles.section}><Text style={styles.sectionTitle}>Accessibility needs</Text><View style={styles.options}>{needs.map((item) => { const selected = draft.accessibilityNeeds[item.key]; return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selected }} key={item.key} onPress={() => onToggleAccessibility(item.key)} style={[styles.option, selected && styles.selected]}><Ionicons name={item.icon} size={20} color={selected ? COLORS.white : COLORS.forest} /><Text style={[styles.optionText, selected && styles.selectedText]}>{item.label}</Text><Ionicons name={selected ? 'checkmark-circle' : 'ellipse-outline'} size={19} color={selected ? COLORS.white : COLORS.inkSoft} /></Pressable>; })}</View></View>
      {saved ? <Text style={styles.saved}>Profile saved. Future journeys will use these preferences.</Text> : null}
      <PrimaryButton label="Save profile" icon="checkmark" onPress={onSave} />
      <PrimaryButton label="Log out" icon="log-out" variant="secondary" onPress={onLogout} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, identity: { flexDirection: 'row', alignItems: 'center', gap: 13 }, avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: COLORS.forestSoft, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: COLORS.forest, fontSize: 22, fontWeight: '900' }, name: { color: COLORS.ink, fontSize: 18, fontWeight: '900' }, meta: { color: COLORS.inkSoft, fontSize: 12, marginTop: 3 }, section: { gap: SPACING.md }, sectionTitle: { color: COLORS.ink, fontSize: 19, fontWeight: '900' }, options: { gap: 9 }, option: { minHeight: 52, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.surface, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14 }, selected: { backgroundColor: COLORS.forest, borderColor: COLORS.forest }, optionText: { flex: 1, color: COLORS.ink, fontWeight: '700', fontSize: 13 }, selectedText: { color: COLORS.white }, saved: { color: COLORS.success, fontWeight: '700', fontSize: 12, textAlign: 'center' },
});
