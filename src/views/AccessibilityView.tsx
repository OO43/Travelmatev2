import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader, Card, PrimaryButton, ScreenContainer } from '@/components/ui';
import type { PassengerProfile } from '@/models/passenger';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/theme';

const needLabels: Record<keyof PassengerProfile['accessibilityNeeds'], string> = {
  visualImpairment: 'Visual support',
  hearingImpairment: 'Hearing support',
  reducedMobility: 'Reduced mobility',
  wheelchairUser: 'Wheelchair access',
  cognitiveSupportRequired: 'Cognitive support',
  assistanceAnimalSupport: 'Assistance animal support',
  temporaryAccessibilityNeed: 'Temporary accessibility support',
};

const preferenceLabels: Record<keyof PassengerProfile['assistancePreferences'], string> = {
  audioGuidance: 'Audio guidance',
  vibrationGuidance: 'Vibration guidance',
  boardingAssistance: 'Boarding assistance',
  alightingAssistance: 'Alighting assistance',
  extraBoardingTime: 'Extra boarding time',
  stopAnnouncements: 'Stop announcements',
};

export function AccessibilityView({ profile, onEditProfile }: { profile: PassengerProfile; onEditProfile: () => void }) {
  const activeNeeds = Object.entries(profile.accessibilityNeeds).filter(([, enabled]) => enabled) as [keyof PassengerProfile['accessibilityNeeds'], boolean][];
  const activePreferences = Object.entries(profile.assistancePreferences).filter(([, enabled]) => enabled) as [keyof PassengerProfile['assistancePreferences'], boolean][];

  return (
    <ScreenContainer header={<AppHeader title="Accessibility" subtitle="Support tailored to every journey" />}>
      <Card style={styles.summary}>
        <View style={styles.summaryIcon}><Ionicons name="accessibility" size={28} color={COLORS.forest} /></View>
        <View style={styles.flex}><Text style={styles.summaryTitle}>Your travel support is active</Text><Text style={styles.body}>TravelMate applies these preferences when planning and monitoring journeys.</Text></View>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accessibility needs</Text>
        <Card style={styles.list}>{activeNeeds.length ? activeNeeds.map(([key]) => <PreferenceRow key={key} label={needLabels[key]} />) : <Text style={styles.body}>No accessibility needs selected.</Text>}</Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assistance preferences</Text>
        <Card style={styles.list}>{activePreferences.map(([key]) => <PreferenceRow key={key} label={preferenceLabels[key]} />)}</Card>
      </View>

      <PrimaryButton label="Edit accessibility profile" icon="create" onPress={onEditProfile} />
    </ScreenContainer>
  );
}

function PreferenceRow({ label }: { label: string }) {
  return <View style={styles.preference}><Ionicons name="checkmark-circle" size={20} color={COLORS.success} /><Text style={styles.preferenceText}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: COLORS.forestSoft },
  summaryIcon: { width: 54, height: 54, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  summaryTitle: { color: COLORS.ink, ...TYPOGRAPHY.cardTitle },
  body: { color: COLORS.inkSoft, ...TYPOGRAPHY.bodySmall, marginTop: 3 },
  section: { gap: SPACING.md },
  sectionTitle: { color: COLORS.ink, ...TYPOGRAPHY.sectionTitle },
  list: { gap: 12 },
  preference: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  preferenceText: { color: COLORS.ink, ...TYPOGRAPHY.body, fontWeight: '700' },
});

