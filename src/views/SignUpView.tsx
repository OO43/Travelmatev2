import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextField } from '@/components/TextField';
import { COLORS, SPACING } from '@/theme';

export function SignUpView({ name, email, password, isLoading, error, onNameChange, onEmailChange, onPasswordChange, onSubmit, onBack }: {
  name: string; email: string; password: string; isLoading: boolean; error: string; onNameChange: (value: string) => void; onEmailChange: (value: string) => void; onPasswordChange: (value: string) => void; onSubmit: () => void; onBack: () => void;
}) {
  return (
    <ScreenContainer header={<AppHeader title="Hello Traveller" subtitle="Sign up to continue" onBack={onBack} />}>
      <View style={styles.intro}><View style={styles.icon}><Ionicons name="person" size={28} color={COLORS.forest} /></View><Text style={styles.title}>Passenger sign up</Text><Text style={styles.body}>Your profile keeps accessibility preferences and journey support together.</Text></View>
      <View style={styles.form}><TextField label="Name" value={name} onChangeText={onNameChange} placeholder="Enter your name" /><TextField label="Email address" value={email} onChangeText={onEmailChange} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="name@example.com" /><TextField label="Password" value={password} onChangeText={onPasswordChange} secureTextEntry autoComplete="password" placeholder="Enter password" /></View>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <PrimaryButton label="Sign up" icon="person-add" loading={isLoading} onPress={onSubmit} />
      <Card style={styles.demoCard}><Text style={styles.demoTitle}>Demo account</Text><Text style={styles.demoText}>Email: oore@travelmate.com</Text><Text style={styles.demoText}>Password: password123</Text></Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ intro: { alignItems: 'center', paddingVertical: SPACING.md }, icon: { width: 62, height: 62, borderRadius: 21, backgroundColor: COLORS.forestSoft, alignItems: 'center', justifyContent: 'center' }, title: { color: COLORS.ink, fontSize: 24, fontWeight: '900', marginTop: SPACING.md }, body: { color: COLORS.inkSoft, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 6, maxWidth: 310 }, form: { gap: SPACING.md }, error: { color: COLORS.error, fontWeight: '700', fontSize: 13 }, demoCard: { backgroundColor: COLORS.blueSoft, borderColor: '#C9D9FA', gap: 5 }, demoTitle: { color: COLORS.blue, fontWeight: '900', fontSize: 12 }, demoText: { color: COLORS.inkSoft, fontSize: 12 } });
