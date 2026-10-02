import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextField } from '@/components/TextField';
import { COLORS, SPACING } from '@/theme';

export function LoginView({ email, password, isLoading, error, onEmailChange, onPasswordChange, onSubmit, onBack, onSignUp }: {
  email: string; password: string; isLoading: boolean; error: string; onEmailChange: (value: string) => void; onPasswordChange: (value: string) => void; onSubmit: () => void; onBack: () => void; onSignUp: () => void;
}) {
  return (
    <ScreenContainer header={<AppHeader title="Welcome back" subtitle="Log in to continue" onBack={onBack} />}>
      <View style={styles.intro}><View style={styles.icon}><Ionicons name="person" size={28} color={COLORS.forest} /></View><Text style={styles.title}>Passenger login</Text><Text style={styles.body}>Your profile keeps accessibility preferences and journey support together.</Text></View>
      <View style={styles.form}><TextField label="Email address" value={email} onChangeText={onEmailChange} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="name@example.com" /><TextField label="Password" value={password} onChangeText={onPasswordChange} secureTextEntry autoComplete="password" placeholder="Enter password" /></View>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <PrimaryButton label="Log in" icon="log-in" loading={isLoading} onPress={onSubmit} />
      <PrimaryButton label="Sign up" icon="person-add" variant="secondary" onPress={onSignUp} />
      <Card style={styles.demoCard}><Text style={styles.demoTitle}>Demo account</Text><Text style={styles.demoText}>Email: oore@travelmate.com</Text><Text style={styles.demoText}>Password: password123</Text></Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ intro: { alignItems: 'center', paddingVertical: SPACING.md }, icon: { width: 62, height: 62, borderRadius: 21, backgroundColor: COLORS.forestSoft, alignItems: 'center', justifyContent: 'center' }, title: { color: COLORS.ink, fontSize: 24, fontWeight: '900', marginTop: SPACING.md }, body: { color: COLORS.inkSoft, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 6, maxWidth: 310 }, form: { gap: SPACING.md }, error: { color: COLORS.error, fontWeight: '700', fontSize: 13 }, demoCard: { backgroundColor: COLORS.blueSoft, borderColor: '#C9D9FA', gap: 5 }, demoTitle: { color: COLORS.blue, fontWeight: '900', fontSize: 12 }, demoText: { color: COLORS.inkSoft, fontSize: 12 } });
