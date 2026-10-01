import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';

export function WelcomeView({ onLogin }: { onLogin: () => void }) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.logo}><Ionicons name="navigate" size={34} color={COLORS.white} /></View>
        <Text style={styles.brand}>TravelMate</Text>
        <Text style={styles.title}>Accessible journeys, planned around you.</Text>
        <Text style={styles.body}>Plan bus, train and flight journeys, scan travel tickets and receive personalised assistance from departure to arrival.</Text>
      </View>
      <View style={styles.footer}>
        <View style={styles.features}>
          <View style={styles.feature}><Ionicons name="accessibility" size={19} color={COLORS.forest} /><Text style={styles.featureText}>Accessibility-first planning</Text></View>
          <View style={styles.feature}><Ionicons name="scan" size={19} color={COLORS.forest} /><Text style={styles.featureText}>Ticket intelligence</Text></View>
          <View style={styles.feature}><Ionicons name="notifications" size={19} color={COLORS.forest} /><Text style={styles.featureText}>Live journey support</Text></View>
        </View>
        <PrimaryButton label="Log in to TravelMate" icon="log-in" onPress={onLogin} />
        <Text style={styles.demo}>MVP demonstration environment</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream, justifyContent: 'space-between' },
  hero: { flex: 1, backgroundColor: COLORS.forestDeep, borderBottomLeftRadius: 42, borderBottomRightRadius: 42, padding: SPACING.xl, justifyContent: 'center' },
  logo: { width: 68, height: 68, borderRadius: 22, backgroundColor: COLORS.coral, alignItems: 'center', justifyContent: 'center' },
  brand: { color: '#9DD4C7', fontSize: 14, fontWeight: '900', letterSpacing: 1.2, marginTop: SPACING.lg },
  title: { color: COLORS.white, ...TYPOGRAPHY.display, marginTop: SPACING.sm },
  body: { color: '#C9DDD8', ...TYPOGRAPHY.body, fontSize: 15, lineHeight: 23, marginTop: SPACING.md },
  footer: { padding: SPACING.lg, gap: SPACING.lg }, features: { gap: 10 }, feature: { flexDirection: 'row', alignItems: 'center', gap: 10 }, featureText: { color: COLORS.ink, fontWeight: '700', fontSize: 13 }, demo: { color: COLORS.inkSoft, fontSize: 10, textAlign: 'center' },
});
