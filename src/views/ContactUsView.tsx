import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { AppHeader, Card, PrimaryButton, ScreenContainer, TextField } from '@/components/ui';
import { SelectField } from '@/components/SelectField';
import { useTravelmateStore } from '@/state/TravelmateStore';
import { COLORS } from '@/theme';

const KEY = 'travelmate.contact.draft.v1';
const supportEmail = process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim();
type Draft = { topic: string; email: string; message: string };
export function ContactUsView({ onBack }: { onBack: () => void }) {
  const { profile } = useTravelmateStore();
  const [draft, setDraft] = useState<Draft>({ topic: 'Account help', email: profile.emailAddress, message: '' });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(KEY).then(value => {
      if (value && !cancelled) {
        const saved = JSON.parse(value) as Draft;
        if (typeof saved.topic === 'string' && typeof saved.email === 'string' && typeof saved.message === 'string') setDraft(saved);
      }
    }).catch(() => undefined).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  function update(key: keyof Draft, value: string) { setDraft(current => ({ ...current, [key]: value })); setStatus(''); }
  async function save() {
    setBusy(true);
    try { await AsyncStorage.setItem(KEY, JSON.stringify(draft)); setStatus('Draft saved on this device. It has not been sent.'); }
    catch { setStatus('Unable to save your draft. Please try again.'); }
    finally { setBusy(false); }
  }
  async function email() {
    if (!supportEmail) return;
    setBusy(true);
    try {
      await Linking.openURL('mailto:' + supportEmail + '?subject=' + encodeURIComponent('TravelMate: ' + draft.topic)
        + '&body=' + encodeURIComponent(draft.message + '\n\nReply to: ' + draft.email));
      setStatus('Email draft opened. Review and send it from your email app.');
    } catch { setStatus('Unable to open your email app. Your message has not been sent.'); }
    finally { setBusy(false); }
  }
  return <ScreenContainer header={<AppHeader title="Contact us" subtitle="Questions, feedback and ideas" onBack={onBack} />}>
    {loading ? <ActivityIndicator color={COLORS.forest} /> : <>
      <Card><Text style={styles.title}>How can we help?</Text><Text style={styles.body}>
        {supportEmail ? 'Write your message below, then open an email to our support team.' : 'Support contact details will be available before launch. You can prepare and save a message here.'}
      </Text></Card>
      <SelectField label="Topic" value={draft.topic} onChange={value => update('topic', value)}
        options={['Account help', 'Journey planning', 'Accessibility and assistance', 'Report a problem', 'Feedback or suggestion'].map(value => ({ value, label: value }))} />
      <TextField label="Your email" keyboardType="email-address" autoCapitalize="none" value={draft.email} onChangeText={value => update('email', value)} />
      <TextField label="Message" multiline numberOfLines={5} style={{ minHeight: 150, paddingTop: 14, textAlignVertical: 'top' }}
        value={draft.message} onChangeText={value => update('message', value)} placeholder="Tell us what you need help with…" />
      {status ? <Text accessibilityRole="alert" style={styles.body}>{status}</Text> : null}
      <PrimaryButton label="Save message draft" variant="secondary" loading={busy} disabled={!draft.message.trim()} onPress={() => { void save(); }} />
      {supportEmail ? <PrimaryButton label="Email support" icon="mail-outline" loading={busy}
        disabled={!draft.message.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)}
        onPress={() => { void email(); }} /> : null}
      <Text style={styles.body}>For immediate assistance during travel, contact transport staff directly.</Text>
    </>}
  </ScreenContainer>;
}
const styles = StyleSheet.create({
  title: { color: COLORS.ink, fontWeight: '800', fontSize: 22 },
  body: { color: COLORS.inkSoft, fontSize: 15, lineHeight: 23, marginTop: 10 },
});
