import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { AppHeader, Card, PrimaryButton, ScreenContainer, TextField } from '@/components/ui';
import { SelectField } from '@/components/SelectField';
import { PreferenceSwitch } from '@/components/PreferenceSwitch';
import type { PassengerProfile } from '@/models/passenger';
import { COLORS, SPACING } from '@/theme';

const needs: [keyof PassengerProfile['accessibilityNeeds'], string][] = [
  ['reducedMobility', 'Reduced mobility'], ['visualImpairment', 'Visual support'],
  ['hearingImpairment', 'Hearing support'], ['wheelchairUser', 'Wheelchair access'],
  ['cognitiveSupportRequired', 'Cognitive support'], ['assistanceAnimalSupport', 'Assistance animal'],
  ['temporaryAccessibilityNeed', 'Temporary accessibility support'],
];
const languages = ['English (UK)', 'Mandarin Chinese', 'Spanish', 'French', 'Portuguese'];
export function ManageAccountView({ draft, saved, onUpdate, onToggleAccessibility, onSave, onBack }: {
  draft: PassengerProfile; saved: boolean;
  onUpdate: <K extends keyof PassengerProfile>(key: K, value: PassengerProfile[K]) => void;
  onToggleAccessibility: (key: keyof PassengerProfile['accessibilityNeeds']) => void;
  onSave: () => void; onBack: () => void;
}) {
  return <ScreenContainer header={<AppHeader title="Manage account" subtitle="Personal information" onBack={onBack} />}>
    <Card><Text style={styles.title}>{draft.preferredName || draft.firstName || 'Your profile'}</Text>
      <Text style={styles.body}>Profile changes save on this device. Backend profile sync is next.</Text></Card>
    <View style={styles.section}>
      <Text style={styles.title}>Personal information</Text>
      <TextField label="First name" value={draft.firstName ?? ''} onChangeText={value => onUpdate('firstName', value)} />
      <TextField label="Last name" value={draft.lastName ?? ''} onChangeText={value => onUpdate('lastName', value)} />
      <TextField label="Preferred name" value={draft.preferredName} onChangeText={value => onUpdate('preferredName', value)} />
      <TextField label="Phone number" keyboardType="phone-pad" value={draft.phoneNumber} onChangeText={value => onUpdate('phoneNumber', value)} />
      <TextField label="Email address" keyboardType="email-address" autoCapitalize="none" value={draft.emailAddress} onChangeText={value => onUpdate('emailAddress', value)} />
      <SelectField label="Preferred language" value={draft.preferredLanguage} options={languages.map(value => ({ value, label: value }))}
        onChange={value => onUpdate('preferredLanguage', value)} />
      <Text style={styles.body}>Language preference is saved; mobile translations are not connected yet.</Text>
      <TextField label="Home location" value={draft.homeLocation} onChangeText={value => onUpdate('homeLocation', value)} />
      <TextField label="Emergency contact" value={draft.emergencyContact ?? ''} onChangeText={value => onUpdate('emergencyContact', value)} />
    </View>
    <Card><Text style={styles.title}>Accessibility needs</Text>{needs.map(([key, label]) =>
      <PreferenceSwitch key={key} label={label} description="Include this in your passenger profile"
        value={draft.accessibilityNeeds[key]} onChange={() => onToggleAccessibility(key)} />)}</Card>
    {saved ? <Text accessibilityRole="alert" style={styles.saved}>Profile saved on this device.</Text> : null}
    <PrimaryButton label="Save changes" icon="checkmark" onPress={onSave} />
  </ScreenContainer>;
}
const styles = StyleSheet.create({
  section: { gap: SPACING.md }, title: { fontSize: 20, color: COLORS.ink, fontWeight: '800' },
  body: { color: COLORS.inkSoft, fontSize: 14, lineHeight: 21, marginTop: 8 },
  saved: { color: COLORS.success, fontSize: 15, fontWeight: '700' },
});
