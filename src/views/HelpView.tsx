import { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { AppHeader, Card, PrimaryButton, ScreenContainer } from '@/components/ui';
import { COLORS } from '@/theme';

const groups = [
  { title: 'Accounts', icon: 'person-outline', topics: [
    { title: 'Can’t sign in', body: 'Check your email address and password, and try again. This test build uses the demo login listed in the testing guide. Password reset and real account authentication are coming in the account backend phase.' },
    { title: 'Account settings', body: 'Open Account → Manage account to update your name, contact details, home location and preferred language. Tap Save changes. Use Account → Settings for support preferences and consent.' },
    { title: 'My changes aren’t showing', body: 'Save personal-information edits before leaving Manage account. Support settings save automatically. If syncing fails, TravelMate keeps the latest changes on this device and shows a message so you can retry later.' },
  ] },
  { title: 'Guides', icon: 'book-outline', topics: [
    { title: 'Signing up', body: 'Choose Create account from the sign-in screen, enter your name, email and password, then continue. Signup currently creates a demo session; it does not register a production account.' },
    { title: 'Getting started', body: 'Review your details in Manage account, choose your support preferences in Settings, then plan a journey from Home or Journeys. You can also scan a ticket to pre-fill the planner.' },
    { title: 'Planning your first journey', body: 'Enter From and To, choose the date and departure time, and decide whether to use accessibility preferences. Find routes, choose a route card, then confirm. Route options are previews in this test build.' },
  ] },
  { title: 'Journeys and tickets', icon: 'map-outline', topics: [
    { title: 'Scan and review a ticket', body: 'Open Scan ticket and allow camera access. Use barcode or document mode, then check the extracted origin, destination and transport mode before planning.' },
    { title: 'Saved places and recent journeys', body: 'Add a place in Journeys to quickly fill your destination next time. Move a plan to local history to keep it in Recent journeys. Archiving a local plan does not complete its backend session.' },
    { title: 'Journey status won’t load', body: 'Check your connection and try Refresh session or Try again. During local testing, your phone and the Mac running the backend must be on the same network.' },
  ] },
  { title: 'Accessibility and assistance', icon: 'accessibility-outline', topics: [
    { title: 'Choose support that works for you', body: 'Open Account → Settings to choose vibration, audio, step-free routes, boarding support and extra time. Large text and high contrast change the app display. Other choices record preferences for future live guidance.' },
    { title: 'Request help during a journey', body: 'Open Get help and choose boarding assistance, wheelchair space or urgent help. Test requests are saved locally and are not sent to staff. For immediate help, contact transport staff directly.' },
    { title: 'Control what you share', body: 'Choose Only when needed, Every journey or Never in Settings. Only when needed prompts before journey confirmation. Never creates a session without declared support categories. Changing settings does not modify a previously confirmed session.' },
  ] },
] as const;

export function HelpView({ onBack, onContact }: { onBack: () => void; onContact: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  return <ScreenContainer header={<AppHeader title="Help" subtitle="Find an answer and keep moving" onBack={onBack} />}>
    <Text style={styles.intro}>What can we help you with?</Text>
    {groups.map(group => <Card key={group.title}>
      <View style={styles.heading}><Ionicons name={group.icon} size={24} color={COLORS.forest} /><Text style={styles.title}>{group.title}</Text></View>
      {group.topics.map(topic => {
        const key = group.title + topic.title;
        return <View key={key}>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: open === key }}
            onPress={() => setOpen(open === key ? null : key)} style={styles.topic}>
            <Text style={styles.topicTitle}>{topic.title}</Text>
            <Ionicons name={open === key ? 'chevron-up' : 'chevron-forward'} size={19} color={COLORS.forest} />
          </Pressable>
          {open === key ? <Text style={styles.answer}>{topic.body}</Text> : null}
        </View>;
      })}
    </Card>)}
    <Card><Text style={styles.title}>Still need a hand?</Text>
      <Text style={styles.answer}>Tell us what happened, ask a question or share an idea to improve TravelMate.</Text>
      <View style={styles.contact}><PrimaryButton label="Contact us" icon="mail-outline" onPress={onContact} /></View>
    </Card>
  </ScreenContainer>;
}
const styles = StyleSheet.create({
  intro: { fontSize: 24, color: COLORS.ink, fontWeight: '800' },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { color: COLORS.ink, fontSize: 20, fontWeight: '800' },
  topic: { minHeight: 56, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: COLORS.line },
  topicTitle: { color: COLORS.ink, fontSize: 16, fontWeight: '700', flex: 1 },
  answer: { color: COLORS.inkSoft, fontSize: 15, lineHeight: 23, marginTop: 10, marginBottom: 10 },
  contact: { marginTop: 12 },
});
