import { ActivityIndicator, StyleSheet, View } from 'react-native';
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
export function ManageAccountView({ draft, saved, isLoading, isSaving, error, statusMessage,
  onUpdate, onToggleAccessibility, onSave, onBack }: {
  draft: PassengerProfile; saved: boolean; isLoading: boolean; isSaving: boolean;
  error: string; statusMessage: string;
  onUpdate: <K extends keyof PassengerProfile>(key: K, value: PassengerProfile[K]) => void;
  onToggleAccessibility: (key: keyof PassengerProfile['accessibilityNeeds']) => void;
  onSave: () => void; onBack: () => void;
}) {
  return <ScreenContainer header={<AppHeader title="Manage account" subtitle="Personal information" onBack={onBack} />}>
    {isLoading ? <Card style={styles.loading}><ActivityIndicator color={COLORS.forest} />
      <Text style={styles.body}>Loading your passenger profile…</Text></Card> : null}
    <Card><Text style={styles.title}>{draft.preferredName || draft.firstName || 'Your profile'}</Text>
      <Text style={styles.body}>Your profile is stored securely through the TravelMate API and remains available on this device.</Text></Card>
    <View style={styles.section}>
      <Text style={styles.title}>Personal information</Text>
      <TextField editable={!isLoading && !isSaving} label="First name" value={draft.firstName ?? ''} onChangeText={value => onUpdate('firstName', value)} />
      <TextField editable={!isLoading && !isSaving} label="Last name" value={draft.lastName ?? ''} onChangeText={value => onUpdate('lastName', value)} />
      <TextField editable={!isLoading && !isSaving} label="Preferred name" value={draft.preferredName} onChangeText={value => onUpdate('preferredName', value)} />
      <TextField editable={!isLoading && !isSaving} label="Phone number" keyboardType="phone-pad" value={draft.phoneNumber} onChangeText={value => onUpdate('phoneNumber', value)} />
      <TextField editable={!isLoading && !isSaving} label="Email address" keyboardType="email-address" autoCapitalize="none" value={draft.emailAddress} onChangeText={value => onUpdate('emailAddress', value)} />
      <SelectField disabled={isLoading || isSaving} label="Preferred language" value={draft.preferredLanguage} options={languages.map(value => ({ value, label: value }))}
        onChange={value => onUpdate('preferredLanguage', value)} />
      <Text style={styles.body}>Language preference is saved; mobile translations are not connected yet.</Text>
      <TextField editable={!isLoading && !isSaving} label="Home location" value={draft.homeLocation} onChangeText={value => onUpdate('homeLocation', value)} />
      <TextField editable={!isLoading && !isSaving} label="Emergency contact" value={draft.emergencyContact ?? ''} onChangeText={value => onUpdate('emergencyContact', value)} />
    </View>
    <Card><Text style={styles.title}>Accessibility needs</Text>{needs.map(([key, label]) =>
      <PreferenceSwitch key={key} label={label} description="Include this in your passenger profile"
        value={draft.accessibilityNeeds[key]} onChange={() => { if (!isLoading && !isSaving) onToggleAccessibility(key); }} />)}</Card>
    {statusMessage ? <Text accessibilityLiveRegion="polite" style={styles.status}>{statusMessage}</Text> : null}
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    {saved ? <Text accessibilityRole="alert" style={styles.saved}>Profile saved and synced.</Text> : null}
    <PrimaryButton label="Save changes" icon="checkmark" loading={isSaving}
      disabled={isLoading} onPress={onSave} />
  </ScreenContainer>;
}
const styles = StyleSheet.create({
  section: { gap: SPACING.md }, title: { fontSize: 20, color: COLORS.ink, fontWeight: '800' },
  body: { color: COLORS.inkSoft, fontSize: 14, lineHeight: 21, marginTop: 8 },
  saved: { color: COLORS.success, fontSize: 15, fontWeight: '700' },
  status: { color: COLORS.forest, fontSize: 14, fontWeight: '700' },
  error: { color: COLORS.error, fontSize: 14, lineHeight: 20, fontWeight: '700' },
  loading: { alignItems: 'center' },
});
