import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { AppHeader, Card, PrimaryButton, ScreenContainer } from '@/components/ui';
import { useTravelmateStore } from '@/state/TravelmateStore';
import type { AssistanceRequest } from '@/models/iteration';
import { COLORS, RADIUS } from '@/theme';
import { PreferenceSwitch } from '@/components/PreferenceSwitch';

const choices: { kind: AssistanceRequest['kind']; title: string; detail: string }[] = [
  { kind: 'boarding', title: 'Boarding assistance', detail: 'Help getting onto the vehicle' },
  { kind: 'wheelchair', title: 'Wheelchair space', detail: 'Request an accessible space' },
  { kind: 'urgent', title: 'Urgent help', detail: 'Request staff assistance during a journey' },
];
export function AssistanceView({ onBack, onSupport, onHelp }: { onBack?: () => void; onSupport: () => void; onHelp: () => void }) {
  const { currentJourney, profile, setProfile, requestAssistance, assistanceRequests } = useTravelmateStore();
  const [kind, setKind] = useState<AssistanceRequest['kind']>('boarding');
  const [saved, setSaved] = useState(false);
  function send() {
    if (requestAssistance(kind)) setSaved(true);
  }
  function confirm() {
    if (profile.sharingPreference === 'needed') {
      Alert.alert('Save assistance request?', 'This saves a local test request only. Nothing is sent to transport staff.',
        [{ text: 'Cancel', style: 'cancel' }, { text: 'Save request', onPress: send }]);
    } else send();
  }
  return <ScreenContainer header={<AppHeader title="Get help" subtitle="Journey assistance and quick support" onBack={onBack} />}>
    <Text style={styles.body}>Assistance testing: requests stay on this device. They are not sent to staff and do not reserve a space.</Text>
    <Card><Text style={styles.title}>What help do you need?</Text>
      {choices.map(choice => <Pressable key={choice.kind} accessibilityRole="radio"
        accessibilityState={{ selected: choice.kind === kind }}
        onPress={() => { setKind(choice.kind); setSaved(false); }}
        style={[styles.option, choice.kind === kind && styles.selected]}>
        <View style={styles.copy}><Text style={styles.label}>{choice.title}</Text><Text style={styles.body}>{choice.detail}</Text></View>
        <Text style={styles.label}>{choice.kind === kind ? '●' : '○'}</Text>
      </Pressable>)}
      {!currentJourney ? <Text style={styles.body}>Plan a journey before saving an assistance request.</Text> :
        <Text style={styles.body}>Journey: {currentJourney.origin} → {currentJourney.destination}</Text>}
      {profile.sharingPreference === 'never' ? <Text style={styles.body}>Sharing is disabled. Review support settings to allow assistance requests.</Text> : null}
      {saved ? <Text accessibilityRole="alert" style={styles.success}>Saved locally — not sent to staff.</Text> : null}
    </Card>
    <PrimaryButton label="Save test request" disabled={!currentJourney || profile.sharingPreference === 'never'} onPress={confirm} />
    <PrimaryButton label="Review support settings" variant="secondary" onPress={onSupport} />
    <Card><Text style={styles.title}>Quick journey support</Text>
      <PreferenceSwitch label="Haptic stop reminders" description="Save your vibration reminder preference."
        value={profile.assistancePreferences.vibrationGuidance}
        onChange={value => setProfile({ ...profile, assistancePreferences: { ...profile.assistancePreferences, vibrationGuidance: value } })} />
      <PreferenceSwitch label="Step-free routes" description="Prefer routes without stairs."
        value={Boolean(profile.assistancePreferences.stepFreeRoutes)}
        onChange={value => setProfile({ ...profile, assistancePreferences: { ...profile.assistancePreferences, stepFreeRoutes: value } })} />
      <PreferenceSwitch label="Extra transfer time" description="Allow extra time between services."
        value={Boolean(profile.assistancePreferences.extraTransferTime)}
        onChange={value => setProfile({ ...profile, assistancePreferences: { ...profile.assistancePreferences, extraTransferTime: value } })} />
    </Card>
    <Card><Text style={styles.title}>Help and support</Text>
      <Text style={styles.body}>Find answers about your account, getting started and planning journeys, or contact us.</Text>
      <View style={styles.gap}><PrimaryButton label="Help topics and Contact us" variant="secondary" onPress={onHelp} /></View>
      <Text style={styles.body}>Urgent help here is not an emergency service.</Text>
    </Card>
    <Text style={styles.title}>Recent local requests</Text>
    {assistanceRequests.slice(0, 5).map(request => <Card key={request.id}><Text style={styles.label}>{choices.find(choice => choice.kind === request.kind)?.title}</Text>
      <Text style={styles.body}>{new Date(request.createdAt).toLocaleString()} · Saved locally</Text></Card>)}
    {!assistanceRequests.length ? <Text style={styles.body}>No requests saved yet.</Text> : null}
  </ScreenContainer>;
}
const styles = StyleSheet.create({
  title: { color: COLORS.ink, fontSize: 21, fontWeight: '800' }, label: { color: COLORS.ink, fontSize: 17, fontWeight: '700' },
  body: { color: COLORS.inkSoft, fontSize: 14, lineHeight: 22, marginTop: 6 },
  option: { padding: 14, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.line,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  selected: { borderColor: '#144F85', borderWidth: 2, backgroundColor: COLORS.blueSoft },
  copy: { flex: 1 }, success: { color: COLORS.success, fontWeight: '700', marginTop: 12 }, gap: { marginTop: 12 },
});
