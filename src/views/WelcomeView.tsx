import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';

export function WelcomeView({ onLogin, onSignUp }: { onLogin: () => void; onSignUp: () => void }) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    
        <View style={styles.logoPanel}>
          <Image source={require('../../assets/travelmate-logo.png')} style={styles.logo} resizeMode="contain" accessibilityLabel="TravelMate" />
        </View>
        <Text style={styles.title}>Accessible journeys, planned around you.</Text>
        
      
      <View style={styles.footer}>
        <View style={styles.features}>
          <View style={styles.feature}><Ionicons name="accessibility" size={19} color={COLORS.forest} /><Text style={styles.featureText}>Accessibility-first planning</Text></View>
          <View style={styles.feature}><Ionicons name="scan" size={19} color={COLORS.forest} /><Text style={styles.featureText}>Ticket intelligence</Text></View>
          <View style={styles.feature}><Ionicons name="notifications" size={19} color={COLORS.forest} /><Text style={styles.featureText}>Live journey support</Text></View>
        </View>
        <PrimaryButton label="Log in to TravelMate" icon="log-in" onPress={onLogin} />
        <PrimaryButton label="Sign up for TravelMate" icon="person-add" onPress={onSignUp} />
        <Text style={styles.demo}>MVP demonstration environment</Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { flexGrow: 1 },
  hero: { flexGrow: 1, padding: SPACING.xl, paddingVertical: 60, justifyContent: 'center' },
  logoPanel: { width: '100%', maxWidth: 360, alignSelf: 'center', borderRadius: 22, padding: SPACING.xs, paddingRight: SPACING.xs, marginBottom: 0, marginTop: 150, marginLeft: -20 },
  logo: { width: '100%', height: 100, justifyContent: 'center', alignSelf: 'center', padding: SPACING.xxs, },
  title: { color: COLORS.ink, ...TYPOGRAPHY.display, marginTop: SPACING.sm, marginBottom: SPACING.md, textAlign: 'center' },
  body: { color: '#C9DDD8', ...TYPOGRAPHY.body, fontSize: 15, lineHeight: 23, marginTop: SPACING.md, fontWeight: '700' },
  button: { minHeight: 52, paddingHorizontal: SPACING.lg, backgroundColor: COLORS.forest, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  footer: { padding: SPACING.lg, gap: SPACING.lg }, features: { gap: 10 }, feature: { flexDirection: 'row', alignItems: 'center', gap: 10 }, featureText: { color: COLORS.ink, fontWeight: '700', fontSize: 13 }, demo: { color: COLORS.inkSoft, fontSize: 10, textAlign: 'center' },
});
