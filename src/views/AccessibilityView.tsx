import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { AppHeader, Card, ScreenContainer } from '@/components/ui';
import { PreferenceSwitch } from '@/components/PreferenceSwitch';
import { SelectField } from '@/components/SelectField';
import type { PassengerProfile } from '@/models/passenger';
import { COLORS } from '@/theme';

const groups: { title: string; rows: [keyof PassengerProfile['assistancePreferences'], string, string][] }[] = [
  { title: 'Seeing and hearing', rows: [
    ['vibrationGuidance', 'Vibration alerts', 'Save your preference for turns, stops and updates.'],
    ['largeText', 'Large text', 'Enlarge text across the app.'],
    ['highContrast', 'High contrast', 'Increase contrast for text, fields and cards.'],
    ['audioGuidance', 'Audio guidance', 'Save your preference for spoken journey instructions.'],
    ['stopAnnouncements', 'Stop announcements', 'Save your preference for stop announcements.'],
  ] },
  { title: 'Moving and boarding', rows: [
    ['stepFreeRoutes', 'Step-free routes', 'Prefer routes without stairs.'],
    ['boardingAssistance', 'Boarding assistance', 'Save your preference for help boarding.'],
    ['alightingAssistance', 'Alighting assistance', 'Save your preference for help leaving the vehicle.'],
    ['extraBoardingTime', 'Extra boarding time', 'Allow more time getting onto the vehicle.'],
    ['extraTransferTime', 'Extra transfer time', 'Allow more time when changing services.'],
    ['prioritySeating', 'Priority seating', 'Save a priority-seating preference.'],
  ] },
];
export function AccessibilityView({ profile, saved, syncing, error, updatePreference, updateConsent, title = 'My support needs', onBack }: {
  title?: string; onBack?: () => void;
  profile: PassengerProfile; saved: boolean;
  syncing: boolean; error: string;
  updatePreference: (key: keyof PassengerProfile['assistancePreferences'], value: boolean) => void;
  updateConsent: <K extends 'sharingPreference' | 'personalisedSuggestions' | 'enhancedSupervision'>(key: K, value: PassengerProfile[K]) => void;
}) {
  return <ScreenContainer header={<AppHeader title={title} subtitle="Changes save automatically" onBack={onBack} />}>
    {syncing ? <Text accessibilityLiveRegion="polite" style={styles.syncing}>Syncing…</Text> : null}
    {saved ? <Text accessibilityRole="alert" style={styles.saved}>Saved and synced</Text> : null}
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    <Text style={styles.body}>Guidance and route preferences are recorded for integration. They do not activate live audio, reminders or staff assistance yet.</Text>
    {groups.map(group => <Card key={group.title}><Text style={styles.title}>{group.title}</Text>
      {group.rows.map(([key, label, description]) => <PreferenceSwitch key={key} label={label} description={description}
        value={Boolean(profile.assistancePreferences[key])} onChange={value => updatePreference(key, value)} />)}</Card>)}
    <Card><Text style={styles.title}>Consent and data use</Text>
      <View style={styles.gap}><SelectField label="Share needs with transport staff" value={profile.sharingPreference ?? 'needed'}
        options={[{ label: 'Only when needed', value: 'needed' }, { label: 'Every journey', value: 'always' }, { label: 'Never', value: 'never' }]}
        onChange={value => updateConsent('sharingPreference', value as PassengerProfile['sharingPreference'])} /></View>
      <PreferenceSwitch label="Personalised journey suggestions" description="Allow preferences to inform future recommendations."
        value={profile.personalisedSuggestions ?? true} onChange={value => updateConsent('personalisedSuggestions', value)} />
      <PreferenceSwitch label="Enhanced supervision" description="Consent to enhanced supervision during a confirmed journey."
        value={Boolean(profile.enhancedSupervision)} onChange={value => updateConsent('enhancedSupervision', value)} />
    </Card>
  </ScreenContainer>;
}
const styles = StyleSheet.create({ title: { fontSize: 20, fontWeight: '800', color: COLORS.ink },
  body: { fontSize: 14, lineHeight: 22, color: COLORS.inkSoft }, saved: { color: COLORS.success, fontWeight: '800' },
  syncing: { color: COLORS.forest, fontWeight: '800' }, error: { color: COLORS.error, fontWeight: '700', lineHeight: 20 },
  gap: { marginTop: 16 } });

